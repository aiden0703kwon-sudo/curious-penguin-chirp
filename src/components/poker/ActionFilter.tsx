import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MousePointer2, 
  Coins, 
  ArrowUpCircle, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type PokerAction = 'Check' | 'Bet' | 'Call' | 'Raise' | 'Reset';

interface ActionFilterProps {
  street: 'Preflop' | 'Flop' | 'Turn' | 'River';
  activeAction?: PokerAction;
  onAction: (action: PokerAction) => void;
}

const ActionFilter: React.FC<ActionFilterProps> = ({ street, activeAction, onAction }) => {
  const actions: { label: PokerAction; icon: React.ReactNode; color: string; description: string }[] = [
    { 
      label: 'Check', 
      icon: <CheckCircle2 size={14} />, 
      color: 'hover:bg-slate-100 hover:text-slate-700 border-slate-200',
      description: 'Keeps medium/weak hands'
    },
    { 
      label: 'Bet', 
      icon: <Coins size={14} />, 
      color: 'hover:bg-blue-50 hover:text-blue-700 border-blue-200',
      description: 'Keeps value + bluffs'
    },
    { 
      label: 'Raise', 
      icon: <ArrowUpCircle size={14} />, 
      color: 'hover:bg-orange-50 hover:text-orange-700 border-orange-200',
      description: 'Keeps strong value'
    },
    { 
      label: 'Call', 
      icon: <MousePointer2 size={14} />, 
      color: 'hover:bg-emerald-50 hover:text-emerald-700 border-emerald-200',
      description: 'Keeps drawing/medium hands'
    },
  ];

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
          <Filter size={14} className="text-indigo-500" /> {street} Action
        </h3>
        {activeAction && (
          <button 
            onClick={() => onAction('Reset')}
            className="text-[10px] font-bold text-indigo-600 hover:underline"
          >
            Reset
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => onAction(action.label)}
            className={cn(
              "h-auto py-2 flex flex-col items-center gap-1 text-[10px] font-bold transition-all",
              action.color,
              activeAction === action.label && "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:text-white"
            )}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
      
      {activeAction && (
        <p className="text-[9px] text-slate-400 italic text-center">
          {actions.find(a => a.label === activeAction)?.description}
        </p>
      )}
    </div>
  );
};

export default ActionFilter;