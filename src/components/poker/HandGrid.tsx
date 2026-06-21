import React from 'react';
import { RANKS, getHandCombos } from '@/utils/poker-logic';
import { cn } from '@/lib/utils';

interface HandGridProps {
  selectedRange: Set<string>;
  onToggleHand: (hand: string) => void;
}

const HandGrid: React.FC<HandGridProps> = ({ selectedRange, onToggleHand }) => {
  const combos = getHandCombos();
  
  return (
    <div className="grid grid-cols-13 gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xl overflow-hidden" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
      {combos.map((hand) => {
        const isSelected = selectedRange.has(hand);
        const isPair = hand.length === 2;
        const isSuited = hand.endsWith('s');
        
        return (
          <button
            key={hand}
            onClick={() => onToggleHand(hand)}
            className={cn(
              "aspect-square flex items-center justify-center text-[10px] font-bold rounded-sm transition-all duration-200",
              isSelected 
                ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-105 z-10" 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700",
              isPair && !isSelected && "border border-slate-600",
              isSuited && !isSelected && "text-indigo-300/60"
            )}
          >
            {hand}
          </button>
        );
      })}
    </div>
  );
};

export default HandGrid;