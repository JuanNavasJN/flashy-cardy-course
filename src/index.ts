import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { decksTable, cardsTable, userProgressTable } from './db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

async function main() {
  console.log('Setting up database connection...');

  // Example: Create a deck
  const deck = await db.insert(decksTable).values({
    userId: 'user_123', // This would come from Clerk
    title: 'Indonesian Language Basics',
    description: 'Learn basic Indonesian vocabulary from English',
  }).returning();

  console.log('Deck created:', deck);

  // Example: Create cards for the deck
  const cards = await db.insert(cardsTable).values([
    {
      deckId: deck[0].id,
      front: 'Dog',
      back: 'Anjing',
    },
    {
      deckId: deck[0].id,
      front: 'Cat',
      back: 'Kucing',
    },
    {
      deckId: deck[0].id,
      front: 'House',
      back: 'Rumah',
    },
  ]).returning();

  console.log('Cards created:', cards.length);

  // Example: Get all decks
  const decks = await db.select().from(decksTable);
  console.log('All decks:', decks);

  // Example: Get cards for a specific deck
  const deckCards = await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deck[0].id));

  console.log('Cards for deck:', deckCards);

  // Example: Update a card
  await db
    .update(cardsTable)
    .set({
      back: 'Anjing (Indonesian word for dog)',
    })
    .where(eq(cardsTable.id, cards[0].id));

  console.log('Card updated!');

  // Example: Mark a card as learned for a user
  await db.insert(userProgressTable).values({
    userId: 'user_123', // This would come from Clerk
    cardId: cards[0].id,
    isLearned: true,
  });

  console.log('User progress recorded!');

  // Example: Get user progress
  const progress = await db
    .select()
    .from(userProgressTable)
    .where(eq(userProgressTable.userId, 'user_123'));

  console.log('User progress:', progress);

  console.log('Database setup complete!');
}

main().catch(console.error);