import React, { useState, useEffect } from 'react';
import { VoteInterface } from './components/VoteInterface';
import { Dashboard } from './components/Dashboard';
import { VoteOption, ViewState, VoteHistoryItem } from './types';
import * as LucideIcons from 'lucide-react';
import confetti from 'canvas-confetti';

const VOTE_OPTIONS: VoteOption[] = [
  {
    id: 'a',
    label: 'Spaces',
    description: 'Precision alignment. The consistent choice.',
    color: 'blue',
    iconName: 'AlignLeft'
  },
  {
    id: 'b',
    label: 'Tabs',
    description: 'Accessibility first. Visual flexibility.',
    color: 'cyan',
    iconName: 'ArrowRightToLine'
  }
];

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('vote');
  const [votes, setVotes] = useState<Record<string, number>>({ a: 0, b: 0 });
  const [history, setHistory] = useState<VoteHistoryItem[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);
  


  const fetchVotes = async () => {
    try {
      const res = await fetch(`/api/votes`);
      if (res.ok) {
        const data = await res.json();
        setVotes(prev => (JSON.stringify(prev) !== JSON.stringify(data) ? data : prev));
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (e) {
      setIsConnected(false);
    }
  }; 

  useEffect(() => {
    fetchVotes();
    const interval = setInterval(fetchVotes, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleVote = async (optionId: string) => {
    const option = VOTE_OPTIONS.find(o => o.id === optionId);
    if (!option) return;

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: option.color === 'blue' ? ['#3B82F6', '#60A5FA', '#93C5FD'] : ['#22D3EE', '#67E8F9', '#A5F3FC']
    });

    setVotes(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
    
    const newItem: VoteHistoryItem = {
      id: Date.now().toString(),
      optionLabel: option.label,
      optionColor: option.color,
      timestamp: new Date().toLocaleTimeString(),
      isoTimestamp: new Date().toISOString()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));

    setNotification(`Voted for ${option.label}`);
    setTimeout(() => setNotification(null), 3000);

    try {
      await fetch(`/api/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: optionId })
      });
    } catch (e) {
      console.warn('Backend unreachable');
    }
  };

  const handleReset = async () => {
    if (!confirm('Warning: This will permanently delete ALL votes from the database. Proceed?')) return;
    
    setNotification('Clearing database...');

    try {
      const response = await fetch(`/api/reset`, { method: 'POST' });
      
      if (response.ok) {
        setVotes({ a: 0, b: 0 });
        setHistory([]);
        setNotification('Database cleared successfully.');
        // Force a refresh to sync
        await fetchVotes();
      } else {
        const err = await response.json();
        setNotification(`Reset failed: ${err.error || 'Server error'}`);
      }
    } catch (e) { 
      console.error(e);
      setNotification('Network error during reset.');
    } finally {
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 font-sans flex flex-col">
      <nav className="border-b border-slate-800 bg-[#0B0E14]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">V</div>
            <span className="font-bold text-lg text-white">DevOps<span className="text-cyan-400">Vote</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-2 ${isConnected ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/20 text-amber-400 bg-amber-500/5'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col">
        <div className="self-center bg-[#151A23] p-1 rounded-xl flex gap-1 mb-10 border border-slate-800">
          {(['vote', 'dashboard'] as const).map(view => (
            <button
              key={view}
              onClick={() => setViewState(view)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${viewState === view ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>

        <div className="animate-fade-in flex-1">
          {viewState === 'vote' ? (
            <div className="flex flex-col items-center">
              <h1 className="text-4xl md:text-6xl font-black text-white text-center mb-12 tracking-tighter">
                Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Standard</span>
              </h1>
              <VoteInterface options={VOTE_OPTIONS} onVote={handleVote} />
            </div>
          ) : (
            <Dashboard options={VOTE_OPTIONS} votes={votes} history={history} onReset={handleReset} />
          )}
        </div>
      </main>

      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 z-50 animate-bounce">
          <LucideIcons.Info className="text-blue-400 w-5 h-5" />
          <span className="font-medium">{notification}</span>
        </div>
      )}
      
      <footer className="py-6 text-center text-slate-600 text-sm border-t border-slate-900 mt-auto">
       © 2025 Kishor Bhairat. Demonstrating real-world DevOps deployment practices.
      </footer>
    </div>
  );
};

export default App;