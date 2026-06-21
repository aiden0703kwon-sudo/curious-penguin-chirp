import React from 'react';
import { Card, RANKS, SUITS, Suit } from '@/utils/poker-logic';
import { cn } from '@/lib/utils';

interface CardPickerProps {
  selectedCards: Card[];
  onSelect: (card: Card) => void;
  maxCards?: number;
}

const CardPicker: React.FC<CardPickerProps> = ({ selectedCards, onSelect, maxCards = 52 }) => {
  const isSelected = (rank: string, suit: Suit) => 
    selectedCards.some(c => c.rank === rank && c.suit === suit);

  const getSuitColor = (suit: Suit) => {
    switch (suit) {
      case 'h': return 'text-red-500';
      case 'd': return 'text-blue-500';
      case 'c': return 'text-green-500';
      case 's': return 'text-slate-900';
    }
  };

  const getSuitSymbol = (suit: Suit) => {
    switch (suit) {
      case 'h': return '♥';
      case 'd': return '♦';
      case 'c': return '♣';
      case 's': return '♠';
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-white rounded-2xl shadow-xl border border-slate-100">
      {SUITS.map(suit => (
        <div key={suit} className="flex flex-col gap-1">
          {RANKS.map(rank => {
            const active = isSelected(rank, suit);
            return (
              <button
                key={`${rank}${suit}`}
                disabled={selectedCards.length >= maxCards && !active}
                onClick={() => onSelect({ rank: rank as any, suit })}
                className={cn(
                  "h-10 w-12 flex items-center justify-center rounded-md border transition-all",
                  active 
                    ? "bg-indigo-600 border-indigo-600 text-white scale-110 z-10 shadow-lg" 
                    : "bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50",
                  !active && getSuitColor(suit)
                )}
              >
                <span className="font-bold text-sm">{rank}</span>
                <span className="text-xs ml-0.5">{getSuitSymbol(suit)}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CardPicker;