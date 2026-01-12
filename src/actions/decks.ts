'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createDeck, updateDeck, deleteDeck } from '@/src/db/queries/decks';
import { deleteCardsByDeckId } from '@/src/db/queries/cards';
import { decksTable } from '@/src/db/schema';
import { and, eq } from 'drizzle-orm';
import { db } from '@/src/db';
import { revalidatePath } from 'next/cache';

// Zod schema for creating a deck
const createDeckSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional()
});

// Zod schema for updating a deck
const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional()
});

// Zod schema for deleting a deck
const deleteDeckSchema = z.object({
  deckId: z.number().int().positive()
});

type CreateDeckInput = z.infer<typeof createDeckSchema>;
type UpdateDeckInput = z.infer<typeof updateDeckSchema>;
type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function createDeckAction(input: CreateDeckInput) {
  const { userId, has } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Validate input with Zod
  const validatedData = createDeckSchema.parse(input);

  // Check billing limits for free users
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });

  if (!hasUnlimitedDecks) {
    // Check current deck count for free users
    const userDecks = await db
      .select()
      .from(decksTable)
      .where(eq(decksTable.userId, userId));

    if (userDecks.length >= 3) {
      throw new Error(
        'Free plan limited to 3 decks. Upgrade to Pro for unlimited decks.'
      );
    }
  }

  try {
    // Create the deck
    const result = await createDeck(userId, {
      title: validatedData.title,
      description: validatedData.description || null
    });

    if (result.length === 0) {
      throw new Error('Failed to create deck');
    }

    // Revalidate the dashboard to show the new deck
    revalidatePath('/dashboard');

    return {
      success: true,
      deck: result[0]
    };
  } catch (error) {
    console.error('Error creating deck:', error);
    throw new Error('Failed to create deck');
  }
}

export async function updateDeckAction(input: UpdateDeckInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Validate input with Zod
  const validatedData = updateDeckSchema.parse(input);

  try {
    // Verify ownership and update deck
    const result = await updateDeck(validatedData.deckId, {
      title: validatedData.title,
      description: validatedData.description || null
    });

    if (result.length === 0) {
      throw new Error('Deck not found or access denied');
    }

    // Revalidate the deck page to show the updated deck
    revalidatePath(`/decks/${validatedData.deckId}`);

    return {
      success: true,
      deck: result[0]
    };
  } catch (error) {
    console.error('Error updating deck:', error);
    throw new Error('Failed to update deck');
  }
}

export async function deleteDeckAction(input: DeleteDeckInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Validate input with Zod
  const validatedData = deleteDeckSchema.parse(input);

  try {
    // First verify ownership of the deck
    const deckCheck = await db
      .select()
      .from(decksTable)
      .where(
        and(
          eq(decksTable.id, validatedData.deckId),
          eq(decksTable.userId, userId)
        )
      )
      .limit(1);

    if (deckCheck.length === 0) {
      throw new Error('Deck not found or access denied');
    }

    // Delete all cards associated with this deck first
    await deleteCardsByDeckId(validatedData.deckId);

    // Then delete the deck
    const result = await deleteDeck(validatedData.deckId);

    if (result.length === 0) {
      throw new Error('Failed to delete deck');
    }

    // Revalidate the dashboard to remove the deleted deck
    revalidatePath('/dashboard');

    return {
      success: true,
      deck: result[0]
    };
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw new Error('Failed to delete deck');
  }
}
