import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';

export default async function Home() {
  const user = await currentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold">FlashyCardy</h1>
          <p className="text-xl text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <SignInButton mode="modal" />
          </Button>
          <Button asChild variant="outline" size="lg">
            <SignUpButton mode="modal" />
          </Button>
        </div>
      </div>
    </div>
  );
}
