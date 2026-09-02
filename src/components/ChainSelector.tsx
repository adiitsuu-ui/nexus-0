import React from 'react';
import { SUPPORTED_CHAINS } from '../lib/constants';

interface ChainSelectorProps {
  selectedChain: string;
  onSelectChain: (chainId: string) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ selectedChain, onSelectChain }) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-950/60 border border-white/[0.06] scrollbar-none">
      <button
        onClick={() => onSelectChain('all')}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition ${
          selectedChain === 'all'
            ? 'bg-slate-800/90 text-white shadow-sm border border-white/10'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <span className="text-xs">🌐</span>
        <span>All Chains</span>
      </button>

      {SUPPORTED_CHAINS.map((chain) => {
        const isSelected = selectedChain === chain.id;
        return (
          <button
            key={chain.id}
            onClick={() => onSelectChain(chain.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-mono font-medium transition ${
              isSelected
                ? 'bg-slate-800/90 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span className="text-xs">{chain.icon}</span>
            <span>{chain.name}</span>
          </button>
        );
      })}
    </div>
  );
};
export default ChainSelector;
