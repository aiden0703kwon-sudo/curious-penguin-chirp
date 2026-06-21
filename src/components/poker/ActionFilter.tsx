import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { TrendingDown, TrendingUp, Filter } from 'lucide-react';

interface ActionFilterProps {
  street: 'Preflop' | 'Flop' | 'Turn' | 'River';
  onFilter: (percentage: number, type: 'top' | 'bottom') => void;
}

const ActionFilter: React.FC<ActionFilterProps> = ({ street, onFilter }) => {
  const [value, setValue] = React.useState([50]);

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Filter size={16} /> {street} Action
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
          {value[0]}% Range
        </span>
      </div>
      
      <div className="space-y-6 py-2">
        <Slider 
          value={value} 
          onValueChange={setValue} 
          max={100} 
          step={1} 
          className="cursor-pointer"
        />
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex gap-1 hover:bg-indigo-50 hover:text-indigo-700"
            onClick={() => onFilter(value[0], 'top')}
          >
            <TrendingUp size={14} /> Keep Top
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex gap-1 hover:bg-rose-50 hover:text-rose-700"
            onClick={() => onFilter(value[0], 'bottom')}
          >
            <TrendingDown size={14} /> Keep Bottom
          </Button>
        </div>
      </div>
      
      <p className="text-[10px] text-slate-500 italic">
        * "Keep Top" simulates a bet/raise. "Keep Bottom" simulates a check/weak range.
      </p>
    </div>
  );
};

export default ActionFilter;