import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import {
  articles,
  victims,
  perpetrators,
  users,
  events,
  participants,
  appConfig,
  syncQueue,
  Article,
  NewArticle,
  Victim,
  NewVictim,
  Perpetrator,
  NewPerpetrator,
  User,
  NewUser,
  Event,
  NewEvent,
  Participant,
  NewParticipant,
  SyncQueue,
  NewSyncQueue,
  AppConfig,
  NewAppConfig,
} from './schema';

// Shared config type
export interface DatabaseConfig {
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

class DatabaseManagerClient {
  async ensureDatabaseInitialised(): Promise<void> {
    if (!this.localDb) {
      await this.initialiseLocal();
    }
  }
  private localClient: ReturnType<typeof createClient> | null = null;
  private localDb: ReturnType<typeof drizzle> | null = null;
  private config: DatabaseConfig;

  constructor() {
    // Browser: use localStorage or other web APIs for config if needed
    this.config = {
      local: {
        path: 'file:news-report-tracker.db',
      },
      sync: {
        enabled: false,
        conflictResolution: 'local',
      },
    };
  }

  async initialiseLocal(): Promise<void> {
    this.localClient = createClient({ url: this.config.local.path });
    this.localDb = drizzle(this.localClient, {
      schema: {
        articles,
        victims,
        perpetrators,
        users,
        events,
        participants,
        appConfig,
        syncQueue,
      },
    });
  }

  getLocal() {
    if (!this.localDb) {
      throw new Error(
        'Local database not initialised. Call initialiseLocal() first.',
      );
    }
    return this.localDb;
  }

  getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  async addToSyncQueue(method: string, endpoint: string, body?: any) {
    const db = this.getLocal();
    await db.insert(syncQueue).values({
      method,
      endpoint,
      body,
      syncStatus: 'pending',
      queuedAt: new Date().toISOString(),
      failureCount: 0,
    });
  }
}

export const dbm = new DatabaseManagerClient();
export { DatabaseManagerClient };
