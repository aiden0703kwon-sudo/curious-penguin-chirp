import React, { useState, useEffect, useMemo } from 'react';
import { Card, calculateEquity, getHandCombos, Suit } from '@/utils/poker-logic';
import HandGrid from '@/components/poker/HandGrid';
import CardPicker from '@/components/poker/CardPicker';
import ActionFilter from '@/components/poker/ActionFilter';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card as ShadCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calculator, User, Users, Layers, RotateCcw, Plus } from 'lucide-react';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const [heroHand, setHeroHand] = useState<Card[]>([]);
  const [board, setBoard] = useState<Card[]>([]);
  const [selectedRange, setSelectedRange] = useState<Set<string>>(new Set());
  const [equity, setEquity] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

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

  const filterRange = (percentage: number, type: 'top' | 'bottom') => {
    const sortedCombos = [...allCombos]; // In a real app, we'd sort by raw equity
    const count = Math.floor((percentage / 100) * sortedCombos.length);
    
    let newRange: string[];
    if (type === 'top') {
      newRange = sortedCombos.slice(0, count);
    } else {
      newRange = sortedCombos.slice(sortedCombos.length - count);
    }
    
    setSelectedRange(new Set(newRange));
    showSuccess(`Range filtered to ${type} ${percentage}%`);
  };

  const runCalculation = () => {
    if (heroHand.length < 2 || selectedRange.size === 0) return;
    
    setIsCalculating(true);
    // Small timeout to allow UI to show loading state
    setTimeout(() => {
      const result = calculateEquity(heroHand, Array.from(selectedRange), board);
      setEquity(result);
      setIsCalculating(false);
    }, 100);
  };

  const reset = () => {
    setHeroHand([]);
    setBoard([]);
    setSelectedRange(new Set());
    setEquity(null);
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
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Action Logic</h3>
              <ActionFilter street="Preflop" onFilter={filterRange} />
              <ActionFilter street="Flop" onFilter={filterRange} />
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
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRange(new Set(allCombos))} className="text-xs">Select All</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedRange(new Set())} className="text-xs">Clear</Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <HandGrid selectedRange={selectedRange} onToggleHand={toggleHandInRange} />
                <div className="mt-6 flex flex-wrap gap-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest w-full mb-2">Quick Presets</p>
                  {['10', '25', '50', '75'].map(p => (
                    <Button 
                      key={p} 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full text-xs border-slate-200 hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => filterRange(parseInt(p), 'top')}
                    >
                      Top {p}%
                    </Button>
                  ))}
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