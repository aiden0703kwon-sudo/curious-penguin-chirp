import React from 'react';
import { RANKS, getHandCombos } from '@/utils/poker-logic';
import { cn } from '@/lib/utils';

interface HandGridProps {
  selectedRange: Set<string>;
  onToggleHand: (hand: string) => void;
  equityMap?: Record<string, number>;
}

const HandGrid: React.FC<HandGridProps> = ({ selectedRange, onToggleHand, equityMap }) => {
  const combos = getHandCombos();
  
  const getHeatmapColor = (equity: number) => {
    if (equity > 75) return 'bg-emerald-500 text-white';
    if (equity > 60) return 'bg-emerald-400 text-white';
    if (equity > 50) return 'bg-yellow-400 text-slate-900';
    if (equity > 40) return 'bg-orange-400 text-white';
    if (equity > 25) return 'bg-rose-400 text-white';
    return 'bg-rose-600 text-white';
  };

  return (
    <div className="grid grid-cols-13 gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xl overflow-hidden" style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}>
      {combos.map((hand) => {
        const isSelected = selectedRange.has(hand);
        const equity = equityMap?.[hand];
        const isPair = hand.length === 2;
        const isSuited = hand.endsWith('s');
        
        return (
          <button
            key={hand}
            onClick={() => onToggleHand(hand)}
            className={cn(
              "aspect-square flex flex-col items-center justify-center text-[9px] font-bold rounded-sm transition-all duration-200 relative group",
              isSelected 
                ? (equity !== undefined ? getHeatmapColor(equity) : "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] scale-105 z-10") 
                : "bg-slate-800 text-slate-400 hover:bg-slate-700",
              isPair && !isSelected && "border border-slate-600",
              isSuited && !isSelected && "text-indigo-300/60"
            )}
          >
            <span>{hand}</span>
            {isSelected && equity !== undefined && (
              <span className="text-[7px] opacity-80">{Math.round(equity)}%</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default HandGrid;