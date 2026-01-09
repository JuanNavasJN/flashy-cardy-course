import { db } from '../index';
import { userProgressTable, cardsTable, decksTable } from '../schema';
import { eq, and, desc, count } from 'drizzle-orm';

export async function getUserProgress(userId: string) {
  return await db
    .select()
    .from(userProgressTable)
    .where(eq(userProgressTable.userId, userId))
    .orderBy(desc(userProgressTable.updatedAt));
}

export async function getProgressForCard(cardId: number, userId: string) {
  const result = await db
    .select()
    .from(userProgressTable)
    .where(and(
      eq(userProgressTable.cardId, cardId),
      eq(userProgressTable.userId, userId)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserProgress(
  cardId: number,
  userId: string,
  data: { isLearned?: boolean; lastReviewedAt?: Date }
) {
  // First check if progress record exists
  const existing = await getProgressForCard(cardId, userId);

  if (existing) {
    return await db
      .update(userProgressTable)
      .set(data)
      .where(and(
        eq(userProgressTable.cardId, cardId),
        eq(userProgressTable.userId, userId)
      ))
      .returning();
  } else {
    return await db
      .insert(userProgressTable)
      .values({
        userId,
        cardId,
        isLearned: data.isLearned || false,
        lastReviewedAt: data.lastReviewedAt
      })
      .returning();
  }
}

export async function markCardLearned(cardId: number, userId: string, learned: boolean = true) {
  return await updateUserProgress(cardId, userId, {
    isLearned: learned,
    lastReviewedAt: new Date()
  });
}

export async function getLearnedCardsCount(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(userProgressTable)
    .where(and(
      eq(userProgressTable.userId, userId),
      eq(userProgressTable.isLearned, true)
    ));

  return result[0]?.count || 0;
}

export async function getUserCardProgress(userId: string, deckId?: number) {
  let query = db
    .select({
      cardId: userProgressTable.cardId,
      isLearned: userProgressTable.isLearned,
      lastReviewedAt: userProgressTable.lastReviewedAt,
      front: cardsTable.front,
      back: cardsTable.back,
      deckId: cardsTable.deckId
    })
    .from(userProgressTable)
    .innerJoin(cardsTable, eq(userProgressTable.cardId, cardsTable.id))
    .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
    .where(eq(userProgressTable.userId, userId));

  if (deckId) {
    query = query.where(eq(cardsTable.deckId, deckId));
  }

  return await query.orderBy(desc(userProgressTable.lastReviewedAt));
}