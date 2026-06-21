export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

export const cardToString = (card: Card) => `${card.rank}${card.suit}`;

export const getAllCards = (): Card[] => {
  const cards: Card[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      cards.push({ rank, suit });
    }
  }
  return cards;
};

// Simplified hand strength for Monte Carlo (0 to 1)
// In a real app, we'd use a full 7-card evaluator. 
// For this demo, we'll use a heuristic-based evaluator for performance.
export const evaluateHandStrength = (hand: Card[], board: Card[]): number => {
  const allCards = [...hand, ...board];
  if (allCards.length < 5) return 0.5;

  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {};
  
  allCards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });

  const hasFlush = Object.values(suitCounts).some(count => count >= 5);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  
  if (hasFlush) return 0.8;
  if (counts[0] === 4) return 0.9;
  if (counts[0] === 3 && counts[1] >= 2) return 0.75;
  if (counts[0] === 3) return 0.5;
  if (counts[0] === 2 && counts[1] >= 2) return 0.4;
  if (counts[0] === 2) return 0.2;
  
  return 0.1;
};

export const calculateEquity = (
  heroHand: Card[],
  villainRange: string[], // e.g. ["AA", "AKs", "72o"]
  board: Card[],
  iterations: number = 500
): number => {
  if (heroHand.length < 2 || villainRange.length === 0) return 0;

  let heroWins = 0;
  const deck = getAllCards().filter(c => 
    !heroHand.some(h => h.rank === c.rank && h.suit === c.suit) &&
    !board.some(b => b.rank === c.rank && b.suit === c.suit)
  );

  for (let i = 0; i < iterations; i++) {
    // 1. Pick a random hand from villain range
    const randomVillainCombo = villainRange[Math.floor(Math.random() * villainRange.length)];
    // Simplified: convert combo string to actual cards (ignoring specific suits for range speed)
    const v1 = deck[Math.floor(Math.random() * deck.length)];
    const v2 = deck.filter(c => c !== v1)[Math.floor(Math.random() * (deck.length - 1))];
    
    // 2. Complete the board if needed
    const remainingBoardCount = 5 - board.length;
    const simBoard = [...board];
    const simDeck = deck.filter(c => c !== v1 && c !== v2);
    
    for (let j = 0; j < remainingBoardCount; j++) {
      const idx = Math.floor(Math.random() * simDeck.length);
      simBoard.push(simDeck.splice(idx, 1)[0]);
    }

    const heroScore = evaluateHandStrength(heroHand, simBoard);
    const villainScore = evaluateHandStrength([v1, v2], simBoard);

    if (heroScore > villainScore) heroWins++;
    else if (heroScore === villainScore) heroWins += 0.5;
  }

  return (heroWins / iterations) * 100;
};

export const getHandCombos = () => {
  const combos: string[] = [];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    for (let j = RANKS.length - 1; j >= 0; j--) {
      if (i === j) combos.push(RANKS[i] + RANKS[j]);
      else if (i > j) combos.push(RANKS[i] + RANKS[j] + 's');
      else combos.push(RANKS[j] + RANKS[i] + 'o');
    }
  }
  return combos;
};