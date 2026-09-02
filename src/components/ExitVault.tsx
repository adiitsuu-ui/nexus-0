import React, { useState } from 'react';
import { Target, TrendingUp, ShieldAlert } from 'lucide-react';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface ExitVaultProps {
  onActivateStrategy: (feeUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const ExitVault: React.FC<ExitVaultProps> = ({
  onActivateStrategy,
  onTriggerModal,
  evmAddress,
}) => {
  const [tokenSymbol, setTokenSymbol] = useState<string>('BRETT');
  const [holdingValueUsd, setHoldingValueUsd] = useState<number>(1000);
  const [tier1Multiplier, setTier1Multiplier] = useState<number>(2); // 2x
  const [tier1Percent, setTier1Percent] = useState<number>(25);
  const [tier2Multiplier, setTier2Multiplier] = useState<number>(4); // 4x
  const [tier2Percent, setTier2Percent] = useState<number>(35);
  const [tier3Multiplier, setTier3Multiplier] = useState<number>(10); // 10x
  const [tier3Percent, setTier3Percent] = useState<number>(25);
  const [stopLossPercent, setStopLossPercent] = useState<number>(25); // -25%

  const moonbagPercent = Math.max(0, 100 - (tier1Percent + tier2Percent + tier3Percent));

  // Projected payouts
  const tier1Cash = (holdingValueUsd * (tier1Percent / 100)) * tier1Multiplier;
  const tier2Cash = (holdingValueUsd * (tier2Percent / 100)) * tier2Multiplier;
  const tier3Cash = (holdingValueUsd * (tier3Percent / 100)) * tier3Multiplier;
  const totalCashSecured = tier1Cash + tier2Cash + tier3Cash;

  const protocolFeeUsd = totalCashSecured * (PROTOCOL_CONFIG.feeRates.exitVaultBps / 10000);

  const handleActivate = () => {
    onTriggerModal({
      title: 'Activate Disciplined Profit Ladder',
      actionName: 'Sign Non-Custodial Smart Orders',
      sourceDetails: {
        label: `Token Position: $${tokenSymbol}`,
        items: [
          `Current Portfolio Value: $${holdingValueUsd.toFixed(2)}`,
          `Target 1: Sell ${tier1Percent}% at ${tier1Multiplier}x`,
          `Target 2: Sell ${tier2Percent}% at ${tier2Multiplier}x`,
          `Target 3: Sell ${tier3Percent}% at ${tier3Multiplier}x`,
        ],
        totalUsd: holdingValueUsd,
      },
      destinationDetails: {
        label: 'Secured Cash Out Payouts (USDC)',
        asset: 'USDC',
        estimatedAmount: `$${totalCashSecured.toFixed(2)}`,
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd: protocolFeeUsd,
        platformFeePercent: '0.35% on executed profit',
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.008,
      },
      onExecuteConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1400));
        onActivateStrategy(protocolFeeUsd);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <Target className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Bull Run Exit Strategy Vault</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Don't round-trip your portfolio back to zero in the bear market. Pre-set automated, non-custodial
              laddered sell targets that execute and lock your profits in USDC while you sleep.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-right">
            <span className="text-xs text-slate-400">Total Projected Cash Locked</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ${totalCashSecured.toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="text-xs text-slate-400 font-sans">USDC</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              +{moonbagPercent}% Moonbag rides risk-free
            </div>
          </div>
        </div>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ladder Settings */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Token Position</label>
              <input
                type="text"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. BRETT, PEPE, WIF"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm font-bold font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Current Position Value ($)</label>
              <input
                type="number"
                value={holdingValueUsd}
                onChange={(e) => setHoldingValueUsd(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm font-bold font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profit-Taking Tiers (Ladder)
            </h3>

            {/* Tier 1 */}
            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-xs font-bold font-mono text-blue-400">
                  1
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">Target 1: De-Risk (Take Cost Basis Out)</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                    <span>Sell</span>
                    <input
                      type="number"
                      value={tier1Percent}
                      onChange={(e) => setTier1Percent(Number(e.target.value))}
                      className="w-14 rounded bg-slate-900 px-1.5 py-0.5 border border-white/10 text-white text-center"
                    />
                    <span>% at</span>
                    <input
                      type="number"
                      value={tier1Multiplier}
                      onChange={(e) => setTier1Multiplier(Number(e.target.value))}
                      className="w-12 rounded bg-slate-900 px-1.5 py-0.5 border border-white/10 text-blue-400 text-center"
                    />
                    <span>x</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-bold text-emerald-400">+${tier1Cash.toFixed(0)} USDC</div>
                <div className="text-[11px] text-slate-500">Recovers 100% of initial investment</div>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold font-mono text-purple-400">
                  2
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">Target 2: Heavy Profit Locking</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                    <span>Sell</span>
                    <input
                      type="number"
                      value={tier2Percent}
                      onChange={(e) => setTier2Percent(Number(e.target.value))}
                      className="w-14 rounded bg-slate-900 px-1.5 py-0.5 border border-white/10 text-white text-center"
                    />
                    <span>% at</span>
                    <input
                      type="number"
                      value={tier2Multiplier}
                      onChange={(e) => setTier2Multiplier(Number(e.target.value))}
                      className="w-12 rounded bg-slate-900 px-1.5 py-0.5 border border-white/10 text-purple-400 text-center"
                    />
                    <span>x</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-bold text-emerald-400">+${tier2Cash.toFixed(0)} USDC</div>
                <div className="text-[11px] text-slate-500">Pure locked profit</div>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold font-mono text-emerald-400">
                  3
                </span>
                <div>
                  <div className="text-sm font-semibold text-white">Target 3: Moonshot Tier</div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                    <span>Sell</span>
                    <input
                      type="number"
                      value={tier3Percent}
                      onChange={(e) => setTier3Percent(Number(e.target.value))}
                      className="w-14 rounded bg-slate-900 px-1.5 py-0.5 border border-white/10 text-white text-center"
                    />
                    <span>% at</span>
                    <input
                      type="number"
                      value={tier3Multiplier}
                      onChange={(e) => setTier3Multiplier(Number(e.target.value))}
                      className="w-12 rounded bg-slate-900 px-1.5 py-0.5 border border-white/10 text-emerald-400 text-center"
                    />
                    <span>x</span>
                  </div>
                </div>
              </div>
              <div className="text-right font-mono">
                <div className="text-sm font-bold text-emerald-400">+${tier3Cash.toFixed(0)} USDC</div>
                <div className="text-[11px] text-slate-500">Life-changing gains</div>
              </div>
            </div>

            {/* Moonbag & Stop Loss */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-xs">
                <span className="font-semibold text-emerald-400">🚀 Remaining Moonbag: {moonbagPercent}%</span>
                <p className="text-slate-400 mt-1">Keeps {moonbagPercent}% invested forever in case the token does a 100x.</p>
              </div>
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-400">🛑 Stop-Loss Protection</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span>-</span>
                    <input
                      type="number"
                      value={stopLossPercent}
                      onChange={(e) => setStopLossPercent(Number(e.target.value))}
                      className="w-12 rounded bg-slate-900 px-1 py-0.5 border border-white/10 text-rose-400 text-center"
                    />
                    <span>%</span>
                  </div>
                </div>
                <p className="text-slate-400 mt-1">Auto-sells position if token breaks below -{stopLossPercent}% support.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Strategy Summary & Activation */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Discipline Score & Projection</h3>

            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Initial Capital:</span>
                <span className="font-mono text-white">${holdingValueUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Cash Harvested:</span>
                <span className="font-mono font-bold text-emerald-400">${totalCashSecured.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Net Gain Multiplier:</span>
                <span className="font-mono text-blue-400">{(totalCashSecured / holdingValueUsd).toFixed(1)}x overall</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>NEXUS-0 Success Fee (0.35%):</span>
                <span className="font-mono text-slate-300">${protocolFeeUsd.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 text-xs text-blue-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
              <p>
                Non-custodial EIP-712 trigger: Tokens never leave your wallet until the target price is verified by on-chain Pyth/Chainlink oracles.
              </p>
            </div>
          </div>

          <button
            onClick={handleActivate}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-500"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Activate Smart Exit Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
};
