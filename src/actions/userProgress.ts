'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { markCardLearned } from '@/src/db/queries/userProgress';
import { revalidatePath } from 'next/cache';

// Zod schema for marking a card as learned
const markCardLearnedSchema = z.object({
  cardId: z.number().int().positive(),
  learned: z.boolean().default(true)
});

type MarkCardLearnedInput = z.infer<typeof markCardLearnedSchema>;

export async function markCardLearnedAction(input: MarkCardLearnedInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Validate input with Zod
  const validatedData = markCardLearnedSchema.parse(input);

  try {
    const result = await markCardLearned(validatedData.cardId, userId, validatedData.learned);

    // Revalidate the study page to reflect the updated progress
    // We need to get the deck ID to revalidate the correct path
    // For now, we'll revalidate a broader path pattern
    revalidatePath(`/decks/*/study`);

    return {
      success: true,
      progress: result[0]
    };
  } catch (error) {
    console.error('Error updating card progress:', error);
    throw new Error('Failed to update card progress');
  }
}