import React, { useState } from 'react';
import { Sparkles, ArrowRight, CheckSquare, Square } from 'lucide-react';
import type { TokenBalance } from '../types';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface DustSweeperProps {
  balances: TokenBalance[];
  selectedChain: string;
  onSweepSuccess: (sweptTokens: TokenBalance[], feeUsd: number) => void;
  onTriggerModal: (details: {
    title: string;
    actionName: string;
    sourceDetails: { label: string; items: string[]; totalUsd: number };
    destinationDetails: { label: string; asset: string; estimatedAmount: string; destinationAddress: string };
    feeBreakdown: { platformFeeUsd: number; platformFeePercent: string; treasuryAddress: string; networkGasUsd: number };
    onExecuteConfirm: () => Promise<void>;
  }) => void;
  evmAddress: string;
}

export const DustSweeper: React.FC<DustSweeperProps> = ({
  balances,
  selectedChain,
  onSweepSuccess,
  onTriggerModal,
  evmAddress,
}) => {
  const [targetAsset, setTargetAsset] = useState<'USDC' | 'ETH' | 'SOL'>('USDC');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(
    new Set(balances.filter((t) => t.isDust && (selectedChain === 'all' || t.chainId === selectedChain)).map((t) => t.address))
  );

  const filteredBalances = balances.filter((t) => {
    if (!t.isDust) return false;
    if (selectedChain === 'all') return true;
    return t.chainId === selectedChain;
  });

  const toggleSelect = (address: string) => {
    const next = new Set(selectedAddresses);
    if (next.has(address)) {
      next.delete(address);
    } else {
      next.add(address);
    }
    setSelectedAddresses(next);
  };

  const toggleSelectAll = () => {
    if (selectedAddresses.size === filteredBalances.length) {
      setSelectedAddresses(new Set());
    } else {
      setSelectedAddresses(new Set(filteredBalances.map((t) => t.address)));
    }
  };

  const selectedTokens = filteredBalances.filter((t) => selectedAddresses.has(t.address));
  const totalDustUsd = selectedTokens.reduce((acc, t) => acc + t.usdValue, 0);
  const feeRate = PROTOCOL_CONFIG.feeRates.dustSweeperBps / 10000; // 0.025
  const platformFeeUsd = totalDustUsd * feeRate;
  const netOutputUsd = totalDustUsd - platformFeeUsd;

  const targetAssetRate = targetAsset === 'USDC' ? 1 : targetAsset === 'ETH' ? 2640 : 145;
  const estimatedOutputAmount = (netOutputUsd / targetAssetRate).toFixed(4);

  const handleSweepClick = () => {
    if (selectedTokens.length === 0) return;

    onTriggerModal({
      title: 'Sweep Small Balances (Dust)',
      actionName: `Atomic Sweep (${selectedTokens.length} Tokens)`,
      sourceDetails: {
        label: 'Consolidating Dust Tokens',
        items: selectedTokens.map((t) => `${t.balance.toLocaleString()} ${t.symbol} ($${t.usdValue.toFixed(2)})`),
        totalUsd: totalDustUsd,
      },
      destinationDetails: {
        label: 'You Receive (Atomic)',
        asset: targetAsset,
        estimatedAmount: estimatedOutputAmount,
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd,
        platformFeePercent: '2.50%',
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.012,
      },
      onExecuteConfirm: async () => {
        // Simulate atomic on-chain execution delay
        onSweepSuccess(selectedTokens, platformFeeUsd);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Multi-Chain Dust Sweeper</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Clean up cluttered wallets across Base, Arbitrum, Solana, Ethereum, and zkSync.
              Batch-convert low-value leftover tokens into native ETH, SOL, or USDC in one atomic transaction.
            </p>
          </div>

          {/* Quick Summary Pill */}
          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-right">
            <span className="text-xs text-slate-400">Selected Dust Value</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ${totalDustUsd.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USD</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Est. Net Output: ~{estimatedOutputAmount} {targetAsset}
            </div>
          </div>
        </div>
      </div>

      {/* Main Execution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Token Dust List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              {selectedAddresses.size === filteredBalances.length && filteredBalances.length > 0 ? (
                <CheckSquare className="h-4 w-4" />
              ) : (
                <Square className="h-4 w-4 text-slate-500" />
              )}
              <span>
                {selectedAddresses.size === filteredBalances.length && filteredBalances.length > 0
                  ? 'Deselect All'
                  : 'Select All Dust'}
              </span>
            </button>
            <span className="text-xs font-mono text-slate-400">
              {selectedTokens.length} of {filteredBalances.length} tokens selected
            </span>
          </div>

          {filteredBalances.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              ✨ No dust tokens detected on {selectedChain === 'all' ? 'any network' : selectedChain}! Your wallet is clean.
            </div>
          ) : (
            <div className="divide-y divide-white/5 max-h-[360px] overflow-y-auto pr-1">
              {filteredBalances.map((token) => {
                const isSelected = selectedAddresses.has(token.address);
                return (
                  <div
                    key={token.address + token.chainId}
                    onClick={() => toggleSelect(token.address)}
                    className={`flex items-center justify-between py-3 px-2 rounded-lg cursor-pointer transition ${
                      isSelected ? 'bg-blue-950/20' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-400">
                        {isSelected ? <CheckSquare className="h-4 w-4 text-blue-400" /> : <Square className="h-4 w-4 text-slate-600" />}
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-base">
                        {token.icon || '🪙'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-white">{token.symbol}</span>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase font-mono text-slate-400">
                            {token.chainId}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {token.balance.toLocaleString()} {token.symbol}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold font-mono text-white">${token.usdValue.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-500 font-mono">${token.priceUsd.toFixed(6)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Sweep Configuration & Action */}
        <div className="glass-panel rounded-2xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Sweep Target & Controls</h3>

            {/* Target Asset Picker */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Receive As</label>
              <div className="grid grid-cols-3 gap-2">
                {(['USDC', 'ETH', 'SOL'] as const).map((asset) => (
                  <button
                    key={asset}
                    onClick={() => setTargetAsset(asset)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition ${
                      targetAsset === asset
                        ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            {/* Slippage Selector */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">Slippage Tolerance</label>
              <div className="grid grid-cols-3 gap-2">
                {[0.5, 1.0, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSlippage(rate)}
                    className={`py-1.5 text-xs font-mono rounded-lg border transition ${
                      slippage === rate
                        ? 'bg-slate-800 border-blue-500/40 text-blue-300'
                        : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Breakdown */}
            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Selected Tokens:</span>
                <span className="font-mono text-white">{selectedTokens.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Value:</span>
                <span className="font-mono text-white">${totalDustUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>NEXUS-0 Fee (2.5%):</span>
                <span className="font-mono text-emerald-400">${platformFeeUsd.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
                <span>Est. Net Output:</span>
                <span className="font-mono text-emerald-400">
                  ~{estimatedOutputAmount} {targetAsset}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSweepClick}
            disabled={selectedTokens.length === 0}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition ${
              selectedTokens.length > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Sweep Selected ({selectedTokens.length})</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
