import React, { useState } from 'react';
import { EyeOff, ArrowRight, RefreshCw, Lock } from 'lucide-react';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface StealthRouterProps {
  onStealthSuccess: (feeUsd: number, volumeUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const StealthRouter: React.FC<StealthRouterProps> = ({
  onStealthSuccess,
  onTriggerModal,
  evmAddress,
}) => {
  const [sourceAmount, setSourceAmount] = useState<number>(2.5);
  const [sourceToken, setSourceToken] = useState<string>('ETH');
  const [targetToken, setTargetToken] = useState<string>('USDC');
  const [cleanDestination, setCleanDestination] = useState<string>('0x12a9C381944810239104A12B98023190C19022e1');
  const [ephemeralKey, setEphemeralKey] = useState<string>(
    () => '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  );

  const ethPrice = 2640;
  const inUsdValue = sourceAmount * ethPrice;
  const feePercent = PROTOCOL_CONFIG.feeRates.stealthRouterBps / 100; // 0.25%
  const feeUsd = Math.max((inUsdValue * PROTOCOL_CONFIG.feeRates.stealthRouterBps) / 10000, PROTOCOL_CONFIG.feeRates.stealthRouterMinUsd);
  const netOutputUsd = inUsdValue - feeUsd;

  const generateNewBurner = () => {
    const newBurner = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setEphemeralKey(newBurner);
  };

  const handleExecuteStealth = () => {
    if (sourceAmount <= 0 || !cleanDestination) return;

    onTriggerModal({
      title: '🕵️‍♂️ Anti-Arkham Stealth Execution',
      actionName: 'Execute Unlinkable Stealth Swap',
      sourceDetails: {
        label: `Source Hot Wallet (${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)})`,
        items: [
          `Selling: ${sourceAmount} ${sourceToken} ($${inUsdValue.toFixed(2)} USD)`,
          `Ephemeral Hop Address: ${ephemeralKey}`,
          `Linkage Break: Zero wallet graph association`,
        ],
        totalUsd: inUsdValue,
      },
      destinationDetails: {
        label: 'Clean Unlinked Recipient Vault',
        asset: `${targetToken} (Delivered via Relayer)`,
        estimatedAmount: `~${netOutputUsd.toFixed(2)} ${targetToken}`,
        destinationAddress: cleanDestination,
      },
      feeBreakdown: {
        platformFeeUsd: feeUsd,
        platformFeePercent: `${feePercent}% Stealth Fee`,
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.85,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1500));
        generateNewBurner();
        onStealthSuccess(feeUsd, inUsdValue);
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
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 ring-1 ring-cyan-500/30">
                <EyeOff className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Stealth Sub-Account & Privacy Relayer</span>
                  <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/20 font-bold">
                    ANTI-ARKHAM
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Execute large swaps without alerting copy-traders, Arkham, DeBank, or Bubblemaps wallet profilers.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-2 text-xs text-cyan-300">
              <span className="block font-bold">Stealth Routing Fee: 0.25%</span>
              <span className="text-[11px] text-slate-400">Min $2.00 • Direct to Treasury</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Input Trading Capital</span>
          <div className="text-2xl font-bold font-mono text-white">
            ${inUsdValue.toFixed(2)} USD
          </div>
          <span className="text-[11px] text-slate-500">{sourceAmount} {sourceToken}</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Delivered to Clean Wallet</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${netOutputUsd.toFixed(2)} {targetToken}
          </div>
          <span className="text-[11px] text-slate-500">Unlinkable to source address</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Protocol Privacy Fee (0.25%)</span>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            ${feeUsd.toFixed(2)} USD
          </div>
          <span className="text-[11px] text-slate-500">Streamed to Protocol Treasury</span>
        </div>
      </div>

      {/* Interactive Router Form */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Input */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Source Asset & Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sourceAmount}
                  onChange={(e) => setSourceAmount(Number(e.target.value))}
                  step="0.1"
                  min="0.01"
                  className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <select
                  value={sourceToken}
                  onChange={(e) => setSourceToken(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400 font-medium">
                  Ephemeral Burner Address (Single-Use Hop)
                </label>
                <button
                  onClick={generateNewBurner}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Regenerate</span>
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={ephemeralKey}
                className="w-full rounded-xl border border-white/5 bg-slate-950/80 px-3.5 py-2.5 text-xs font-mono text-slate-400 focus:outline-none cursor-default"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Destroyed permanently after transaction settles.
              </span>
            </div>
          </div>

          {/* Destination Target */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Target Token
              </label>
              <select
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="USDC">USDC (USD Coin)</option>
                <option value="ETH">ETH (Native Ether)</option>
                <option value="BRETT">BRETT</option>
                <option value="DEGEN">DEGEN</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Clean Recipient Address (Cold / Secondary Wallet)
              </label>
              <input
                type="text"
                value={cleanDestination}
                onChange={(e) => setCleanDestination(e.target.value)}
                placeholder="0x... or Solana Address"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                This wallet receives the tokens via relayer with zero direct connection to your main wallet.
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>Multi-hop privacy relayer active. 0.25% fee forwarded to protocol treasury.</span>
          </div>

          <button
            onClick={handleExecuteStealth}
            disabled={sourceAmount <= 0 || !cleanDestination}
            className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-40 transition shadow-lg shadow-cyan-600/25"
          >
            <EyeOff className="h-4 w-4" />
            <span>Execute Stealth Swap (${feeUsd.toFixed(2)} Fee)</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default StealthRouter;
