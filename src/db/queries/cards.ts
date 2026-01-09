import { db } from '../index';
import { cardsTable, decksTable } from '../schema';
import { eq, and, desc } from 'drizzle-orm';

export async function getCardsByDeckId(deckId: number, userId: string) {
  // First verify the user owns the deck
  const deckCheck = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1);

  if (deckCheck.length === 0) {
    return [];
  }

  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId))
    .orderBy(desc(cardsTable.createdAt));
}

export async function getCardById(cardId: number, userId: string) {
  const result = await db
    .select()
    .from(cardsTable)
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(and(eq(cardsTable.id, cardId), eq(decksTable.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createCard(
  deckId: number,
  userId: string,
  data: { front: string; back: string }
) {
  // First verify the user owns the deck
  const deckCheck = await db
    .select()
    .from(decksTable)
    .where(and(eq(decksTable.id, deckId), eq(decksTable.userId, userId)))
    .limit(1);

  if (deckCheck.length === 0) {
    throw new Error('Deck not found or access denied');
  }

  return await db
    .insert(cardsTable)
    .values({ deckId, ...data })
    .returning();
}

export async function updateCard(
  cardId: number,
  data: { front?: string; back?: string }
) {
  return await db
    .update(cardsTable)
    .set(data)
    .where(eq(cardsTable.id, cardId))
    .returning();
}

export async function deleteCard(cardId: number) {
  return await db
    .delete(cardsTable)
    .where(eq(cardsTable.id, cardId))
    .returning();
}
