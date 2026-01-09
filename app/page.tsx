'use client';

import { SignedOut } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton } from '@clerk/nextjs';

// Client component to handle authentication state and redirects
function AuthContent() {
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

export default function Home() {
  return (
    <SignedOut>
      <AuthContent />
    </SignedOut>
  );
}
