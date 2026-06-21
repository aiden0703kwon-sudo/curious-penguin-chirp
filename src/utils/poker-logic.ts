export type Suit = 's' | 'h' | 'd' | 'c';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const SUITS: Suit[] = ['s', 'h', 'd', 'c'];

const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

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

// Improved hand evaluation
export const evaluateHandStrength = (hand: Card[], board: Card[]): number => {
  const allCards = [...hand, ...board];
  if (allCards.length < 5) return 0.5;

  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {};
  const values = allCards.map(c => RANK_VALUE[c.rank]).sort((a, b) => b - a);
  const uniqueValues = Array.from(new Set(values));
  
  allCards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });

  const hasFlush = Object.values(suitCounts).some(count => count >= 5);
  
  // Straight detection
  let hasStraight = false;
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
      hasStraight = true;
      break;
    }
  }
  // Wheel straight (A-2-3-4-5)
  if (!hasStraight && uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
    hasStraight = true;
  }

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  
  if (hasFlush && hasStraight) return 0.95; // Straight Flush
  if (counts[0] === 4) return 0.9; // Quads
  if (counts[0] === 3 && counts[1] >= 2) return 0.85; // Full House
  if (hasFlush) return 0.8; // Flush
  if (hasStraight) return 0.75; // Straight
  if (counts[0] === 3) return 0.6; // Trips
  if (counts[0] === 2 && counts[1] >= 2) return 0.4; // Two Pair
  if (counts[0] === 2) return 0.2; // Pair
  
  return 0.1 + (values[0] / 100); // High Card
};

export const calculateEquity = (
  heroHand: Card[],
  villainRange: string[],
  board: Card[],
  iterations: number = 400
): number => {
  if (heroHand.length < 2 || villainRange.length === 0) return 0;

  let heroWins = 0;
  const deck = getAllCards().filter(c => 
    !heroHand.some(h => h.rank === c.rank && h.suit === c.suit) &&
    !board.some(b => b.rank === c.rank && b.suit === c.suit)
  );

  for (let i = 0; i < iterations; i++) {
    const randomVillainCombo = villainRange[Math.floor(Math.random() * villainRange.length)];
    // Simplified combo to cards conversion
    const v1 = deck[Math.floor(Math.random() * deck.length)];
    const v2 = deck.filter(c => c !== v1)[Math.floor(Math.random() * (deck.length - 1))];
    
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

export const RANGE_PRESETS: Record<string, string[]> = {
  'UTG (15%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'AKo', 'AQo'],
  'BTN (45%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s', '65s', '54s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
  'SB (35%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo']
};