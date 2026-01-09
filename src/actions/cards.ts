'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createCard } from '@/src/db/queries/cards';
import { revalidatePath } from 'next/cache';

// Zod schema for creating a card
const createCardSchema = z.object({
  deckId: z.number().int().positive(),
  front: z.string().min(1, 'Front side cannot be empty').max(500, 'Front side is too long'),
  back: z.string().min(1, 'Back side cannot be empty').max(500, 'Back side is too long')
});

type CreateCardInput = z.infer<typeof createCardSchema>;

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