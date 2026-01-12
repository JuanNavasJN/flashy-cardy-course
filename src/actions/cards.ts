'use server';

import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { createCard, updateCard } from '@/src/db/queries/cards';
import { cardsTable, decksTable } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '../db';
import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';

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

// Zod schema for AI flashcard generation
const generateFlashcardsSchema = z.object({
  deckId: z.number().int().positive(),
  count: z.number().int().min(1).max(50).default(20)
});

type GenerateFlashcardsInput = z.infer<typeof generateFlashcardsSchema>;

// Zod schema for AI response validation
const flashcardSchema = z.object({
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(500)
});

const flashcardsResponseSchema = z.object({
  flashcards: z.array(flashcardSchema).min(1).max(50)
});

export async function generateFlashcardsWithAIAction(
  input: GenerateFlashcardsInput
) {
  const { userId, has } = await auth();

  if (!userId) {
    throw new Error('Authentication required');
  }

  // Check billing feature access
  if (!has({ feature: 'ai_flashcard_generation' })) {
    throw new Error('AI flashcard generation requires Pro plan');
  }

  // Validate input
  const validatedInput = generateFlashcardsSchema.parse(input);

  try {
    // Verify deck ownership
    const deckCheck = await db
      .select()
      .from(decksTable)
      .where(
        and(
          eq(decksTable.id, validatedInput.deckId),
          eq(decksTable.userId, userId)
        )
      )
      .limit(1);

    if (deckCheck.length === 0) {
      throw new Error('Deck not found or access denied');
    }

    const deck = deckCheck[0];

    // Generate AI flashcards
    const prompt = `
Generate ${validatedInput.count} flashcards about: ${deck.title}

${deck.description ? `Additional context: ${deck.description}` : ''}

Requirements:
- Each flashcard should have a clear question/term on the front
- Each flashcard should have a comprehensive but concise answer on the back
- Focus on key concepts, definitions, and important facts related to "${
      deck.title
    }"
- Ensure flashcards are educational and accurate
- Use clear, understandable language suitable for learning
- Cover different aspects and difficulty levels of the topic
`;

    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      output: Output.object({
        schema: flashcardsResponseSchema
      }),
      prompt,
      temperature: 0.7
    });

    // Create cards in database
    const cardsToCreate = output.flashcards.map(
      (card: { front: string; back: string }) => ({
        deckId: validatedInput.deckId,
        front: card.front,
        back: card.back
      })
    );

    const createdCards = await Promise.all(
      cardsToCreate.map(
        (cardData: { deckId: number; front: string; back: string }) =>
          createCard(cardData.deckId, userId, cardData)
      )
    );

    // Revalidate the deck page to show the new cards
    revalidatePath(`/decks/${validatedInput.deckId}`);

    return {
      success: true,
      cards: createdCards.flat(),
      count: createdCards.flat().length
    };
  } catch (error) {
    console.error('AI flashcard generation failed:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}
