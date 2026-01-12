'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createCard, updateCard } from '@/src/db/queries/cards';
import { cardsTable, decksTable } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '../db';

// Zod schema for creating a card
const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z
    .string()
    .min(1, 'Front side cannot be empty')
    .max(500, 'Front side is too long'),
  back: z
    .string()
    .min(1, 'Back side cannot be empty')
    .max(500, 'Back side is too long')
});

type CreateCardInput = z.infer<typeof createCardSchema>;

// Zod schema for updating a card
const updateCardSchema = z.object({
  id: z.number().int().positive(),
  front: z
    .string()
    .min(1, 'Front side cannot be empty')
    .max(500, 'Front side is too long'),
  back: z
    .string()
    .min(1, 'Back side cannot be empty')
    .max(500, 'Back side is too long')
});

type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function createCardAction(input: CreateCardInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Validate input with Zod
  const validatedData = createCardSchema.parse(input);

  try {
    const result = await createCard(validatedData.deckId, userId, {
      front: validatedData.front,
      back: validatedData.back
    });

    // Revalidate the deck page to show the new card
    revalidatePath(`/decks/${validatedData.deckId}`);

    return {
      success: true,
      card: result[0]
    };
  } catch (error) {
    console.error('Error creating card:', error);
    throw new Error('Failed to create card');
  }
}

export async function updateCardAction(input: UpdateCardInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Validate input with Zod
  const validatedData = updateCardSchema.parse(input);

  try {
    // First verify the user owns the card through deck ownership
    const cardCheck = await db
      .select()
      .from(cardsTable)
      .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
      .where(
        and(eq(cardsTable.id, validatedData.id), eq(decksTable.userId, userId))
      )
      .limit(1);

    if (cardCheck.length === 0) {
      throw new Error('Card not found or access denied');
    }

    const result = await updateCard(validatedData.id, {
      front: validatedData.front,
      back: validatedData.back
    });

    // Revalidate the deck page to show the updated card
    revalidatePath(`/decks/${cardCheck[0].cards.deckId}`);

    return {
      success: true,
      card: result[0]
    };
  } catch (error) {
    console.error('Error updating card:', error);
    throw new Error('Failed to update card');
  }
}

// Zod schema for deleting a card
const deleteCardSchema = z.object({
  id: z.number().int().positive()
});

type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCardAction(input: DeleteCardInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Validate input with Zod
  const validatedData = deleteCardSchema.parse(input);

  try {
    // First verify the user owns the card through deck ownership and get the deck ID for revalidation
    const cardCheck = await db
      .select()
      .from(cardsTable)
      .innerJoin(decksTable, eq(cardsTable.deckId, decksTable.id))
      .where(
        and(eq(cardsTable.id, validatedData.id), eq(decksTable.userId, userId))
      )
      .limit(1);

    if (cardCheck.length === 0) {
      throw new Error('Card not found or access denied');
    }

    const deckId = cardCheck[0].cards.deckId;

    const result = await db
      .delete(cardsTable)
      .where(eq(cardsTable.id, validatedData.id))
      .returning();

    if (result.length === 0) {
      throw new Error('Failed to delete card');
    }

    // Revalidate the deck page to remove the deleted card
    revalidatePath(`/decks/${deckId}`);

    return {
      success: true,
      card: result[0]
    };
  } catch (error) {
    console.error('Error deleting card:', error);
    throw new Error('Failed to delete card');
  }
}
