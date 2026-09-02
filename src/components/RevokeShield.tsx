import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import type { AllowanceRiskItem } from '../types';
import { INITIAL_RISKY_ALLOWANCES } from '../lib/mockData';

interface RevokeShieldProps {
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const RevokeShield: React.FC<RevokeShieldProps> = ({ onTriggerModal, evmAddress }) => {
  const [allowances, setAllowances] = useState<AllowanceRiskItem[]>(INITIAL_RISKY_ALLOWANCES);

  const toggleSelect = (id: string) => {
    setAllowances(
      allowances.map((a) => (a.id === id ? { ...a, selected: !a.selected } : a))
    );
  };

  const selectedToRevoke = allowances.filter((a) => a.selected);
  const criticalCount = allowances.filter((a) => a.riskLevel === 'critical').length;
  const totalExposureUsd = selectedToRevoke.reduce((acc, a) => acc + a.exposureUsd, 0);

  const handleRevoke = () => {
    if (selectedToRevoke.length === 0) return;

    onTriggerModal({
      title: 'Revoke Risky Token Approvals',
      actionName: `Batch Revoke (${selectedToRevoke.length} Spend Approvals)`,
      sourceDetails: {
        label: 'Approvals to Reset to 0',
        items: selectedToRevoke.map((a) => `${a.tokenSymbol} -> ${a.spenderName}`),
        totalUsd: totalExposureUsd,
      },
      destinationDetails: {
        label: 'Protected Capital',
        asset: 'Security Reset',
        estimatedAmount: `$${totalExposureUsd.toLocaleString()} Safe`,
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd: 0.50,
        platformFeePercent: 'Batch Protection',
        treasuryAddress: '0x71C67073755129441Cd5426154562473D1b5e589',
        networkGasUsd: 0.004,
      },
      onExecuteConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAllowances(allowances.filter((a) => !a.selected));
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
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Wallet Revoke Shield & Drainer Defense</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Trading hundreds of meme coins leaves infinite approvals to unverified spender contracts.
              NEXUS-0 Shield scans your wallet across all chains and resets risky allowances to zero.
            </p>
          </div>

          <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-xs font-mono space-y-1 text-right">
            <span className="text-slate-400">Risk Assessment</span>
            <div className="text-sm font-bold text-rose-400">
              {criticalCount} Critical Flags Found
            </div>
            <span className="text-slate-400 font-sans">${totalExposureUsd.toLocaleString()} at risk</span>
          </div>
        </div>
      </div>

      {/* Main Approvals List */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Active Spender Approvals ({allowances.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {selectedToRevoke.length} selected for revocation
          </span>
        </div>

        {allowances.length === 0 ? (
          <div className="py-12 text-center text-emerald-400 text-sm flex flex-col items-center gap-2">
            <ShieldCheck className="h-10 w-10 text-emerald-400" />
            <span className="font-bold">100% Secure! No risky or unauthorized approvals detected.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {allowances.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border cursor-pointer transition ${
                  item.selected
                    ? 'border-rose-500/40 bg-rose-950/15'
                    : 'border-white/5 bg-slate-950/60 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-white/20 bg-slate-800 text-rose-500 focus:ring-rose-400"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.spenderName}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-400">
                        {item.chain}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                          item.riskLevel === 'critical'
                            ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40'
                            : item.riskLevel === 'caution'
                            ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                        }`}
                      >
                        {item.riskLevel}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      Spender: {item.spenderAddress} | Token: <span className="text-white font-bold">{item.tokenSymbol}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right sm:pl-4">
                  <div className="text-xs font-mono font-bold text-rose-300">
                    Allowance: {item.allowanceAmount}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Exposure: ~${item.exposureUsd.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleRevoke}
                disabled={selectedToRevoke.length === 0}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
                  selectedToRevoke.length > 0
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25 hover:bg-rose-500'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>Batch Revoke Selected ({selectedToRevoke.length})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
