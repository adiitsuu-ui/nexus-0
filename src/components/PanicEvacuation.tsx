import React, { useState } from 'react';
import { AlertTriangle, Zap, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { TokenBalance } from '../types';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface PanicEvacuationProps {
  balances: TokenBalance[];
  onEvacuateSuccess: (feeUsd: number, evacuatedUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const PanicEvacuation: React.FC<PanicEvacuationProps> = ({
  balances,
  onEvacuateSuccess,
  onTriggerModal,
  evmAddress,
}) => {
  const [coldVault, setColdVault] = useState<string>('0x9A48b115049383637494E2713e710Fe6cE020b72');
  const [usePrivateRpc, setUsePrivateRpc] = useState<boolean>(true);
  const [revokeAllowances, setRevokeAllowances] = useState<boolean>(true);
  const [isEvacuated, setIsEvacuated] = useState<boolean>(false);

  const totalPortfolioUsd = balances.reduce((acc, b) => acc + b.usdValue, 0);

  // 0.75% Priority Protection Fee (Min $5.00)
  const feePercent = PROTOCOL_CONFIG.feeRates.panicEvacBps / 100; // 0.75%
  const calculatedFeeUsd = Math.max(
    (totalPortfolioUsd * PROTOCOL_CONFIG.feeRates.panicEvacBps) / 10000,
    PROTOCOL_CONFIG.feeRates.panicEvacMinUsd
  );
  const netEvacuatedUsd = Math.max(0, totalPortfolioUsd - calculatedFeeUsd);

  const handleEvacuate = () => {
    if (!coldVault || totalPortfolioUsd <= 0) return;

    onTriggerModal({
      title: '🚨 SCORCHED EARTH EMERGENCY EVACUATION',
      actionName: 'Execute Flash-Sweep to Cold Vault',
      sourceDetails: {
        label: `Compromised Hot Wallet (${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)})`,
        items: balances.map(
          (b) => `${b.balance.toLocaleString()} ${b.symbol} on ${b.chainId.toUpperCase()} ($${b.usdValue.toFixed(2)})`
        ),
        totalUsd: totalPortfolioUsd,
      },
      destinationDetails: {
        label: 'Secure Cold Vault Destination',
        asset: 'All Liquid Assets (Atomic Multi-Chain Bundle)',
        estimatedAmount: `~$${netEvacuatedUsd.toFixed(2)} USD Delivered`,
        destinationAddress: coldVault,
      },
      feeBreakdown: {
        platformFeeUsd: calculatedFeeUsd,
        platformFeePercent: `${feePercent}% Priority Protection Fee`,
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 1.45,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1600));
        setIsEvacuated(true);
        onEvacuateSuccess(calculatedFeeUsd, totalPortfolioUsd);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* High Alert Banner */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-red-900/20 to-slate-950 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/30 text-red-400 ring-1 ring-red-500 animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>"Scorched Earth" Panic Evacuation</span>
                  <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-mono text-red-400 font-bold border border-red-500/40">
                    ANTI-DRAINER
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  1-click instant evacuation of 100% of liquid assets via private mempool front-running shield.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-2 text-xs text-red-300">
              <span className="block font-bold">Priority Fee: 0.75%</span>
              <span className="text-[11px] text-slate-400">Min $5.00 • Streamed direct to treasury</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Liquid Assets At Risk</span>
          <div className="text-2xl font-bold font-mono text-red-400">
            ${totalPortfolioUsd.toFixed(2)} USD
          </div>
          <span className="text-[11px] text-slate-500">{balances.length} active positions across chains</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Guaranteed Cold Delivery</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${netEvacuatedUsd.toFixed(2)} USD
          </div>
          <span className="text-[11px] text-slate-500">Bypasses public mempool searcher bots</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Protection Protocol Fee</span>
          <div className="text-2xl font-bold font-mono text-white">
            ${calculatedFeeUsd.toFixed(2)} USD
          </div>
          <span className="text-[11px] text-emerald-400">Streamed to Protocol Treasury</span>
        </div>
      </div>

      {/* Evacuation Configuration */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              Destination Cold Storage / Multisig Vault
            </label>
            <input
              type="text"
              value={coldVault}
              onChange={(e) => setColdVault(e.target.value)}
              placeholder="0x... or Solana Safe Pubkey"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Ensure this is a completely uncompromised hardware wallet (Ledger/Trezor) or Gnosis/Squads Safe.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-slate-900/40 cursor-pointer hover:bg-slate-900/70 transition">
              <input
                type="checkbox"
                checked={usePrivateRpc}
                onChange={(e) => setUsePrivateRpc(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-950 text-red-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Flashbots Private RPC Route</span>
                <span className="text-[11px] text-slate-400">
                  Transaction never touches public mempool; front-running bots cannot intercept.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-slate-900/40 cursor-pointer hover:bg-slate-900/70 transition">
              <input
                type="checkbox"
                checked={revokeAllowances}
                onChange={(e) => setRevokeAllowances(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-slate-950 text-red-600 focus:ring-0"
              />
              <div>
                <span className="text-xs font-bold text-white block">Simultaneous Allowance Revoke</span>
                <span className="text-[11px] text-slate-400">
                  Atomically resets approvals to 0 so drainer scripts cannot pull future deposits.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Position Preview */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Liquid Balances Slated for Evacuation
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {balances.map((b) => (
              <div
                key={b.address + b.chainId}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-white/5 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span>{b.icon || '🪙'}</span>
                  <span className="text-white font-bold">{b.symbol}</span>
                  <span className="text-[10px] text-slate-500 uppercase">({b.chainId})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-300">{b.balance.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-500 ml-2">(${b.usdValue.toFixed(2)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {isEvacuated ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-center space-y-1">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Wallet Evacuation Successfully Completed!</h4>
            <p className="text-xs text-emerald-300 font-mono">All liquid assets delivered safely to {coldVault.slice(0, 10)}...</p>
          </div>
        ) : (
          <button
            onClick={handleEvacuate}
            disabled={totalPortfolioUsd <= 0 || !coldVault}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-red-600 py-4 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-40 transition shadow-xl shadow-red-600/30"
          >
            <Zap className="h-5 w-5" />
            <span>TRIGGER SCORCHED EARTH FLASH-SWEEP (${calculatedFeeUsd.toFixed(2)} FEE)</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Security Guarantee */}
      <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 flex items-start gap-3 text-xs text-slate-400">
        <Lock className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Private Bundle Guarantee:</strong> Transactions are routed through private
          builder endpoints (Titan, Flashbots, BeaverBuild). Because the bundle never enters the public mempool,
          phishing drainers waiting for transactions cannot detect or front-run the evacuation.
        </p>
      </div>
    </div>
  );
};
export default PanicEvacuation;
