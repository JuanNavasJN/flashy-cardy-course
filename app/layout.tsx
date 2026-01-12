import type { Metadata } from 'next';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Flashy Cardy Course',
  description: 'Learn with interactive flash cards'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en">
        <body className={`${poppins.variable} antialiased dark`}>
          <header className="flex justify-between items-center p-4 gap-4">
            <Link href="/dashboard">
              <h1 className="text-xl font-semibold hover:text-blue-400 transition-colors cursor-pointer">
                Flashy Cardy Course
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <SignedIn>
                <Link href="/pricing">
                  <Button variant="outline" size="sm">
                    Pricing
                  </Button>
                </Link>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Button asChild variant="default">
                  <SignInButton mode="modal" />
                </Button>
                <Button asChild variant="secondary">
                  <SignUpButton mode="modal" />
                </Button>
              </SignedOut>
            </div>
          </header>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
