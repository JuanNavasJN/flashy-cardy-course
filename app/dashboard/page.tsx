import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button className="w-full" size="sm">
                Create New Deck
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Browse Decks
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Study Session
              </Button>
            </div>
          </div>

          {/* Recent Decks */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Decks</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No decks created yet. Create your first deck to get started!
            </p>
            <Button variant="outline" size="sm">
              Create Your First Deck
            </Button>
          </div>

          {/* Progress Stats */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Cards Studied</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Decks Completed</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Study Streak</span>
                <span className="font-medium">0 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
