'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Sparkles, Crown } from 'lucide-react';
import { AddCardForm } from './add-card-form';
import { EditDeckForm } from './edit-deck-form';
import { EditCardForm } from './edit-card-form';
import {
  deleteCardAction,
  generateFlashcardsWithAIAction
} from '@/src/actions/cards';
import { deleteDeckAction } from '@/src/actions/decks';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

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
  updatedAt: string;
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
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteDeckDialogOpen, setIsDeleteDeckDialogOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [hasAIGeneration, setHasAIGeneration] = useState(false);
  const [showDescriptionRequiredDialog, setShowDescriptionRequiredDialog] =
    useState(false);

  const { has } = useAuth();
  const router = useRouter();

  // Check AI generation feature access
  useEffect(() => {
    const checkAIFeature = async () => {
      try {
        const hasFeature = await has?.({ feature: 'ai_flashcard_generation' });
        setHasAIGeneration(!!hasFeature);
      } catch (error) {
        console.error('Error checking AI feature access:', error);
        setHasAIGeneration(false);
      }
    };

    checkAIFeature();
  }, [has]);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    // Auto-hide after 3 seconds
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteCard = async () => {
    if (!deletingCard) return;

    try {
      await deleteCardAction({ id: deletingCard.id });
      showSuccessMessage('Card deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeletingCard(null);
    } catch (error) {
      console.error('Error deleting card:', error);
      // You might want to show an error message here
    }
  };

  const handleDeleteDeck = async () => {
    try {
      await deleteDeckAction({ deckId: deckIdNum });
      showSuccessMessage('Deck deleted successfully');
      setIsDeleteDeckDialogOpen(false);
      // Redirect to dashboard after successful deletion
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error deleting deck:', error);
      // You might want to show an error message here
    }
  };

  const openDeleteDialog = (card: Card) => {
    setDeletingCard(card);
    setIsDeleteDialogOpen(true);
  };

  const handleGenerateAI = async () => {
    if (!hasAIGeneration) {
      // Redirect to pricing page for free users
      router.push('/pricing');
      return;
    }

    // Check if deck has a description (required for AI generation)
    if (!deck.description || deck.description.trim() === '') {
      setShowDescriptionRequiredDialog(true);
      return;
    }

    setIsGeneratingAI(true);
    try {
      const result = await generateFlashcardsWithAIAction({
        deckId: deckIdNum,
        count: 20
      });

      showSuccessMessage(
        `Successfully generated ${result.count} cards with AI!`
      );
    } catch (error) {
      console.error('Error generating AI cards:', error);
      // You might want to show an error message here
    } finally {
      setIsGeneratingAI(false);
    }
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDeckDialogOpen(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            {cards.length > 0 && (
              <Button size="sm" asChild>
                <a href={`/decks/${deckIdNum}/study`}>Study Cards</a>
              </Button>
            )}
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

        {/* Add Card and AI Generation Buttons */}
        <div className="flex justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  className="bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-0"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                </Button>
              </TooltipTrigger>
              {!hasAIGeneration && (
                <TooltipContent>
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    <span>Pro feature - Upgrade to generate AI flashcards</span>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg">{card.front}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCard(card)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(card)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {card.back}
                    </CardDescription>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Updated{' '}
                      {new Date(card.updatedAt).toLocaleDateString('en-US', {
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

      {/* Edit Card Modal */}
      {editingCard && (
        <EditCardForm
          card={editingCard}
          open={editingCard !== null}
          onOpenChange={open => {
            if (!open) setEditingCard(null);
          }}
          onSuccess={showSuccessMessage}
        />
      )}

      {/* Delete Card Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this card? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deletingCard && (
            <div className="py-4">
              <div className="bg-muted p-4 rounded-md">
                <div className="font-medium text-sm mb-2">
                  {deletingCard.front}
                </div>
                <div className="text-sm text-muted-foreground">
                  {deletingCard.back}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingCard(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCard}>
              Delete Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Deck Confirmation Dialog */}
      <Dialog
        open={isDeleteDeckDialogOpen}
        onOpenChange={setIsDeleteDeckDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deck</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this deck? This action cannot be
              undone and will also delete all {cards.length} card
              {cards.length !== 1 ? 's' : ''} in this deck.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-md">
              <div className="font-medium text-sm mb-2">{deck.title}</div>
              {deck.description && (
                <div className="text-sm text-muted-foreground">
                  {deck.description}
                </div>
              )}
              <div className="text-sm text-muted-foreground mt-2">
                {cards.length} card{cards.length !== 1 ? 's' : ''} will be
                deleted
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDeckDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDeck}>
              Delete Deck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Description Required for AI Generation Dialog */}
      <Dialog
        open={showDescriptionRequiredDialog}
        onOpenChange={setShowDescriptionRequiredDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Description Required</DialogTitle>
            <DialogDescription>
              To generate flashcards with AI, your deck needs a description that
              explains what the deck is about. This helps the AI create relevant
              and accurate flashcards.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-md">
              <div className="font-medium text-sm mb-2">
                Current deck: {deck.title}
              </div>
              <div className="text-sm text-muted-foreground">
                {deck.description ? (
                  <>Description: {deck.description}</>
                ) : (
                  <>No description provided</>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDescriptionRequiredDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowDescriptionRequiredDialog(false);
                setIsEditDeckModalOpen(true);
              }}
            >
              Add Description
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
