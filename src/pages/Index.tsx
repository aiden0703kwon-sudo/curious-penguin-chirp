import React, { useState, useMemo } from 'react';
import { Card, calculateEquity, getHandCombos, Suit, RANGE_PRESETS } from '@/utils/poker-logic';
import HandGrid from '@/components/poker/HandGrid';
import CardPicker from '@/components/poker/CardPicker';
import ActionFilter, { PokerAction } from '@/components/poker/ActionFilter';
import RangeStats from '@/components/poker/RangeStats';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card as ShadCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calculator, User, Users, Layers, RotateCcw, Plus, Flame, Info } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const [heroHand, setHeroHand] = useState<Card[]>([]);
  const [board, setBoard] = useState<Card[]>([]);
  const [selectedRange, setSelectedRange] = useState<Set<string>>(new Set());
  const [equity, setEquity] = useState<number | null>(null);
  const [equityMap, setEquityMap] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Track actions per street
  const [actions, setActions] = useState<Record<string, PokerAction | undefined>>({
    Preflop: undefined,
    Flop: undefined,
    Turn: undefined,
    River: undefined
  });

  const allCombos = useMemo(() => getHandCombos(), []);

  const toggleHandInRange = (hand: string) => {
    const newRange = new Set(selectedRange);
    if (newRange.has(hand)) newRange.delete(hand);
    else newRange.add(hand);
    setSelectedRange(newRange);
  };

  const handleCardSelect = (card: Card, type: 'hero' | 'board') => {
    if (type === 'hero') {
      if (heroHand.some(c => c.rank === card.rank && c.suit === card.suit)) {
        setHeroHand(heroHand.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
      } else if (heroHand.length < 2) {
        setHeroHand([...heroHand, card]);
      }
    } else {
      if (board.some(c => c.rank === card.rank && c.suit === card.suit)) {
        setBoard(board.filter(c => !(c.rank === card.rank && c.suit === card.suit)));
      } else if (board.length < 5) {
        setBoard([...board, card]);
      }
    }
  };

  const handleAction = (street: string, action: PokerAction) => {
    if (action === 'Reset') {
      setActions(prev => ({ ...prev, [street]: undefined }));
      return;
    }

    setActions(prev => ({ ...prev, [street]: action }));

    // Logic to filter range based on action
    // This is a heuristic: in a real solver, this would be based on GTO frequencies
    const currentRangeArray = Array.from(selectedRange).length > 0 
      ? Array.from(selectedRange) 
      : allCombos;

    let percentage = 100;
    let type: 'top' | 'bottom' = 'top';

    switch (action) {
      case 'Raise': 
        percentage = 15; 
        type = 'top'; 
        break;
      case 'Bet': 
        percentage = 40; 
        type = 'top'; 
        break;
      case 'Call': 
        percentage = 50; 
        type = 'top'; // Simplified: usually "Call" is a capped range, but here we'll take top 50%
        break;
      case 'Check': 
        percentage = 70; 
        type = 'bottom'; // Check usually removes the very top of the range
        break;
    }

    const count = Math.floor((percentage / 100) * currentRangeArray.length);
    let newRange: string[];
    if (type === 'top') newRange = currentRangeArray.slice(0, count);
    else newRange = currentRangeArray.slice(currentRangeArray.length - count);
    
    setSelectedRange(new Set(newRange));
    showSuccess(`${street} ${action}: Range narrowed to ${newRange.length} combos`);
  };

  const runCalculation = async () => {
    if (heroHand.length < 2 || selectedRange.size === 0) return;
    setIsCalculating(true);
    
    const result = calculateEquity(heroHand, Array.from(selectedRange), board);
    setEquity(result);

    if (showHeatmap) {
      const newEquityMap: Record<string, number> = {};
      const rangeArray = Array.from(selectedRange);
      for (const hand of rangeArray) {
        newEquityMap[hand] = calculateEquity(heroHand, [hand], board, 50);
      }
      setEquityMap(newEquityMap);
    }

    setIsCalculating(false);
  };

  const applyPreset = (name: string) => {
    setSelectedRange(new Set(RANGE_PRESETS[name]));
    setActions({ Preflop: undefined, Flop: undefined, Turn: undefined, River: undefined });
    showSuccess(`Applied ${name} preset`);
  };

  const reset = () => {
    setHeroHand([]);
    setBoard([]);
    setSelectedRange(new Set());
    setEquity(null);
    setEquityMap({});
    setActions({ Preflop: undefined, Flop: undefined, Turn: undefined, River: undefined });
  };

  const getSuitSymbol = (suit: Suit) => {
    switch (suit) {
      case 'h': return '♥';
      case 'd': return '♦';
      case 'c': return '♣';
      case 's': return '♠';
    }
  };

  const getSuitColor = (suit: Suit) => {
    switch (suit) {
      case 'h': return 'text-red-500';
      case 'd': return 'text-blue-500';
      case 'c': return 'text-green-500';
      case 's': return 'text-slate-900';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <Calculator className="text-indigo-600" size={36} />
              EQUITY<span className="text-indigo-600">LAB</span>
            </h1>
            <p className="text-slate-500 font-medium">Advanced Range vs Range Analysis</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset} className="rounded-full px-6 border-slate-200 hover:bg-slate-100">
              <RotateCcw size={16} className="mr-2" /> Reset
            </Button>
            <Button 
              onClick={runCalculation} 
              disabled={heroHand.length < 2 || selectedRange.size === 0 || isCalculating}
              className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              {isCalculating ? "Calculating..." : "Calculate Equity"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            {/* Hero Hand */}
            <ShadCard className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
              <CardHeader className="bg-slate-900 text-white pb-8">
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 opacity-80">
                  <User size={16} /> Your Hand
                </CardTitle>
              </CardHeader>
              <CardContent className="-mt-6">
                <div className="flex gap-3 justify-center mb-6">
                  {[0, 1].map(i => (
                    <Popover key={i}>
                      <PopoverTrigger asChild>
                        <button className="w-20 h-28 rounded-xl border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center hover:border-indigo-400 transition-all group shadow-sm">
                          {heroHand[i] ? (
                            <div className={`text-2xl font-bold ${getSuitColor(heroHand[i].suit)}`}>
                              {heroHand[i].rank}{getSuitSymbol(heroHand[i].suit)}
                            </div>
                          ) : (
                            <Plus className="text-slate-300 group-hover:text-indigo-400" />
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl" side="right">
                        <CardPicker 
                          selectedCards={[...heroHand, ...board]} 
                          onSelect={(c) => handleCardSelect(c, 'hero')} 
                          maxCards={2}
                        />
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </CardContent>
            </ShadCard>

            {/* Board */}
            <ShadCard className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
              <CardHeader className="bg-indigo-600 text-white pb-8">
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 opacity-80">
                  <Layers size={16} /> The Board
                </CardTitle>
              </CardHeader>
              <CardContent className="-mt-6">
                <div className="flex gap-2 justify-center mb-6">
                  {[0, 1, 2, 3, 4].map(i => (
                    <Popover key={i}>
                      <PopoverTrigger asChild>
                        <button className="w-14 h-20 rounded-lg border-2 border-dashed border-slate-200 bg-white flex flex-col items-center justify-center hover:border-indigo-400 transition-all group shadow-sm">
                          {board[i] ? (
                            <div className={`text-lg font-bold ${getSuitColor(board[i].suit)}`}>
                              {board[i].rank}{getSuitSymbol(board[i].suit)}
                            </div>
                          ) : (
                            <Plus size={16} className="text-slate-300 group-hover:text-indigo-400" />
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 border-none shadow-2xl" side="top">
                        <CardPicker 
                          selectedCards={[...heroHand, ...board]} 
                          onSelect={(c) => handleCardSelect(c, 'board')} 
                          maxCards={5}
                        />
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </CardContent>
            </ShadCard>

            {/* Action Filters */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Opponent Actions</h3>
              <ActionFilter 
                street="Preflop" 
                activeAction={actions.Preflop} 
                onAction={(a) => handleAction('Preflop', a)} 
              />
              <ActionFilter 
                street="Flop" 
                activeAction={actions.Flop} 
                onAction={(a) => handleAction('Flop', a)} 
              />
            </div>
          </div>

          {/* Right Column: Range & Results */}
          <div className="lg:col-span-8 space-y-6">
            {/* Equity Result */}
            {equity !== null && (
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">Win Probability</p>
                    <h2 className="text-6xl font-black text-slate-900">
                      {equity.toFixed(1)}<span className="text-indigo-600">%</span>
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-medium">Against {selectedRange.size} combos</p>
                  </div>
                </div>
                <Progress value={equity} className="h-4 bg-slate-100" />
              </div>
            )}

            {/* Range Grid */}
            <ShadCard className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users size={20} className="text-indigo-600" /> Opponent Range
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Flame size={14} className={showHeatmap ? "text-orange-500" : "text-slate-300"} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Heatmap</span>
                    <input 
                      type="checkbox" 
                      checked={showHeatmap} 
                      onChange={(e) => setShowHeatmap(e.target.checked)}
                      className="w-3 h-3 accent-indigo-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRange(new Set(allCombos))} className="text-xs">All</Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRange(new Set())} className="text-xs">Clear</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <HandGrid 
                      selectedRange={selectedRange} 
                      onToggleHand={toggleHandInRange} 
                      equityMap={showHeatmap ? equityMap : undefined}
                    />
                  </div>
                  <div className="space-y-4">
                    <RangeStats selectedRange={selectedRange} />
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Presets</p>
                      <div className="flex flex-col gap-2">
                        {Object.keys(RANGE_PRESETS).map(name => (
                          <Button 
                            key={name} 
                            variant="secondary" 
                            size="sm" 
                            className="justify-start text-[10px] font-bold bg-white hover:bg-indigo-600 hover:text-white transition-colors"
                            onClick={() => applyPreset(name)}
                          >
                            {name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <Info size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>How it works:</strong> Select an action (Check, Bet, Raise) to simulate how the opponent's range narrows. For example, clicking <strong>Raise</strong> will filter the current range to only the top 15% of hands.
                  </p>
                </div>
              </CardContent>
            </ShadCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;