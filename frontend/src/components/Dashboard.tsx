import React, { useState, useMemo } from 'react';
import { VoteOption, VoteHistoryItem } from '../types';
import { 
  AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip, 
  XAxis, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import * as LucideIcons from 'lucide-react';

interface DashboardProps {
  options: VoteOption[];
  votes: Record<string, number>;
  history: VoteHistoryItem[];
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ options, votes, history, onReset }) => {
  const [filterOption, setFilterOption] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const totalVotes = (Object.values(votes) as number[]).reduce((a, b) => a + b, 0);
  const percentA = totalVotes === 0 ? 50 : Math.round(((votes[options[0].id] || 0) / totalVotes) * 100);
  const percentB = totalVotes === 0 ? 50 : 100 - percentA;

  const dataPie = [
    { name: options[0].label, value: votes[options[0].id] || 0, color: '#3B82F6' }, // Blue
    { name: options[1].label, value: votes[options[1].id] || 0, color: '#22D3EE' }  // Cyan
  ];

  // Mock trend generation for visual flair
  const trendData = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      name: i,
      value: 50 + Math.sin(i * 0.5) * 20 + Math.random() * 10
    }));
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      // Filter by Option
      if (filterOption !== 'all' && item.optionLabel !== options.find(o => o.id === filterOption)?.label) {
        return false;
      }

      // Filter by Date Range
      if (startDate || endDate) {
        const itemDate = new Date(item.isoTimestamp);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0); // Start of day
          if (itemDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // End of day
          if (itemDate > end) return false;
        }
      }

      return true;
    });
  }, [history, filterOption, startDate, endDate, options]);

  // Calculate stats for the filtered subset
  const filteredStats = useMemo(() => {
    const stats: Record<string, number> = {};
    options.forEach(o => stats[o.label] = 0);
    filteredHistory.forEach(item => {
      if (stats[item.optionLabel] !== undefined) {
        stats[item.optionLabel]++;
      }
    });
    return stats;
  }, [filteredHistory, options]);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#151A23] p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
           <h4 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Total Votes</h4>
           <div className="text-4xl font-black text-white">{totalVotes}</div>
           <LucideIcons.Activity className="absolute top-6 right-6 text-slate-700 w-8 h-8" />
        </div>
        
        {options.map((opt, idx) => (
           <div key={opt.id} className="bg-[#151A23] p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
             <h4 className={`text-sm font-medium uppercase tracking-wider mb-2 ${opt.color === 'blue' ? 'text-blue-500' : 'text-cyan-400'}`}>
               {opt.label}
             </h4>
             <div className="text-4xl font-black text-white">{votes[opt.id] || 0}</div>
             <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${opt.color === 'blue' ? 'bg-blue-600' : 'bg-cyan-400'}`} style={{ width: `${idx === 0 ? percentA : percentB}%` }} />
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#151A23] p-8 rounded-2xl border border-slate-800">
          <h3 className="text-white font-bold text-lg mb-6">Activity Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2A303C" />
                <XAxis hide />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#2A303C', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="lg:col-span-1 bg-[#151A23] rounded-2xl border border-slate-800 flex flex-col h-[500px]">
          <div className="p-6 pb-2">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </h3>
            
            {/* Filters */}
            <div className="space-y-3 mb-4">
              <select 
                value={filterOption} 
                onChange={(e) => setFilterOption(e.target.value)}
                className="w-full bg-[#0B0E14] text-xs text-slate-300 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Options</option>
                {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <div className="flex gap-2">
                 <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-1/2 bg-[#0B0E14] text-xs text-slate-300 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  placeholder="Start"
                 />
                 <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-1/2 bg-[#0B0E14] text-xs text-slate-300 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  placeholder="End"
                 />
              </div>

              {/* Filtered Stats Summary */}
              <div className="flex items-center justify-between text-xs bg-[#0B0E14] p-3 rounded-lg border border-slate-700/50">
                 <span className="text-slate-500 font-medium uppercase tracking-wider text-[10px] hidden sm:block">Subset</span>
                 <div className="flex gap-3 w-full sm:w-auto justify-between sm:justify-end">
                   {options.map(opt => (
                     <div key={opt.id} className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${opt.color === 'blue' ? 'bg-blue-500' : 'bg-cyan-400'}`} />
                        <span className="text-slate-400 hidden lg:inline">{opt.label}</span>
                        <span className="text-white font-bold">{filteredStats[opt.label] || 0}</span>
                     </div>
                   ))}
                   <div className="pl-3 border-l border-slate-800 text-slate-400">
                      Total: <span className="text-white font-bold">{filteredHistory.length}</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 px-6 pb-6 custom-scrollbar">
            {filteredHistory.length === 0 ? (
              <p className="text-slate-600 text-center mt-4 text-sm">No votes found matching filters.</p>
            ) : (
              filteredHistory.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0B0E14] border border-slate-800">
                  <div className={`w-2 h-8 rounded-full ${item.optionColor === 'blue' ? 'bg-blue-500' : 'bg-cyan-400'}`} />
                  <div>
                    <div className="text-slate-300 text-sm font-medium">Voted {item.optionLabel}</div>
                    <div className="text-slate-600 text-xs">{item.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <LucideIcons.Trash2 className="w-4 h-4" />
          Reset Election Data
        </button>
      </div>
    </div>
  );
};
