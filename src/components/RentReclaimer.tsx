import React, { useState } from 'react';
import { Coins, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import type { SolanaRentAccount } from '../types';
import { INITIAL_RENT_ACCOUNTS } from '../lib/mockData';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface RentReclaimerProps {
  onReclaimSuccess: (feeUsd: number, totalSolReclaimed: number) => void;
  onTriggerModal: (details: any) => void;
  solanaAddress: string;
}

export const RentReclaimer: React.FC<RentReclaimerProps> = ({
  onReclaimSuccess,
  onTriggerModal,
  solanaAddress,
}) => {
  const [accounts, setAccounts] = useState<SolanaRentAccount[]>(INITIAL_RENT_ACCOUNTS);
  const [solPriceUsd] = useState<number>(145.0); // Live SOL price reference
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const toggleSelect = (pubkey: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.pubkey === pubkey ? { ...a, selected: !a.selected } : a))
    );
  };

  const selectAll = () => {
    const allSelected = accounts.every((a) => a.selected);
    setAccounts((prev) => prev.map((a) => ({ ...a, selected: !allSelected })));
  };

  const selectedAccounts = accounts.filter((a) => a.selected);
  const totalRentSol = selectedAccounts.reduce((acc, a) => acc + a.rentSol, 0);
  const totalRentUsd = totalRentSol * solPriceUsd;

  // 15% Protocol Performance Fee
  const feeCutPercent = PROTOCOL_CONFIG.feeRates.rentReclaimerCutPercent; // 15%
  const protocolFeeSol = (totalRentSol * feeCutPercent) / 100;
  const protocolFeeUsd = protocolFeeSol * solPriceUsd;
  const userPayoutSol = totalRentSol - protocolFeeSol;
  const userPayoutUsd = userPayoutSol * solPriceUsd;

  const handleScanAgain = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 800);
  };

  const handleReclaim = () => {
    if (selectedAccounts.length === 0) return;

    onTriggerModal({
      title: 'Solana Zombie Rent Extraction',
      actionName: `Close ${selectedAccounts.length} Empty ATAs`,
      sourceDetails: {
        label: 'Empty Accounts to Close (0 Balance)',
        items: selectedAccounts.map(
          (a) => `${a.tokenSymbol} (${a.pubkey}) -> Reclaims ${a.rentSol.toFixed(6)} SOL`
        ),
        totalUsd: totalRentUsd,
      },
      destinationDetails: {
        label: 'Net Rent Refund to Your Solana Wallet',
        asset: 'SOL (Native)',
        estimatedAmount: `+${userPayoutSol.toFixed(6)} SOL (~$${userPayoutUsd.toFixed(2)})`,
        destinationAddress: solanaAddress,
      },
      feeBreakdown: {
        platformFeeUsd: protocolFeeUsd,
        platformFeePercent: `${feeCutPercent}% Performance Cut (${protocolFeeSol.toFixed(6)} SOL)`,
        treasuryAddress: PROTOCOL_CONFIG.defaultSolanaTreasury,
        networkGasUsd: 0.0005,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1200));
        setAccounts((prev) => prev.filter((a) => !a.selected));
        onReclaimSuccess(protocolFeeUsd, totalRentSol);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30">
                <Coins className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Solana Zombie Rent Reclaimer</h2>
                <p className="text-xs text-slate-400">
                  Reclaim ~0.002039 SOL locked in abandoned token accounts from past trades.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleScanAgain}
              disabled={isScanning}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-purple-400 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning...' : 'Rescan Wallet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Discovery & Payout Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Locked Storage Rent</span>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {totalRentSol.toFixed(6)} SOL
          </div>
          <span className="text-[11px] text-slate-500">
            ≈ ${totalRentUsd.toFixed(2)} USD in {selectedAccounts.length} closed token accounts
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Your Pure Payout (85%)</span>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 font-bold">
              FREE MONEY
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            +{userPayoutSol.toFixed(6)} SOL
          </div>
          <span className="text-[11px] text-slate-500">
            ≈ +${userPayoutUsd.toFixed(2)} USD straight back to your wallet
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Protocol Fee Cut ({feeCutPercent}%)</span>
          <div className="text-2xl font-bold font-mono text-white">
            {protocolFeeSol.toFixed(6)} SOL
          </div>
          <span className="text-[11px] text-purple-400">
            ≈ ${protocolFeeUsd.toFixed(2)} USD forwarded to Solana Treasury
          </span>
        </div>
      </div>

      {/* Account Scanner List */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Empty Token Accounts Detected ({accounts.length})
            </h3>
          </div>

          {accounts.length > 0 && (
            <button
              onClick={selectAll}
              className="text-xs text-purple-400 hover:text-purple-300 transition font-medium"
            >
              {accounts.every((a) => a.selected) ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {accounts.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="mx-auto h-12 w-12 text-purple-400 opacity-60 mb-3" />
            <p className="text-sm font-semibold text-white">All Empty Accounts Reclaimed!</p>
            <p className="text-xs text-slate-500 mt-1">
              Zero zombie rent accounts remain. Every rent lamport has been returned to your wallet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.pubkey}
                onClick={() => toggleSelect(acc.pubkey)}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                  acc.selected
                    ? 'border-purple-500/50 bg-purple-950/20'
                    : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={acc.selected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-white/20 bg-slate-950 text-purple-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-bold text-white text-xs font-mono">{acc.tokenSymbol}</span>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ATA: {acc.pubkey}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-emerald-400 block">
                    +{acc.rentSol.toFixed(6)} SOL
                  </span>
                  <span className="text-[10px] text-slate-500">${acc.rentUsd.toFixed(2)} USD</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {accounts.length > 0 && (
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-slate-400">
              Selected <span className="text-white font-bold">{selectedAccounts.length} accounts</span> to close.
              You will receive <span className="text-emerald-400 font-bold">+{userPayoutSol.toFixed(6)} SOL</span>.
            </div>

            <button
              onClick={handleReclaim}
              disabled={selectedAccounts.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-40 transition shadow-lg shadow-purple-600/25"
            >
              <Coins className="h-4 w-4" />
              <span>Reclaim {totalRentSol.toFixed(4)} SOL (15% Cut)</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 flex items-start gap-3 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          <strong className="text-slate-200">Zero-Risk Invariant:</strong> Solana SPL Token program only permits closing
          accounts with an exact token balance of 0. If an account has even 1 token, the transaction will revert
          safely without any risk to your active positions.
        </p>
      </div>
    </div>
  );
};
export default RentReclaimer;
