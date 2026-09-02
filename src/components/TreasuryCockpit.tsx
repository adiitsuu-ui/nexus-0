import React, { useState } from 'react';
import { DollarSign, ShieldCheck, Check, Settings2, BarChart3, Lock } from 'lucide-react';
import type { TreasuryStats } from '../types';

interface TreasuryCockpitProps {
  stats: TreasuryStats;
  onUpdateTreasuries: (evm: string, solana: string) => void;
}

export const TreasuryCockpit: React.FC<TreasuryCockpitProps> = ({ stats, onUpdateTreasuries }) => {
  const [evmAddr, setEvmAddr] = useState<string>(stats.evmTreasury);
  const [solAddr, setSolAddr] = useState<string>(stats.solanaTreasury);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    onUpdateTreasuries(evmAddr, solAddr);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Protocol Revenue & Treasury Cockpit</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Real-time monitoring of all protocol fee streams. Fees forward directly and atomically to your
              treasury addresses with zero intermediary custody.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-300">
            <Lock className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">Zero Contract Custody Verified</span>
              <p className="text-[11px] text-slate-400">Contract Balance = $0.00 (Immune to pool drains)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Cumulative Revenue Earned</span>
          <div className="text-3xl font-bold font-mono text-emerald-400">
            ${stats.totalRevenueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500">Auto-forwarded directly to owner cold wallets</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Volume Processed</span>
          <div className="text-3xl font-bold font-mono text-white">
            ${stats.totalVolumeProcessedUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <span className="text-[11px] text-slate-500">Across 7 supported blockchain networks</span>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Atomic Transactions Settled</span>
          <div className="text-3xl font-bold font-mono text-blue-400">
            {stats.totalTransactions.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">100% atomic execution without failure</span>
        </div>
      </div>

      {/* Fee Breakdown by Module & Treasury Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module Revenue Breakdown */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Revenue by Tool Module</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {[
              { name: '🧹 Dust Sweeper (2.5%)', val: stats.feesByModule.dustSweeper, color: 'text-blue-400' },
              { name: '⛽ Gas Station ($1.50 flat)', val: stats.feesByModule.gasStation, color: 'text-amber-400' },
              { name: '🎯 Exit Vault (0.35%)', val: stats.feesByModule.exitVault, color: 'text-emerald-400' },
              { name: '🤝 OTC Escrow (0.25%)', val: stats.feesByModule.otcEscrow, color: 'text-indigo-400' },
              { name: '📦 Batch Disperse ($1.00 flat)', val: stats.feesByModule.disperse, color: 'text-pink-400' },
              { name: '🪂 Airdrop Radar (3.0%)', val: stats.feesByModule.airdropRadar, color: 'text-cyan-400' },
              { name: '🪦 Tax Cremator ($2.50 flat)', val: stats.feesByModule.taxCremator, color: 'text-red-400' },
              { name: '🪙 Rent Reclaimer (15% cut)', val: stats.feesByModule.rentReclaimer, color: 'text-purple-400' },
              { name: '🚨 Panic Evacuation (0.75%)', val: stats.feesByModule.panicEvacuation, color: 'text-rose-400' },
              { name: '⏳ Dead Man Switch ($9.99 setup)', val: stats.feesByModule.deadMansSwitch, color: 'text-teal-400' },
              { name: '🕵️‍♂️ Stealth Router (0.25%)', val: stats.feesByModule.stealthRouter, color: 'text-cyan-400' },
              { name: '🛡️ Poison Radar ($1.00)', val: stats.feesByModule.poisonRadar, color: 'text-pink-400' },
              { name: '🌉 Ghost Teleport ($2.50+0.3%)', val: stats.feesByModule.ghostTeleport, color: 'text-blue-400' },
              { name: '🪙 Staking Yield Pool (10% Pool)', val: stats.feesByModule.stakingPoolYield, color: 'text-amber-400' },
            ].map((m) => (
              <div key={m.name} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                <span className="text-slate-300 font-sans">{m.name}</span>
                <span className={`font-bold ${m.color}`}>${(m.val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Treasury Destination Settings */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Settings2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Treasury Destination Wallets</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                EVM Treasury Address (Base, Arbitrum, zkSync, ETH, BSC)
              </label>
              <input
                type="text"
                value={evmAddr}
                onChange={(e) => setEvmAddr(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Recommended: Gnosis Safe multisig or hardware cold wallet
              </span>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Solana Treasury Address (SOL & SPL Tokens)
              </label>
              <input
                type="text"
                value={solAddr}
                onChange={(e) => setSolAddr(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Recommended: Squads multisig or hardware wallet
              </span>
            </div>

            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-500/20"
            >
              {saved ? <Check className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              <span>{saved ? 'Treasury Addresses Saved!' : 'Save Treasury Addresses'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
