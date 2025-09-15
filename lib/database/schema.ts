/**
 * Database Schema for Homicide Media Tracker
 * 
 * This schema defines the SQLite tables that mirror the PostgreSQL structure
 * from the original server implementation, optimized for local storage and sync.
 */

import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Articles table - media articles about homicides
export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: text('article_id').notNull().unique(), // Generated from URL, author, title
  newsReportId: text('news_report_id'),
  newsReportUrl: text('news_report_url'),
  newsReportHeadline: text('news_report_headline'),
  dateOfPublication: text('date_of_publication'), // Store as ISO string
  author: text('author'),
  wireService: text('wire_service'),
  language: text('language'),
  typeOfSource: text('type_of_source'),
  newsReportPlatform: text('news_report_platform'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  syncStatus: text('sync_status').default('pending'), // 'pending', 'synced', 'conflict'
  lastSyncAt: text('last_sync_at'),
});

// Victims table - victim information for homicide cases
export const victims = sqliteTable('victims', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: text('article_id').notNull(), // Foreign key to articles
  victimName: text('victim_name'),
  dateOfDeath: text('date_of_death'), // Store as ISO string
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
  lastSyncAt: text('last_sync_at'),
});

// Perpetrators table - suspect/perpetrator information
export const perpetrators = sqliteTable('perpetrators', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: text('article_id').notNull(), // Foreign key to articles
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
  lastSyncAt: text('last_sync_at'),
});

// Users table - for multi-user sync capabilities
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique(),
  username: text('username').notNull(),
  email: text('email'),
  role: text('role').default('researcher'), // 'admin', 'researcher'
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  lastLoginAt: text('last_login_at'),
});

// Sync metadata table - tracks synchronization state
export const syncMetadata = sqliteTable('sync_metadata', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tableName: text('table_name').notNull(),
  lastSyncAt: text('last_sync_at'),
  lastSyncHash: text('last_sync_hash'), // Hash of last synced data
  conflictCount: integer('conflict_count').default(0),
  pendingChanges: integer('pending_changes').default(0),
  remoteUrl: text('remote_url'), // URL of external server
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(false),
});

// Configuration table - app settings and preferences
export const appConfig = sqliteTable('app_config', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  valueType: text('value_type').default('string'), // 'string', 'number', 'boolean', 'json'
  description: text('description'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Export schema type for TypeScript inference
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

export type Victim = typeof victims.$inferSelect;
export type NewVictim = typeof victims.$inferInsert;

export type Perpetrator = typeof perpetrators.$inferSelect;
export type NewPerpetrator = typeof perpetrators.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type SyncMetadata = typeof syncMetadata.$inferSelect;
export type NewSyncMetadata = typeof syncMetadata.$inferInsert;

export type AppConfig = typeof appConfig.$inferSelect;
export type NewAppConfig = typeof appConfig.$inferInsert;
