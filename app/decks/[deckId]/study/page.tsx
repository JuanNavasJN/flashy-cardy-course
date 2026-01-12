import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { getDeckById } from '@/src/db/queries/decks';
import { getCardsByDeckId } from '@/src/db/queries/cards';
import { getUserCardProgress } from '@/src/db/queries/userProgress';
import { StudyPageClient } from './study-page-client';

interface StudyPageProps {
  params: Promise<{ deckId: string }>;
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to study this deck.
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
  const userProgress = await getUserCardProgress(userId, deckIdNum);

  if (!deck) {
    notFound();
  }

  if (cards.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{deck.title}</h1>
          <p className="text-muted-foreground">
            This deck doesn't have any cards yet. Add some cards to start studying.
          </p>
          <a
            href={`/decks/${deckId}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Go to Deck
          </a>
        </div>
      </div>
    );
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

  const progressWithStringDates = userProgress.map(progress => ({
    ...progress,
    lastReviewedAt: progress.lastReviewedAt?.toISOString() || null
  }));

  return (
    <StudyPageClient
      deck={deckWithStringDates}
      cards={cardsWithStringDates}
      userProgress={progressWithStringDates}
      deckIdNum={deckIdNum}
    />
  );
}