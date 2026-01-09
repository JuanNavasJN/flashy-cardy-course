import { db } from '../index';
import { decksTable } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId))
    .orderBy(desc(decksTable.updatedAt));
}

export async function getDeckById(deckId: number, userId: string) {
  const result = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.id, deckId))
    .limit(1);

  // Verify ownership
  if (result.length === 0 || result[0].userId !== userId) {
    return null;
  }

  return result[0];
}

export async function createDeck(
  userId: string,
  data: { title: string; description?: string }
) {
  return await db
    .insert(decksTable)
    .values({ userId, ...data })
    .returning();
}

export async function updateDeck(
  deckId: number,
  data: { title?: string; description?: string }
) {
  return await db
    .update(decksTable)
    .set(data)
    .where(eq(decksTable.id, deckId))
    .returning();
}

export async function deleteDeck(deckId: number) {
  return await db
    .delete(decksTable)
    .where(eq(decksTable.id, deckId))
    .returning();
}
