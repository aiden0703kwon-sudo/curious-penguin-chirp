import React from 'react';
import { Progress } from '@/components/ui/progress';

interface RangeStatsProps {
  selectedRange: Set<string>;
}

const RangeStats: React.FC<RangeStatsProps> = ({ selectedRange }) => {
  const totalCombos = 1326; // Total possible 2-card combos
  
  const calculateCombos = () => {
    let count = 0;
    selectedRange.forEach(hand => {
      if (hand.length === 2) count += 6; // Pairs
      else if (hand.endsWith('s')) count += 4; // Suited
      else count += 12; // Offsuit
    });
    return count;
  };

  const comboCount = calculateCombos();
  const percentage = (comboCount / totalCombos) * 100;

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Range Density</p>
          <h4 className="text-xl font-black text-slate-900">{percentage.toFixed(1)}%</h4>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Combos</p>
          <p className="text-sm font-bold text-indigo-600">{comboCount} / {totalCombos}</p>
        </div>
      </div>
      <Progress value={percentage} className="h-1.5 bg-slate-100" />
    </div>
  );
};

export default RangeStats;