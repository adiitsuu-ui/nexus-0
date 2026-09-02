import React, { useState } from 'react';
import { Fuel, ArrowRight, Zap, Clock } from 'lucide-react';
import { SUPPORTED_CHAINS, PROTOCOL_CONFIG } from '../lib/constants';

interface GasStationProps {
  onRefuelSuccess: (feeUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
  solanaAddress: string;
}

export const GasStation: React.FC<GasStationProps> = ({
  onRefuelSuccess,
  onTriggerModal,
  evmAddress,
  solanaAddress,
}) => {
  const [fromChain, setFromChain] = useState<string>('solana');
  const [toChain, setToChain] = useState<string>('base');
  const [refuelTierUsd, setRefuelTierUsd] = useState<number>(10);

  const destChainConfig = SUPPORTED_CHAINS.find((c) => c.id === toChain) || SUPPORTED_CHAINS[0];
  const sourceChainConfig = SUPPORTED_CHAINS.find((c) => c.id === fromChain) || SUPPORTED_CHAINS[1];

  const flatFeeUsd = PROTOCOL_CONFIG.feeRates.gasStationFixedUsd; // $1.50
  const netGasValueUsd = Math.max(0, refuelTierUsd - flatFeeUsd);

  // Native token calculation
  const nativeRate = destChainConfig.nativeCurrency.symbol === 'ETH' ? 2640 : destChainConfig.nativeCurrency.symbol === 'SOL' ? 145 : 550;
  const estimatedNativeAmount = (netGasValueUsd / nativeRate).toFixed(5);

  const handleRefuel = () => {
    const destAddress = destChainConfig.type === 'solana' ? solanaAddress : evmAddress;

    onTriggerModal({
      title: 'Emergency Gas Refuel',
      actionName: `Instant Refuel (~8s)`,
      sourceDetails: {
        label: `Sending from ${sourceChainConfig.name}`,
        items: [`${refuelTierUsd.toFixed(2)} USDC on ${sourceChainConfig.name}`],
        totalUsd: refuelTierUsd,
      },
      destinationDetails: {
        label: `You Receive on ${destChainConfig.name}`,
        asset: destChainConfig.nativeCurrency.symbol,
        estimatedAmount: estimatedNativeAmount,
        destinationAddress: destAddress,
      },
      feeBreakdown: {
        platformFeeUsd: flatFeeUsd,
        platformFeePercent: 'Flat Rate',
        treasuryAddress: destChainConfig.type === 'solana' ? PROTOCOL_CONFIG.defaultSolanaTreasury : PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.005,
      },
      onExecuteConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1600));
        onRefuelSuccess(flatFeeUsd);
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
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Fuel className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white">1-Click Emergency Gas Station</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Stuck with zero native gas on Base, Arbitrum, zkSync, or Solana? 
              Refuel native gas on any chain instantly using any token from another chain in under 10 seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/30 px-4 py-2.5 text-xs text-emerald-300">
            <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold">Relay Speed: ~8 Seconds</span>
              <p className="text-[11px] text-slate-400">Powered by Across & deBridge liquidity pools</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Refuel Card */}
      <div className="max-w-2xl mx-auto glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* From Chain */}
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-2">
            <span className="text-xs text-slate-400 font-medium">I Have Funds On:</span>
            <select
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SUPPORTED_CHAINS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">Deducting from your connected wallet</p>
          </div>

          {/* To Chain */}
          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-2">
            <span className="text-xs text-slate-400 font-medium">I Need Gas On:</span>
            <select
              value={toChain}
              onChange={(e) => setToChain(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SUPPORTED_CHAINS.filter((c) => c.id !== fromChain).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name} ({c.nativeCurrency.symbol})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">Delivered directly as native {destChainConfig.nativeCurrency.symbol}</p>
          </div>
        </div>

        {/* Refuel Amount Presets */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 font-medium">Select Refuel Amount</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { usd: 5, label: 'Starter', desc: '~300 txs' },
              { usd: 10, label: 'Popular', desc: '~800 txs' },
              { usd: 25, label: 'Power', desc: '~2500 txs' },
            ].map((tier) => (
              <button
                key={tier.usd}
                onClick={() => setRefuelTierUsd(tier.usd)}
                className={`p-3 rounded-xl border text-center transition ${
                  refuelTierUsd === tier.usd
                    ? 'border-blue-500 bg-blue-600/15 text-white ring-1 ring-blue-500/30'
                    : 'border-white/5 bg-slate-950/50 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-base font-bold font-mono">${tier.usd}</div>
                <div className="text-xs font-semibold text-slate-300">{tier.label}</div>
                <div className="text-[10px] text-slate-500">{tier.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Output Estimation & Fee Card */}
        <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">You will receive:</span>
            <div className="text-right">
              <span className="text-lg font-bold font-mono text-emerald-400">
                ~{estimatedNativeAmount} {destChainConfig.nativeCurrency.symbol}
              </span>
              <p className="text-[11px] text-slate-500">(${(refuelTierUsd - flatFeeUsd).toFixed(2)} value)</p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-2 flex items-center justify-between text-xs text-slate-400">
            <span>NEXUS-0 Fixed Fee:</span>
            <span className="font-mono text-slate-200">${flatFeeUsd.toFixed(2)} USD</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Estimated Delivery:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <Clock className="h-3 w-3" /> 8-12 seconds
            </span>
          </div>
        </div>

        {/* Refuel Action Button */}
        <button
          onClick={handleRefuel}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:from-amber-400 hover:to-orange-500"
        >
          <Fuel className="h-4 w-4" />
          <span>Refuel Gas on {destChainConfig.name}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
