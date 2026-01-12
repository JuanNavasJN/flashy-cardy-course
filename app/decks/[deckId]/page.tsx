import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { getDeckById } from '@/src/db/queries/decks';
import { getCardsByDeckId } from '@/src/db/queries/cards';
import { DeckPageClient } from './deck-page-client';

interface DeckPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view this deck.
          </p>
        </div>
      </div>
    );
  }

  const { deckId } = await params;
  const deckIdNum = parseInt(deckId, 10);

  if (isNaN(deckIdNum)) {
    notFound();
  }

  const deck = await getDeckById(deckIdNum, userId);
  const cards = await getCardsByDeckId(deckIdNum, userId);

  if (!deck) {
    notFound();
  }

  // Convert Date objects to strings for client component
  const deckWithStringDates = {
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString()
  };

  const cardsWithStringDates = cards.map(card => ({
    ...card,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString()
  }));

  return (
    <DeckPageClient
      deck={deckWithStringDates}
      cards={cardsWithStringDates}
      deckIdNum={deckIdNum}
    />
  );
}
