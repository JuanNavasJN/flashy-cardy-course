import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground">
            Unlock more features and create unlimited flashcards
          </p>
        </div>
        <PricingTable />
      </div>
    </div>
  );
}
