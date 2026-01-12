'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { markCardLearnedAction } from '@/src/actions/userProgress';

interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProgress {
  cardId: number;
  isLearned: boolean;
  lastReviewedAt: string | null;
  front: string;
  back: string;
  deckId: number;
}

interface Deck {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StudyPageClientProps {
  deck: Deck;
  cards: Card[];
  userProgress: UserProgress[];
  deckIdNum: number;
}

export function StudyPageClient({ deck, cards, userProgress, deckIdNum }: StudyPageClientProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCards, setLearnedCards] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Initialize learned cards from user progress
  useEffect(() => {
    const learned = new Set(
      userProgress
        .filter(progress => progress.isLearned)
        .map(progress => progress.cardId)
    );
    setLearnedCards(learned);
  }, [userProgress]);

  const currentCard = cards[currentCardIndex];
  const isCurrentCardLearned = learnedCards.has(currentCard?.id || 0);

  // Calculate progress
  const learnedCount = learnedCards.size;
  const totalCount = cards.length;
  const progressPercentage = totalCount > 0 ? (learnedCount / totalCount) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleToggleLearned = async () => {
    if (!currentCard) return;

    const newLearnedState = !isCurrentCardLearned;
    setIsLoading(true);

    try {
      await markCardLearnedAction({
        cardId: currentCard.id,
        learned: newLearnedState
      });

      // Update local state
      const newLearnedCards = new Set(learnedCards);
      if (newLearnedState) {
        newLearnedCards.add(currentCard.id);
      } else {
        newLearnedCards.delete(currentCard.id);
      }
      setLearnedCards(newLearnedCards);
    } catch (error) {
      console.error('Failed to update card progress:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'l':
        case 'L':
          event.preventDefault();
          handleToggleLearned();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCardIndex, isFlipped, isCurrentCardLearned, cards.length]);

  if (!currentCard) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">No cards available to study.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href={`/decks/${deckIdNum}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deck
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{deck.title}</h1>
            <p className="text-muted-foreground">Study Session</p>
          </div>
        </div>

        {/* Progress */}
        <div className="text-right">
          <div className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {totalCount}
          </div>
          <div className="text-sm text-muted-foreground">
            Learned: {learnedCount} / {totalCount} ({Math.round(progressPercentage)}%)
          </div>
          <div className="w-32 bg-secondary rounded-full h-2 mt-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="flex justify-center mb-8">
        <Card
          className="w-full max-w-2xl h-96 cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={handleFlip}
        >
          <CardContent className="flex items-center justify-center h-full p-8">
            <div className={`text-center transition-transform duration-300 ${isFlipped ? 'scale-105' : ''}`}>
              <div className="text-sm text-muted-foreground mb-4">
                {isFlipped ? 'Back' : 'Front'}
              </div>
              <div className="text-xl font-medium leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          size="lg"
        >
          <ChevronLeft className="h-5 w-5 mr-2" />
          Previous
        </Button>

        <Button
          variant="outline"
          onClick={handleFlip}
          size="lg"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Flip Card
        </Button>

        <Button
          variant={isCurrentCardLearned ? "default" : "outline"}
          onClick={handleToggleLearned}
          disabled={isLoading}
          size="lg"
        >
          {isCurrentCardLearned ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Learned
            </>
          ) : (
            <>
              <Circle className="h-5 w-5 mr-2" />
              Mark as Learned
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentCardIndex === cards.length - 1}
          size="lg"
        >
          Next
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Click the card to flip • Use arrow keys to navigate • Press Space or Enter to flip • Press L to toggle learned status</p>
      </div>
    </div>
  );
}