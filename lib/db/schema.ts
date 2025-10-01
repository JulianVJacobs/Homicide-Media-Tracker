// Schema and types only (shared)
import {
  sqliteTable,
  text,
  integer,
  // type SQLiteTableWithColumns
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// interface DBTable {
//   table: SQLiteTable<T>,
//   migration: string,
//   indexes?: string[]
// }

// --- Articles ---
export const articles = sqliteTable('articles', {
  id: text('id').primaryKey(),
  newsReportId: text('news_report_id'),
  newsReportUrl: text('news_report_url'),
  newsReportHeadline: text('news_report_headline'),
  dateOfPublication: text('date_of_publication'),
  author: text('author'),
  wireService: text('wire_service'),
  language: text('language'),
  typeOfSource: text('type_of_source'),
  newsReportPlatform: text('news_report_platform'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  syncStatus: text('sync_status').default('pending'),
  failureCount: integer('failure_count').default(0),
  lastSyncAt: text('last_sync_at'),
});

export const migrationArticles = `CREATE TABLE IF NOT EXISTS articles (
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
  failure_count INTEGER DEFAULT 0,
  last_sync_at TEXT
)`;

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

// --- Victims ---
export const victims = sqliteTable('victims', {
  id: text('id').primaryKey(),
  articleId: text('article_id').notNull(),
  victimName: text('victim_name'),
  dateOfDeath: text('date_of_death'),
  placeOfDeathProvince: text('place_of_death_province'),
  placeOfDeathTown: text('place_of_death_town'),
  typeOfLocation: text('type_of_location'),
  policeStation: text('police_station'),
  sexualAssault: text('sexual_assault'),
  genderOfVictim: text('gender_of_victim'),
  raceOfVictim: text('race_of_victim'),
  ageOfVictim: integer('age_of_victim'),
  ageRangeOfVictim: text('age_range_of_victim'),
  modeOfDeathSpecific: text('mode_of_death_specific'),
  modeOfDeathGeneral: text('mode_of_death_general'),
  typeOfMurder: text('type_of_murder'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  syncStatus: text('sync_status').default('pending'),
  failureCount: integer('failure_count').default(0),
  lastSyncAt: text('last_sync_at'),
});

export const migrationVictims = `CREATE TABLE IF NOT EXISTS victims (
  id TEXT PRIMARY KEY,
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
  failure_count INTEGER DEFAULT 0,
  last_sync_at TEXT
)`;

export type Victim = typeof victims.$inferSelect;
export type NewVictim = typeof victims.$inferInsert;

// --- Perpetrators ---
export const perpetrators = sqliteTable('perpetrators', {
  id: text('id').primaryKey(),
  articleId: text('article_id').notNull(),
  perpetratorName: text('perpetrator_name'),
  perpetratorRelationshipToVictim: text('perpetrator_relationship_to_victim'),
  suspectIdentified: text('suspect_identified'),
  suspectArrested: text('suspect_arrested'),
  suspectCharged: text('suspect_charged'),
  conviction: text('conviction'),
  sentence: text('sentence'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  syncStatus: text('sync_status').default('pending'),
  failureCount: integer('failure_count').default(0),
  lastSyncAt: text('last_sync_at'),
});

export const migrationPerpetrators = `CREATE TABLE IF NOT EXISTS perpetrators (
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
  failure_count INTEGER DEFAULT 0,
  last_sync_at TEXT
)`;

export type Perpetrator = typeof perpetrators.$inferSelect;
export type NewPerpetrator = typeof perpetrators.$inferInsert;

// --- Users ---
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  username: text('username').notNull(),
  email: text('email'),
  role: text('role').default('researcher'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text('last_login_at'),
});

export const migrationUsers = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'researcher',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_login_at TEXT
)`;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// --- Events ---
export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  eventTypes: text('event_types', { mode: 'json' }).notNull(),
  articleIds: text('article_ids', { mode: 'json' }).notNull(),
  participantIds: text('participant_ids', { mode: 'json' }),
  details: text('details', { mode: 'json' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  syncStatus: text('sync_status').default('pending'),
  failureCount: integer('failure_count').default(0),
});

export const migrationEvents = `CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  event_types TEXT,
  article_ids TEXT NOT NULL,
  participant_ids TEXT,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  sync_status TEXT DEFAULT 'pending',
  failure_count INTEGER DEFAULT 0
)`;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

// --- Participants ---
export const participants = sqliteTable('participants', {
  id: text('id').primaryKey(),
  role: text('role').notNull(),
  details: text('details', { mode: 'json' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const migrationParticipants = `CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  details TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;

// --- Sync Queue ---
export const syncQueue = sqliteTable('sync_queue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  method: text('method').notNull(),
  endpoint: text('endpoint').notNull(),
  body: text('body', { mode: 'json' }),
  syncStatus: text('sync_status').default('pending'),
  queuedAt: text('queued_at').default(sql`CURRENT_TIMESTAMP`),
  failureCount: integer('failure_count').default(0),
  lastError: text('last_error'),
});

export const migrationSyncQueue = `CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  method TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  body TEXT,
  sync_status TEXT DEFAULT 'pending',
  queued_at TEXT DEFAULT CURRENT_TIMESTAMP,
  failure_count INTEGER DEFAULT 0,
  last_error TEXT
)`;

export type SyncQueue = typeof syncQueue.$inferSelect;
export type NewSyncQueue = typeof syncQueue.$inferInsert;

// --- App Config ---
export const appConfig = sqliteTable('app_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  valueType: text('value_type').default('string'),
  description: text('description'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const migrationAppConfig = `CREATE TABLE IF NOT EXISTS app_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  value_type TEXT DEFAULT 'string',
  description TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

export type AppConfig = typeof appConfig.$inferSelect;
export type NewAppConfig = typeof appConfig.$inferInsert;

// --- Index migrations ---
export const migrationIndexes = [
  `CREATE INDEX IF NOT EXISTS idx_articles_article_id ON articles(id)`,
  `CREATE INDEX IF NOT EXISTS idx_victims_article_id ON victims(article_id)`,
  `CREATE INDEX IF NOT EXISTS idx_perpetrators_article_id ON perpetrators(article_id)`,
  `CREATE INDEX IF NOT EXISTS idx_articles_sync_status ON articles(sync_status)`,
];

// --- Unified migration array ---
export const migrations = [
  migrationParticipants,
  migrationArticles,
  migrationEvents,
  migrationVictims,
  migrationPerpetrators,
  migrationUsers,
  migrationSyncQueue,
  migrationAppConfig,
  ...migrationIndexes,
];
