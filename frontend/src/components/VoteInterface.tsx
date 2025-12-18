import React from 'react';
import { VoteOption } from '../types';
import * as LucideIcons from 'lucide-react';

interface VoteInterfaceProps {
  options: VoteOption[];
  onVote: (optionId: string) => void;
}

export const VoteInterface: React.FC<VoteInterfaceProps> = ({ options, onVote }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
        
        {/* Center VS Badge */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#0B0E14] border border-slate-700 rounded-full z-20 items-center justify-center shadow-xl shadow-black">
          <span className="font-black text-slate-500 italic text-xl">VS</span>
        </div>

        {options.map((option) => {
          const Icon = (LucideIcons as any)[option.iconName] || LucideIcons.HelpCircle;
          const isBlue = option.color === 'blue';
          const glowColor = isBlue ? 'shadow-blue-500/20' : 'shadow-cyan-400/20';
          const borderColor = isBlue ? 'hover:border-blue-500/50' : 'hover:border-cyan-400/50';

          return (
            <button
              key={option.id}
              onClick={() => onVote(option.id)}
              className={`group relative h-[450px] w-full rounded-3xl bg-[#151A23] border border-slate-800 ${borderColor} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${glowColor} overflow-hidden text-left focus:outline-none focus:ring-4 focus:ring-slate-700`}
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-0 w-full h-1 ${isBlue ? 'bg-blue-600' : 'bg-cyan-400'}`} />

              <div className="p-8 h-full flex flex-col relative z-10">
                <div className={`w-20 h-20 rounded-2xl mb-8 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${isBlue ? 'bg-blue-900/20 text-blue-500' : 'bg-cyan-900/20 text-cyan-400'}`}>
                  <Icon className="w-10 h-10" />
                </div>

                <h3 className="text-4xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-white to-slate-400 transition-colors">
                  {option.label}
                </h3>
                
                <p className="text-slate-400 text-lg leading-relaxed flex-1">
                  {option.description}
                </p>

                <div className={`mt-auto flex items-center gap-3 text-sm font-bold tracking-widest uppercase transition-colors ${isBlue ? 'text-blue-500 group-hover:text-blue-400' : 'text-cyan-500 group-hover:text-cyan-400'}`}>
                  <span>Cast Vote</span>
                  <LucideIcons.ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                </div>
              </div>

              {/* Background gradient blob */}
              <div className={`absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${isBlue ? 'bg-blue-600' : 'bg-cyan-400'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
