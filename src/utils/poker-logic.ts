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
  
  let hasStraight = false;
  for (let i = 0; i <= uniqueValues.length - 5; i++) {
    if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
      hasStraight = true;
      break;
    }
  }
  if (!hasStraight && uniqueValues.includes(14) && uniqueValues.includes(2) && uniqueValues.includes(3) && uniqueValues.includes(4) && uniqueValues.includes(5)) {
    hasStraight = true;
  }

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  
  if (hasFlush && hasStraight) return 0.95;
  if (counts[0] === 4) return 0.9;
  if (counts[0] === 3 && counts[1] >= 2) return 0.85;
  if (hasFlush) return 0.8;
  if (hasStraight) return 0.75;
  if (counts[0] === 3) return 0.6;
  if (counts[0] === 2 && counts[1] >= 2) return 0.4;
  if (counts[0] === 2) return 0.2;
  
  return 0.1 + (values[0] / 100);
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
  'UTG (15%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'AKo', 'AQo', 'AJo', 'KQo'],
  'MP (20%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo'],
  'CO (32%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s', '54s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
  'BTN (45%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'T9s', 'T8s', 'T7s', 'T6s', '98s', '97s', '96s', '87s', '86s', '85s', '76s', '75s', '65s', '64s', '54s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQo', 'KJo', 'KTo', 'K9o', 'QJo', 'QTo', 'Q9o', 'JTo', 'J9o', 'T9o'],
  'SB (35%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s', '54s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'KQo', 'KJo', 'KTo', 'K9o', 'QJo', 'QTo', 'Q9o', 'JTo', 'J9o', 'T9o'],
  'BB Defend (60%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'JTs', 'J9s', 'J8s', 'J7s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'T9s', 'T8s', 'T7s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s', '98s', '97s', '96s', '95s', '94s', '93s', '92s', '87s', '86s', '85s', '84s', '83s', '82s', '76s', '75s', '74s', '73s', '72s', '65s', '64s', '63s', '62s', '54s', '53s', '52s', '43s', '42s', '32s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o', 'K6o', 'K5o', 'QJo', 'QTo', 'Q9o', 'Q8o', 'JTo', 'J9o', 'J8o', 'T9o', 'T8o', '98o'],
  '3-Bet (8%)': ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'AKo', 'AQo'],
  '4-Bet (4%)': ['AA', 'KK', 'QQ', 'AKs', 'AKo']
};