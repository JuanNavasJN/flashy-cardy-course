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
import { getUserDecks } from '@/src/db/queries/decks';

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const decks = await getUserDecks(userId);

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
          <h2 className="text-2xl font-semibold">Your Decks</h2>

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
