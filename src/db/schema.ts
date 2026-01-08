import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  boolean
} from 'drizzle-orm/pg-core';

// Decks table - users create their own decks
export const decksTable = pgTable('decks', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull()
});

// Cards table - individual flash cards within decks
export const cardsTable = pgTable('cards', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deckId: integer()
    .references(() => decksTable.id)
    .notNull(),
  front: text().notNull(), // Question/prompt side (e.g., "Dog" or "When was the battle of hastings?")
  back: text().notNull(), // Answer side (e.g., "Anjing" or "1066")
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull()
});

// User progress table (for tracking card learning progress)
export const userProgressTable = pgTable('user_progress', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar({ length: 255 }).notNull(), // Clerk user ID
  cardId: integer()
    .references(() => cardsTable.id)
    .notNull(),
  isLearned: boolean().default(false).notNull(),
  lastReviewedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull()
});
