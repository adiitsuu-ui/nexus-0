import React, { useState } from 'react';
import { Flame, ShieldAlert, Download, CheckCircle2, FileCheck } from 'lucide-react';
import type { DeadTokenItem } from '../types';
import { INITIAL_DEAD_TOKENS } from '../lib/mockData';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface TaxCrematorProps {
  onCremateSuccess: (feeUsd: number, realizedLossUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const TaxCremator: React.FC<TaxCrematorProps> = ({
  onCremateSuccess,
  onTriggerModal,
  evmAddress,
}) => {
  const [tokens, setTokens] = useState<DeadTokenItem[]>(INITIAL_DEAD_TOKENS);
  const [taxBracket, setTaxBracket] = useState<number>(30); // 30% tax bracket
  const [certificates, setCertificates] = useState<
    Array<{
      id: string;
      tokenSymbol: string;
      burnedAmount: number;
      lossUsd: number;
      timestamp: string;
      txHash: string;
    }>
  >([]);

  const toggleSelect = (id: string) => {
    setTokens((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  const selectAll = () => {
    const allSelected = tokens.every((t) => t.selected);
    setTokens((prev) => prev.map((t) => ({ ...t, selected: !allSelected })));
  };

  const selectedTokens = tokens.filter((t) => t.selected);
  const totalCostBasis = selectedTokens.reduce((acc, t) => acc + t.costBasisUsd, 0);
  const totalCurrentVal = selectedTokens.reduce((acc, t) => acc + t.currentValueUsd, 0);
  const totalRealizedLoss = totalCostBasis - totalCurrentVal;
  const estimatedTaxSavings = (totalRealizedLoss * taxBracket) / 100;
  const feeUsd = PROTOCOL_CONFIG.feeRates.taxCrematorFixedUsd;

  const handleCremate = () => {
    if (selectedTokens.length === 0) return;

    onTriggerModal({
      title: 'Tax-Loss Cremator & Legal Disposal',
      actionName: `Cremate ${selectedTokens.length} Dead Tokens`,
      sourceDetails: {
        label: 'Tokens Sent to Burn Sink (0x...dEaD)',
        items: selectedTokens.map(
          (t) => `${t.balance.toLocaleString()} ${t.tokenSymbol} (Cost Basis: $${t.costBasisUsd.toLocaleString()})`
        ),
        totalUsd: totalCostBasis,
      },
      destinationDetails: {
        label: 'Verifiable Tax Loss Certificate',
        asset: 'Loss Realization Proof (EIP-712 / Event)',
        estimatedAmount: `-$${totalRealizedLoss.toLocaleString()} Realized Capital Loss`,
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd: feeUsd,
        platformFeePercent: `Flat $${feeUsd.toFixed(2)}`,
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.18,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1400));
        const newCerts = selectedTokens.map((t) => ({
          id: 'cert-' + Math.random().toString(36).substring(2, 9),
          tokenSymbol: t.tokenSymbol,
          burnedAmount: t.balance,
          lossUsd: t.unrealizedLossUsd,
          timestamp: new Date().toISOString(),
          txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        }));
        setCertificates((prev) => [...newCerts, ...prev]);
        setTokens((prev) => prev.filter((t) => !t.selected));
        onCremateSuccess(feeUsd, totalRealizedLoss);
      },
    });
  };

  const handleExportCertificates = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(certificates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NEXUS-0-Tax-Loss-Certificates-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-400 ring-1 ring-red-500/30">
                <Flame className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Tax-Loss Cremator & Proof Generator</h2>
                <p className="text-xs text-slate-400">
                  Dispose of zero-liquidity honeypots and rugged bags to legally realize capital loss deductions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-red-500/20 bg-red-950/30 px-4 py-2.5 text-xs text-red-300">
              <span className="block font-bold">Protocol Fee: $2.50 Flat</span>
              <span className="text-[11px] text-slate-400">Streamed direct to treasury</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Calculation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Selected Dead Bag Losses</span>
          <div className="text-2xl font-bold font-mono text-red-400">
            ${totalRealizedLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500">Unsellable on DEXes due to pulled liquidity</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Estimated Tax Savings</span>
            <select
              value={taxBracket}
              onChange={(e) => setTaxBracket(Number(e.target.value))}
              aria-label="Tax Bracket"
              className="rounded-lg border border-white/10 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value={20}>20% Bracket</option>
              <option value={30}>30% Bracket</option>
              <option value={37}>37% Bracket</option>
              <option value={45}>45% (High/EU)</option>
            </select>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ~${estimatedTaxSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500">Tax write-off value against other capital gains</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Cremation Execution Fee</span>
          <div className="text-2xl font-bold font-mono text-white">
            ${feeUsd.toFixed(2)} <span className="text-xs text-slate-400 font-sans">Flat</span>
          </div>
          <span className="text-[11px] text-emerald-400">Direct to Protocol Treasury</span>
        </div>
      </div>

      {/* Token Disposal List */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rugged & Zero-Liquidity Token Radar ({tokens.length})
            </h3>
          </div>

          {tokens.length > 0 && (
            <button
              onClick={selectAll}
              className="text-xs text-blue-400 hover:text-blue-300 transition font-medium"
            >
              {tokens.every((t) => t.selected) ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {tokens.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 opacity-60 mb-3" />
            <p className="text-sm font-semibold text-white">Zero Dead Tokens Detected!</p>
            <p className="text-xs text-slate-500 mt-1">Your wallet is free of rugged honeypots or unsellable dust.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                onClick={() => toggleSelect(token.id)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition cursor-pointer ${
                  token.selected
                    ? 'border-red-500/50 bg-red-950/20'
                    : 'border-white/5 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={token.selected}
                    onChange={() => {}}
                    className="h-4 w-4 rounded border-white/20 bg-slate-950 text-red-600 focus:ring-0"
                  />
                  <span className="text-2xl">{token.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{token.tokenSymbol}</span>
                      <span className="text-xs text-slate-400">({token.tokenName})</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300 uppercase">
                        {token.chain}
                      </span>
                    </div>
                    <p className="text-xs text-red-400/90 mt-0.5 flex items-center gap-1">
                      <span>⚠️ {token.rugReason}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  <div className="text-xs font-mono text-slate-400">
                    Holding: {token.balance.toLocaleString()} {token.tokenSymbol}
                  </div>
                  <div className="text-sm font-bold font-mono text-red-400">
                    Loss: -${token.unrealizedLossUsd.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tokens.length > 0 && (
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-slate-400">
              <span className="text-white font-bold">{selectedTokens.length} tokens</span> selected for legal on-chain disposal.
            </div>

            <button
              onClick={handleCremate}
              disabled={selectedTokens.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-xs font-bold text-white hover:bg-red-500 disabled:opacity-40 transition shadow-lg shadow-red-600/25"
            >
              <Flame className="h-4 w-4" />
              <span>Cremate & Realize Losses (${feeUsd.toFixed(2)} Fee)</span>
            </button>
          </div>
        )}
      </div>

      {/* Generated Certificates / Proofs */}
      {certificates.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Audited Disposal Certificates ({certificates.length})
              </h3>
            </div>

            <button
              onClick={handleExportCertificates}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export Tax JSON</span>
            </button>
          </div>

          <div className="space-y-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-emerald-500/20 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-white font-bold">{cert.tokenSymbol}</span>
                    <span className="text-slate-400 text-[11px] ml-2 font-sans">
                      Disposed: {cert.burnedAmount.toLocaleString()} tokens
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">-${cert.lossUsd.toLocaleString()} Realized</span>
                  <span className="text-[10px] text-slate-500">Tx: {cert.txHash.slice(0, 10)}...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default TaxCremator;
