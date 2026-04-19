// Schema and types only (shared)
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
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
  victimAlias: text('victim_alias'),
  mergedIntoId: text('merged_into_id'),
  mergedAt: text('merged_at'),
  mergeAudit: text('merge_audit', { mode: 'json' }),
  promotionAudit: text('promotion_audit', { mode: 'json' }),
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
  victim_alias TEXT,
  merged_into_id TEXT,
  merged_at TEXT,
  merge_audit TEXT,
  promotion_audit TEXT,
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
  perpetratorAlias: text('perpetrator_alias'),
  mergedIntoId: text('merged_into_id'),
  mergedAt: text('merged_at'),
  mergeAudit: text('merge_audit', { mode: 'json' }),
  promotionAudit: text('promotion_audit', { mode: 'json' }),
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
  perpetrator_alias TEXT,
  merged_into_id TEXT,
  merged_at TEXT,
  merge_audit TEXT,
  promotion_audit TEXT,
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

// --- Schema constraints ---
export const schemaConstraints = sqliteTable('schema_constraint', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profileId: text('profile_id').notNull(),
  type: text('type').notNull(),
  requiredFields: text('required_fields', { mode: 'json' }).notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  profileTypeUnique: uniqueIndex('schema_constraint_profile_type_unique').on(
    table.profileId,
    table.type,
  ),
}));

export const migrationSchemaConstraints = `CREATE TABLE IF NOT EXISTS schema_constraint (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id TEXT NOT NULL,
  type TEXT NOT NULL,
  required_fields TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, type)
)`;

export type SchemaConstraint = typeof schemaConstraints.$inferSelect;
export type NewSchemaConstraint = typeof schemaConstraints.$inferInsert;

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

// --- Report Annotations ---
export const reportAnnotations = sqliteTable('report_annotations', {
  id: text('id').primaryKey(),
  sourceArticleId: text('source_article_id').notNull(),
  targetArticleId: text('target_article_id').notNull(),
  relationType: text('relation_type').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  syncStatus: text('sync_status').default('pending'),
  failureCount: integer('failure_count').default(0),
});

export const migrationReportAnnotations = `CREATE TABLE IF NOT EXISTS report_annotations (
  id TEXT PRIMARY KEY,
  source_article_id TEXT NOT NULL,
  target_article_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  sync_status TEXT DEFAULT 'pending',
  failure_count INTEGER DEFAULT 0
)`;

export type ReportAnnotation = typeof reportAnnotations.$inferSelect;
export type NewReportAnnotation = typeof reportAnnotations.$inferInsert;

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

// --- Actors ---
export const actors = sqliteTable('actor', {
  id: text('id').primaryKey(),
  canonicalLabel: text('canonical_label'),
  actorKind: text('actor_kind').notNull().default('unknown'),
  status: text('status').notNull().default('active'),
  schemaProfileId: text('schema_profile_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const migrationActors = `CREATE TABLE IF NOT EXISTS actor (
  id TEXT PRIMARY KEY,
  canonical_label TEXT,
  actor_kind TEXT NOT NULL DEFAULT 'unknown',
  status TEXT NOT NULL DEFAULT 'active',
  schema_profile_id TEXT REFERENCES schema_profile(id),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

export type Actor = typeof actors.$inferSelect;
export type NewActor = typeof actors.$inferInsert;

export const actorAliases = sqliteTable('actor_alias', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').notNull(),
  aliasValue: text('alias_value').notNull(),
  aliasNormalized: text('alias_normalized').notNull(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const migrationActorAliases = `CREATE TABLE IF NOT EXISTS actor_alias (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actor(id),
  alias_value TEXT NOT NULL,
  alias_normalized TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

export type ActorAlias = typeof actorAliases.$inferSelect;
export type NewActorAlias = typeof actorAliases.$inferInsert;

export const actorIdentifiers = sqliteTable('actor_identifier', {
  id: text('id').primaryKey(),
  actorId: text('actor_id').notNull(),
  namespace: text('namespace').notNull(),
  value: text('value').notNull(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const migrationActorIdentifiers = `CREATE TABLE IF NOT EXISTS actor_identifier (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES actor(id),
  namespace TEXT NOT NULL,
  value TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)`;

export type ActorIdentifier = typeof actorIdentifiers.$inferSelect;
export type NewActorIdentifier = typeof actorIdentifiers.$inferInsert;

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
  `CREATE INDEX IF NOT EXISTS idx_report_annotations_source_article_id ON report_annotations(source_article_id)`,
  `CREATE INDEX IF NOT EXISTS idx_report_annotations_target_article_id ON report_annotations(target_article_id)`,
  `CREATE INDEX IF NOT EXISTS idx_schema_constraint_profile_type ON schema_constraint(profile_id, type)`,
  `CREATE INDEX IF NOT EXISTS idx_actor_canonical_label ON actor(canonical_label)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_actor_alias_actor_normalized ON actor_alias(actor_id, alias_normalized)`,
  `CREATE INDEX IF NOT EXISTS idx_actor_alias_value ON actor_alias(alias_value)`,
  `CREATE INDEX IF NOT EXISTS idx_actor_identifier_namespace_value ON actor_identifier(namespace, value)`,
  `CREATE INDEX IF NOT EXISTS idx_actor_identifier_actor_id ON actor_identifier(actor_id)`,
];

export const migrationVictimAliasColumn = `ALTER TABLE victims ADD COLUMN victim_alias TEXT`;
export const migrationPerpetratorAliasColumn = `ALTER TABLE perpetrators ADD COLUMN perpetrator_alias TEXT`;
export const migrationVictimMergedIntoColumn = `ALTER TABLE victims ADD COLUMN merged_into_id TEXT`;
export const migrationPerpetratorMergedIntoColumn = `ALTER TABLE perpetrators ADD COLUMN merged_into_id TEXT`;
export const migrationVictimMergedAtColumn = `ALTER TABLE victims ADD COLUMN merged_at TEXT`;
export const migrationPerpetratorMergedAtColumn = `ALTER TABLE perpetrators ADD COLUMN merged_at TEXT`;
export const migrationVictimMergeAuditColumn = `ALTER TABLE victims ADD COLUMN merge_audit TEXT`;
export const migrationPerpetratorMergeAuditColumn = `ALTER TABLE perpetrators ADD COLUMN merge_audit TEXT`;
export const migrationVictimPromotionAuditColumn = `ALTER TABLE victims ADD COLUMN promotion_audit TEXT`;
export const migrationPerpetratorPromotionAuditColumn = `ALTER TABLE perpetrators ADD COLUMN promotion_audit TEXT`;
// NOTE: merge_audit and promotion_audit are JSON-serialized payloads stored as TEXT.

export const migrationBackfillVictimsToActors = `INSERT OR IGNORE INTO actor (
  id,
  canonical_label,
  actor_kind,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  NULLIF(TRIM(victim_name), ''),
  'person',
  CASE WHEN merged_into_id IS NOT NULL THEN 'merged' ELSE 'active' END,
  COALESCE(created_at, CURRENT_TIMESTAMP),
  COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM victims`;

export const migrationBackfillPerpetratorsToActors = `INSERT OR IGNORE INTO actor (
  id,
  canonical_label,
  actor_kind,
  status,
  created_at,
  updated_at
)
SELECT
  id,
  NULLIF(TRIM(perpetrator_name), ''),
  'person',
  CASE WHEN merged_into_id IS NOT NULL THEN 'merged' ELSE 'active' END,
  COALESCE(created_at, CURRENT_TIMESTAMP),
  COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM perpetrators`;

export const migrationBackfillVictimIdentifiers = `INSERT OR IGNORE INTO actor_identifier (
  id,
  actor_id,
  namespace,
  value,
  is_primary,
  created_at,
  updated_at
)
SELECT
  'legacy_victim_id:' || id,
  id,
  'legacy_victim_id',
  id,
  1,
  COALESCE(created_at, CURRENT_TIMESTAMP),
  COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM victims`;

export const migrationBackfillPerpIdentifiers = `INSERT OR IGNORE INTO actor_identifier (
  id,
  actor_id,
  namespace,
  value,
  is_primary,
  created_at,
  updated_at
)
SELECT
  'legacy_perp_id:' || id,
  id,
  'legacy_perp_id',
  id,
  1,
  COALESCE(created_at, CURRENT_TIMESTAMP),
  COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM perpetrators`;

export const migrationBackfillPrimaryNameIdentifiers = `INSERT OR IGNORE INTO actor_identifier (
  id,
  actor_id,
  namespace,
  value,
  is_primary,
  created_at,
  updated_at
)
SELECT
  'primary_name:' || id,
  id,
  'primary_name',
  COALESCE(TRIM(canonical_label), ''),
  1,
  COALESCE(created_at, CURRENT_TIMESTAMP),
  COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM actor
WHERE canonical_label IS NOT NULL AND TRIM(canonical_label) != ''`;

export const migrationBackfillVictimAliases = `WITH RECURSIVE split(actor_id, alias, rest, created_at, updated_at) AS (
  SELECT
    id,
    '',
    COALESCE(victim_alias, '') || '|',
    COALESCE(created_at, CURRENT_TIMESTAMP),
    COALESCE(updated_at, CURRENT_TIMESTAMP)
  FROM victims
  WHERE victim_alias IS NOT NULL AND TRIM(victim_alias) != ''
  UNION ALL
  SELECT
    actor_id,
    TRIM(substr(rest, 1, instr(rest, '|') - 1)),
    substr(rest, instr(rest, '|') + 1),
    created_at,
    updated_at
  FROM split
  WHERE rest != ''
)
INSERT OR IGNORE INTO actor_alias (
  id,
  actor_id,
  alias_value,
  alias_normalized,
  is_primary,
  created_at,
  updated_at
)
SELECT
  'victim_alias:' || actor_id || ':' || lower(alias),
  actor_id,
  alias,
  lower(alias),
  0,
  created_at,
  updated_at
FROM split
WHERE alias != ''`;

export const migrationBackfillPerpAliases = `WITH RECURSIVE split(actor_id, alias, rest, created_at, updated_at) AS (
  SELECT
    id,
    '',
    COALESCE(perpetrator_alias, '') || '|',
    COALESCE(created_at, CURRENT_TIMESTAMP),
    COALESCE(updated_at, CURRENT_TIMESTAMP)
  FROM perpetrators
  WHERE perpetrator_alias IS NOT NULL AND TRIM(perpetrator_alias) != ''
  UNION ALL
  SELECT
    actor_id,
    TRIM(substr(rest, 1, instr(rest, '|') - 1)),
    substr(rest, instr(rest, '|') + 1),
    created_at,
    updated_at
  FROM split
  WHERE rest != ''
)
INSERT OR IGNORE INTO actor_alias (
  id,
  actor_id,
  alias_value,
  alias_normalized,
  is_primary,
  created_at,
  updated_at
)
SELECT
  'perp_alias:' || actor_id || ':' || lower(alias),
  actor_id,
  alias,
  lower(alias),
  0,
  created_at,
  updated_at
FROM split
WHERE alias != ''`;

// --- Unified migration array ---
export const migrations = [
  migrationParticipants,
  migrationActors,
  migrationActorAliases,
  migrationActorIdentifiers,
  migrationArticles,
  migrationEvents,
  migrationReportAnnotations,
  migrationVictims,
  migrationPerpetrators,
  migrationVictimAliasColumn,
  migrationPerpetratorAliasColumn,
  migrationVictimMergedIntoColumn,
  migrationPerpetratorMergedIntoColumn,
  migrationVictimMergedAtColumn,
  migrationPerpetratorMergedAtColumn,
  migrationVictimMergeAuditColumn,
  migrationPerpetratorMergeAuditColumn,
  migrationVictimPromotionAuditColumn,
  migrationPerpetratorPromotionAuditColumn,
  migrationBackfillVictimsToActors,
  migrationBackfillPerpetratorsToActors,
  migrationBackfillVictimIdentifiers,
  migrationBackfillPerpIdentifiers,
  migrationBackfillPrimaryNameIdentifiers,
  migrationBackfillVictimAliases,
  migrationBackfillPerpAliases,
  migrationSchemaConstraints,
  migrationUsers,
  migrationSyncQueue,
  migrationAppConfig,
  ...migrationIndexes,
];
