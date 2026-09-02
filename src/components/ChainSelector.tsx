import React from 'react';
import { SUPPORTED_CHAINS } from '../lib/constants';

interface ChainSelectorProps {
  selectedChain: string;
  onSelectChain: (chainId: string) => void;
}

export const ChainSelector: React.FC<ChainSelectorProps> = ({ selectedChain, onSelectChain }) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
      <button
        onClick={() => onSelectChain('all')}
        className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
          selectedChain === 'all'
            ? 'bg-white/10 text-white'
            : 'text-[#8b98a8] hover:text-white'
        }`}
      >
        All networks
      </button>

      {SUPPORTED_CHAINS.map((chain) => {
        const isSelected = selectedChain === chain.id;
        return (
          <button
            key={chain.id}
            onClick={() => onSelectChain(chain.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-[12px] font-medium transition ${
              isSelected ? 'bg-white/10 text-white' : 'text-[#8b98a8] hover:text-white'
            }`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: chain.color }}
            />
            <span>{chain.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ChainSelector;
