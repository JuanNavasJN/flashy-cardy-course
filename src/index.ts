import 'dotenv/config';
import { createDeck, getUserDecks } from './db/queries/decks';
import { createCard, getCardsByDeckId, updateCard } from './db/queries/cards';
import { getUserProgress, markCardLearned } from './db/queries/userProgress';

async function main() {
  console.log('Setting up database connection...');

  const userId = 'user_123'; // This would come from Clerk

  // Example: Create a deck
  const deck = await createDeck(userId, {
    title: 'Indonesian Language Basics',
    description: 'Learn basic Indonesian vocabulary from English',
  });

  console.log('Deck created:', deck);

  // Example: Create cards for the deck
  const card1 = await createCard(deck[0].id, userId, {
    front: 'Dog',
    back: 'Anjing',
  });

  const card2 = await createCard(deck[0].id, userId, {
    front: 'Cat',
    back: 'Kucing',
  });

  const card3 = await createCard(deck[0].id, userId, {
    front: 'House',
    back: 'Rumah',
  });

  console.log('Cards created: 3');

  // Example: Get all decks for user
  const decks = await getUserDecks(userId);
  console.log('User decks:', decks);

  // Example: Get cards for a specific deck
  const deckCards = await getCardsByDeckId(deck[0].id, userId);
  console.log('Cards for deck:', deckCards);

  // Example: Update a card
  if (card1.length > 0) {
    await updateCard(card1[0].id, userId, {
      back: 'Anjing (Indonesian word for dog)',
    });
    console.log('Card updated!');
  }

  // Example: Mark a card as learned for a user
  if (card1.length > 0) {
    await markCardLearned(card1[0].id, userId, true);
    console.log('User progress recorded!');
  }

  // Example: Get user progress
  const progress = await getUserProgress(userId);
  console.log('User progress:', progress);

  console.log('Database setup complete!');
}

main().catch(console.error);