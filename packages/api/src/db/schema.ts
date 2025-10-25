import { pgTable, serial, timestamp, varchar, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const killfeeds = pgTable('killfeeds', {
  id: serial('id').primaryKey(),
  killer: varchar('killer', { length: 255 }).notNull(),
  victim: varchar('victim', { length: 255 }).notNull(),
  distance: varchar('distance', { length: 50 }).notNull(),
  weapon: varchar('weapon', { length: 255 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  idDiscord: varchar('id_discord', { length: 255 }),
  clan: varchar('clan', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Killfeed = typeof killfeeds.$inferSelect;
export type NewKillfeed = typeof killfeeds.$inferInsert;

// Tabela de Clãs
export const clans = pgTable('clans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  tag: varchar('tag', { length: 50 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 7 }).default('#3b82f6'), // Cor em hex para UI
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Clan = typeof clans.$inferSelect;
export type NewClan = typeof clans.$inferInsert;

// Tabela de Players
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  clanId: integer('clan_id').references(() => clans.id, { onDelete: 'set null' }),
  discordId: varchar('discord_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

// Definições de Relações
export const clansRelations = relations(clans, ({ many }) => ({
  players: many(players),
}));

export const playersRelations = relations(players, ({ one }) => ({
  clan: one(clans, {
    fields: [players.clanId],
    references: [clans.id],
  }),
}));
