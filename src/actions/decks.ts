'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { updateDeck } from '@/src/db/queries/decks';
import { revalidatePath } from 'next/cache';

// Zod schema for updating a deck
const updateDeckSchema = z.object({
  deckId: z.number().int().positive(),
  title: z.string().min(1, 'Title cannot be empty').max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional()
});

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

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