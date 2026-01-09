'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { AddCardForm } from './add-card-form';
import { EditDeckForm } from './edit-deck-form';

interface Deck {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Card {
  id: number;
  front: string;
  back: string;
  createdAt: string;
}

interface DeckPageClientProps {
  deck: Deck;
  cards: Card[];
  deckIdNum: number;
}

export function DeckPageClient({
  deck,
  cards,
  deckIdNum
}: DeckPageClientProps) {
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isEditDeckModalOpen, setIsEditDeckModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    // Auto-hide after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-md p-4 shadow-lg">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Deck Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold">{deck.title}</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDeckModalOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          {deck.description && (
            <p className="text-muted-foreground">{deck.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Created{' '}
              {new Date(deck.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
            <span>
              Updated{' '}
              {new Date(deck.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Add Card Button */}
        <div className="flex justify-end">
          <Button onClick={() => setIsAddCardModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Card
          </Button>
        </div>

        {/* Cards Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Cards ({cards.length})</h2>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                This deck doesn&apos;t have any cards yet. Add some cards to get
                started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cards.map(card => (
                <Card
                  key={card.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{card.front}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {card.back}
                    </CardDescription>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Added{' '}
                      {new Date(card.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Card Modal */}
      <AddCardForm
        deckId={deckIdNum}
        open={isAddCardModalOpen}
        onOpenChange={setIsAddCardModalOpen}
        onSuccess={showSuccessMessage}
      />

      {/* Edit Deck Modal */}
      <EditDeckForm
        deck={deck}
        open={isEditDeckModalOpen}
        onOpenChange={setIsEditDeckModalOpen}
        onSuccess={showSuccessMessage}
      />
    </div>
  );
}
