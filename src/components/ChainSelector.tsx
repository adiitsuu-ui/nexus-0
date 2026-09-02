import React from 'react';
import { SUPPORTED_CHAINS } from '../lib/constants';

interface ChainSelectorProps {
  selectedChain: string;
  onSelectChain: (chainId: string) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ selectedChain, onSelectChain }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onSelectChain('all')}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
          selectedChain === 'all'
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5'
        }`}
      >
        <span>🌐</span>
        <span>All Networks ({SUPPORTED_CHAINS.length})</span>
      </button>

      {SUPPORTED_CHAINS.map((chain) => {
        const isSelected = selectedChain === chain.id;
        return (
          <button
            key={chain.id}
            onClick={() => onSelectChain(chain.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              isSelected
                ? 'bg-slate-800 text-white border border-blue-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-white/5'
            }`}
          >
            <span>{chain.icon}</span>
            <span>{chain.name}</span>
          </button>
        );
      })}
    </div>
  );
};
