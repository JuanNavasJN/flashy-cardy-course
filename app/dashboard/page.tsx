import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserDecks } from '@/src/db/queries/decks';
import { CreateDeckDialog } from './create-deck-dialog';
import { CrownIcon } from 'lucide-react';

export default async function Dashboard() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect('/');
  }

  const decks = await getUserDecks(userId);
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const atDeckLimit = !hasUnlimitedDecks && decks.length >= 3;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your flashcard dashboard. Manage your decks and start
            learning!
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Decks</h2>
            <div className="flex items-center gap-4">
              {!hasUnlimitedDecks && (
                <div className="text-sm text-muted-foreground">
                  {decks.length}/3 decks used
                </div>
              )}
              {atDeckLimit ? (
                <Link href="/pricing">
                  <Button>
                    <CrownIcon className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
              ) : (
                <CreateDeckDialog />
              )}
            </div>
          </div>

          {decks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                You don&apos;t have any decks yet. Create your first deck to get
                started!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {decks.map(deck => (
                <Link
                  key={deck.id}
                  href={`/decks/${deck.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{deck.title}</CardTitle>
                      {deck.description && (
                        <CardDescription>{deck.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Updated{' '}
                        {new Date(deck.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
