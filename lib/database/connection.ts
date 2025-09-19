/**
 * Database Connection Manager for Homicide Media Tracker
 *
 * This module manages LibSQL connections for both local and remote storage
 * with cross-platform compatibility.
 */

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

import * as schema from './schema';

// Database configuration type
interface DatabaseConfig {
  local: {
    path: string;
    backupPath?: string;
  };
  remote?: {
    url: string;
    authToken?: string;
    syncInterval?: number; // minutes
  };
  sync: {
    enabled: boolean;
    conflictResolution: 'local' | 'remote' | 'manual';
  };
}

class DatabaseManager {
  private localClient: ReturnType<typeof createClient> | null = null;
  private localDb: ReturnType<typeof drizzle> | null = null;
  private remoteClient: ReturnType<typeof createClient> | null = null;
  private remoteDrizzle: ReturnType<typeof drizzle> | null = null;
  private config: DatabaseConfig;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialise default configuration
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): DatabaseConfig {
    const isPackaged = app?.isPackaged ?? false;
    const userDataPath = app?.getPath('userData') ?? './data';

    // Ensure data directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    const dbPath = path.join(userDataPath, 'homicide-tracker.db');
    const backupPath = path.join(userDataPath, 'homicide-tracker-backup.db');

    return {
      local: {
        path: dbPath,
        backupPath: backupPath,
      },
      sync: {
        enabled: false,
        conflictResolution: 'local',
      },
    };
  }

  /**
   * Initialise the local SQLite database using LibSQL
   */
  async initialiseLocal(): Promise<void> {
    try {
      console.log(`Initialising local database at: ${this.config.local.path}`);
      console.log(`App packaged state: ${app?.isPackaged ?? 'unknown'}`);
      console.log(`User data path: ${app?.getPath('userData') ?? 'unknown'}`);
      console.log(`Node.js version: ${process.version}`);
      console.log(`Platform: ${process.platform} ${process.arch}`);

      // Ensure the database directory exists
      const dbDir = path.dirname(this.config.local.path);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Enhanced LibSQL client creation with comprehensive error handling
      const isPackaged = app?.isPackaged ?? false;

      console.log(`Creating libsql client (packaged: ${isPackaged})`);
      console.log(`Database path: ${this.config.local.path}`);

      // Multiple fallback strategies for libsql client creation
      const clientStrategies = [
        // Strategy 1: Standard file URL for packaged apps
        () => {
          if (isPackaged) {
            const normalizedPath = this.config.local.path.replace(/\\/g, '/');
            return createClient({ url: `file:${normalizedPath}` });
          } else {
            return createClient({ url: `file:${this.config.local.path}` });
          }
        },

        // Strategy 2: Simple path without file: prefix
        () => createClient({ url: this.config.local.path }),

        // Strategy 3: File protocol with triple slash
        () => {
          const normalizedPath = this.config.local.path.replace(/\\/g, '/');
          return createClient({ url: `file:///${normalizedPath}` });
        },

        // Strategy 4: Absolute path with explicit options
        () =>
          createClient({
            url: path.resolve(this.config.local.path),
            authToken: undefined,
          }),
      ];

      let clientCreated = false;
      let lastError: Error | null = null;

      for (let i = 0; i < clientStrategies.length; i++) {
        try {
          console.log(`Attempting libsql client creation strategy ${i + 1}...`);
          this.localClient = clientStrategies[i]();
          console.log(
            `LibSQL client created successfully with strategy ${i + 1}`,
          );
          clientCreated = true;
          break;
        } catch (strategyError: unknown) {
          const errorMessage =
            strategyError instanceof Error
              ? strategyError.message
              : String(strategyError);
          console.error(`Strategy ${i + 1} failed:`, errorMessage);
          lastError =
            strategyError instanceof Error
              ? strategyError
              : new Error(String(strategyError));
          continue;
        }
      }

      if (!clientCreated || !this.localClient) {
        throw new Error(
          `All libsql client creation strategies failed. Last error: ${lastError?.message}`,
        );
      }

      // Initialise Drizzle ORM
      console.log('Initialising Drizzle ORM...');
      this.localDb = drizzle(this.localClient, { schema });

      // Run migrations to create tables
      console.log('Running database migrations...');
      await this.runMigrations();

      // Insert default configuration
      console.log('Initialising app configuration...');
      await this.initialiseAppConfig();

      console.log('Local database initialised successfully');
    } catch (error) {
      console.error('Failed to initialise local database:', error);
      console.error('Database path:', this.config.local.path);
      console.error('App packaged state:', app?.isPackaged ?? 'unknown');
      console.error('User data path:', app?.getPath('userData') ?? 'unknown');
      console.error(
        'Error stack:',
        error instanceof Error ? error.stack : 'No stack trace',
      );

      // Don't throw in packaged environment - allow app to start without database
      if (app?.isPackaged) {
        console.warn(
          'Database initialisation failed in packaged environment. App will continue without database functionality.',
        );
        return;
      }

      throw error;
    }
  }

  /**
   * Configure remote database connection for sync
   */
  async configureRemote(url: string, authToken?: string): Promise<void> {
    try {
      this.remoteClient = createClient({
        url,
        authToken,
      });

      this.remoteDrizzle = drizzle(this.remoteClient, { schema });

      this.config.remote = {
        url,
        authToken,
        syncInterval: 15, // Default 15 minutes
      };

      this.config.sync.enabled = true;

      // Test connection
      await this.testRemoteConnection();

      console.log('Remote database configured successfully');
    } catch (error) {
      console.error('Failed to configure remote database:', error);
      this.config.sync.enabled = false;
      throw error;
    }
  }

  /**
   * Test remote database connection
   */
  private async testRemoteConnection(): Promise<boolean> {
    if (!this.remoteDrizzle) {
      return false;
    }

    try {
      // Simple query to test connection
      await this.remoteDrizzle.select().from(schema.appConfig).limit(1);
      return true;
    } catch (error) {
      console.error('Remote connection test failed:', error);
      return false;
    }
  }

  /**
   * Run database migrations to create tables
   */
  private async runMigrations(): Promise<void> {
    if (!this.localDb) {
      throw new Error('Local database not initialised');
    }

    const migrations = [
      // Generalized Participants table
      `CREATE TABLE IF NOT EXISTS participants (
        id TEXT PRIMARY KEY,
        role TEXT NOT NULL,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,
      // Articles table
      `CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        news_report_id TEXT,
        news_report_url TEXT,
        news_report_headline TEXT,
        date_of_publication TEXT,
        author TEXT,
        wire_service TEXT,
        language TEXT,
        type_of_source TEXT,
        news_report_platform TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        last_sync_at TEXT
      )`,

      // Events table (matches API payload)
      `CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        event_types TEXT,
        article_ids TEXT NOT NULL,
        participant_ids TEXT,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Victims table
      `CREATE TABLE IF NOT EXISTS victims (
        id TRXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        victim_name TEXT,
        date_of_death TEXT,
        place_of_death_province TEXT,
        place_of_death_town TEXT,
        type_of_location TEXT,
        police_station TEXT,
        sexual_assault TEXT,
        gender_of_victim TEXT,
        race_of_victim TEXT,
        age_of_victim INTEGER,
        age_range_of_victim TEXT,
        mode_of_death_specific TEXT,
        mode_of_death_general TEXT,
        type_of_murder TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        last_sync_at TEXT,
        FOREIGN KEY (article_id) REFERENCES articles (id)
      )`,

      // Perpetrators table
      `CREATE TABLE IF NOT EXISTS perpetrators (
        id TEXT PRIMARY KEY,
        article_id TEXT NOT NULL,
        perpetrator_name TEXT,
        perpetrator_relationship_to_victim TEXT,
        suspect_identified TEXT,
        suspect_arrested TEXT,
        suspect_charged TEXT,
        conviction TEXT,
        sentence TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        sync_status TEXT DEFAULT 'pending',
        last_sync_at TEXT,
        FOREIGN KEY (article_id) REFERENCES articles (id)
      )`,

      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'researcher',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login_at TEXT
      )`,

      // Sync metadata table
      `CREATE TABLE IF NOT EXISTS sync_metadata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        last_sync_at TEXT,
        last_sync_hash TEXT,
        conflict_count INTEGER DEFAULT 0,
        pending_changes INTEGER DEFAULT 0,
        remote_url TEXT,
        is_enabled INTEGER DEFAULT 0
      )`,

      // App configuration table
      `CREATE TABLE IF NOT EXISTS app_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT,
        value_type TEXT DEFAULT 'string',
        description TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Indexes for performance
      `CREATE INDEX IF NOT EXISTS idx_articles_article_id ON articles(id)`,
      `CREATE INDEX IF NOT EXISTS idx_victims_article_id ON victims(article_id)`,
      `CREATE INDEX IF NOT EXISTS idx_perpetrators_article_id ON perpetrators(article_id)`,
      `CREATE INDEX IF NOT EXISTS idx_articles_sync_status ON articles(sync_status)`,
    ];

    for (const migration of migrations) {
      try {
        await this.localClient!.execute(migration);
      } catch (error) {
        console.error('Migration failed:', migration, error);
        throw error;
      }
    }
  }

  /**
   * Initialise default app configuration
   */
  private async initialiseAppConfig(): Promise<void> {
    if (!this.localDb) return;

    const defaultConfigs = [
      {
        key: 'app_version',
        value: '1.0.0',
        description: 'Application version',
      },
      {
        key: 'default_user_id',
        value: 'local-user',
        description: 'Default user ID for local usage',
      },
      {
        key: 'sync_enabled',
        value: 'false',
        valueType: 'boolean',
        description: 'Whether remote sync is enabled',
      },
      {
        key: 'last_backup',
        value: new Date().toISOString(),
        description: 'Last database backup timestamp',
      },
    ];

    for (const config of defaultConfigs) {
      try {
        await this.localDb
          .insert(schema.appConfig)
          .values(config)
          .onConflictDoNothing();
      } catch (error) {
        // Ignore conflicts for existing configs
      }
    }
  }

  /**
   * Get local database instance (Drizzle ORM)
   */
  getLocal() {
    if (!this.localDb) {
      throw new Error(
        'Local database not initialised. Call initialiseLocal() first.',
      );
    }
    return this.localDb;
  }

  /**
   * Get remote database instance (Drizzle ORM)
   */
  getRemote() {
    if (!this.remoteDrizzle) {
      throw new Error(
        'Remote database not configured. Call configureRemote() first.',
      );
    }
    return this.remoteDrizzle;
  }

  /**
   * Create a database backup
   */
  async createBackup(): Promise<string> {
    if (!this.localDb || !this.config.local.backupPath) {
      throw new Error('Cannot create backup: database not initialised');
    }

    const backupPath = `${this.config.local.backupPath}-${Date.now()}`;

    try {
      // With LibSQL, we need to copy the database file
      // First, close the connection temporarily
      if (this.localClient) {
        this.localClient.close();
      }

      // Copy the database file
      fs.copyFileSync(this.config.local.path, backupPath);

      // Reconnect to the database
      this.localClient = createClient({
        url: `file:${this.config.local.path}`,
      });
      this.localDb = drizzle(this.localClient, { schema });

      console.log(`Database backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  /**
   * Start automatic sync if enabled
   */
  startAutoSync(): void {
    if (!this.config.sync.enabled || !this.config.remote?.syncInterval) {
      return;
    }

    const intervalMs = this.config.remote.syncInterval * 60 * 1000;

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncWithRemote();
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }, intervalMs);

    console.log(
      `Auto sync started (interval: ${this.config.remote.syncInterval} minutes)`,
    );
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto sync stopped');
    }
  }

  /**
   * Synchronise local database with remote
   */
  async syncWithRemote(): Promise<void> {
    if (!this.config.sync.enabled || !this.localDb || !this.remoteDrizzle) {
      throw new Error('Sync not properly configured');
    }

    console.log('Starting database synchronization...');

    // This is a simplified sync - in production you'd want more sophisticated conflict resolution
    try {
      // Sync articles
      await this.syncTable('articles');
      await this.syncTable('victims');
      await this.syncTable('perpetrators');

      console.log('Database synchronization completed');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  /**
   * Sync specific table (simplified implementation)
   */
  private async syncTable(tableName: string): Promise<void> {
    // This is a basic implementation - you'd want more sophisticated sync logic
    console.log(`Syncing table: ${tableName}`);

    // For now, just update sync status
    if (this.localDb) {
      const now = new Date().toISOString();
      // Update sync metadata
      // This would contain the actual sync logic in a production implementation
    }
  }

  /**
   * Close database connections
   */
  async close(): Promise<void> {
    this.stopAutoSync();

    if (this.remoteClient) {
      this.remoteClient.close();
    }

    if (this.localClient) {
      this.localClient.close();
    }

    console.log('Database connections closed');
  }

  /**
   * Get database configuration
   */
  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  /**
   * Update database configuration
   */
  updateConfig(updates: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Export singleton instance
export const databaseManager = new DatabaseManager();
export { DatabaseManager };
export type { DatabaseConfig };
