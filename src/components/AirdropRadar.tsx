import React, { useState } from 'react';
import { Gift, CheckCircle2, Clock, ArrowRight, Sparkles } from 'lucide-react';
import type { AirdropClaim } from '../types';
import { INITIAL_AIRDROPS } from '../lib/mockData';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface AirdropRadarProps {
  onClaimSuccess: (feeUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const AirdropRadar: React.FC<AirdropRadarProps> = ({
  onClaimSuccess,
  onTriggerModal,
  evmAddress,
}) => {
  const [airdrops, setAirdrops] = useState<AirdropClaim[]>(INITIAL_AIRDROPS);

  const unclaimedList = airdrops.filter((d) => d.status === 'unclaimed');
  const totalUnclaimedUsd = unclaimedList.reduce((acc, d) => acc + d.usdValue, 0);

  const feeRate = PROTOCOL_CONFIG.feeRates.airdropRecoveryBps / 10000; // 3%
  const feeUsd = totalUnclaimedUsd * feeRate;

  const handleClaimSingle = (drop: AirdropClaim) => {
    const singleFeeUsd = drop.usdValue * feeRate;

    onTriggerModal({
      title: `Claim Airdrop: ${drop.protocol}`,
      actionName: '1-Click Claim Rewards',
      sourceDetails: {
        label: 'Airdrop Allocation',
        items: [`${drop.unclaimedAmount} ${drop.tokenSymbol} ($${drop.usdValue.toFixed(2)})`],
        totalUsd: drop.usdValue,
      },
      destinationDetails: {
        label: 'Deposited Into Your Wallet',
        asset: drop.tokenSymbol,
        estimatedAmount: `${(drop.unclaimedAmount * 0.97).toFixed(2)} ${drop.tokenSymbol}`,
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd: singleFeeUsd,
        platformFeePercent: '3.00% finder fee',
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.005,
      },
      onExecuteConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1400));
        setAirdrops(
          airdrops.map((d) => (d.id === drop.id ? { ...d, status: 'claimed' } : d))
        );
        onClaimSuccess(singleFeeUsd);
      },
    });
  };

  const handleClaimAll = () => {
    if (unclaimedList.length === 0) return;

    onTriggerModal({
      title: 'Batch Claim All Discovered Airdrops',
      actionName: `Claim All (${unclaimedList.length} Protocols)`,
      sourceDetails: {
        label: 'Unclaimed Rewards',
        items: unclaimedList.map((d) => `${d.protocol}: ${d.unclaimedAmount} ${d.tokenSymbol}`),
        totalUsd: totalUnclaimedUsd,
      },
      destinationDetails: {
        label: 'Net Output Value',
        asset: 'Tokens',
        estimatedAmount: `$${(totalUnclaimedUsd - feeUsd).toFixed(2)} USD`,
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd: feeUsd,
        platformFeePercent: '3.00% finder fee',
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.018,
      },
      onExecuteConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1600));
        setAirdrops(airdrops.map((d) => ({ ...d, status: 'claimed' })));
        onClaimSuccess(feeUsd);
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
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Gift className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Multi-Chain Airdrop Radar</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Never miss unclaimed tokens again. NEXUS-0 Radar scans 100+ retroactive distributions across
              Base, Arbitrum, zkSync, and Solana to recover your unclaimed allocations.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-xs font-mono space-y-1 text-right">
            <span className="text-slate-400">Found Allocation</span>
            <div className="text-2xl font-bold text-cyan-400">
              ${totalUnclaimedUsd.toFixed(2)} <span className="text-xs text-slate-400 font-sans">USD</span>
            </div>
            <span className="text-slate-500 font-sans">{unclaimedList.length} claims ready</span>
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Discovered Grants & Airdrops ({airdrops.length})
          </h3>

          {unclaimedList.length > 0 && (
            <button
              onClick={handleClaimAll}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-cyan-500/20 hover:bg-cyan-500 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Claim All (${totalUnclaimedUsd.toFixed(2)})</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {airdrops.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border p-4 flex flex-col justify-between space-y-4 transition ${
                item.status === 'claimed'
                  ? 'border-white/5 bg-slate-950/30 opacity-60'
                  : 'border-cyan-500/20 bg-slate-950/60 hover:border-cyan-500/40'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.logo}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.protocol}</h4>
                      <span className="text-[10px] font-mono uppercase text-slate-400">Chain: {item.chain}</span>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      item.status === 'claimed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="rounded-lg bg-slate-900/80 p-3 flex justify-between items-center font-mono">
                  <div>
                    <div className="text-xs text-slate-400">Reward:</div>
                    <div className="text-sm font-bold text-white">
                      {item.unclaimedAmount} {item.tokenSymbol}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Value:</div>
                    <div className="text-sm font-bold text-emerald-400">${item.usdValue.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="h-3 w-3" /> Expiry: {item.expiryDate}
                </div>
              </div>

              {item.status === 'unclaimed' ? (
                <button
                  onClick={() => handleClaimSingle(item)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600/20 py-2 text-xs font-semibold text-cyan-300 ring-1 ring-cyan-500/40 hover:bg-cyan-600 hover:text-white transition"
                >
                  <span>1-Click Claim</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 font-medium py-1">
                  <CheckCircle2 className="h-4 w-4" /> Claimed Successfully
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
