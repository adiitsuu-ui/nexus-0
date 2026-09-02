import React, { useState } from 'react';
import { Send, Fuel, ArrowRight, Clock, Zap } from 'lucide-react';
import { PROTOCOL_CONFIG, SUPPORTED_CHAINS } from '../lib/constants';

interface GhostTeleportProps {
  onTeleportSuccess: (feeUsd: number, volumeUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
  solanaAddress: string;
}

export const GhostTeleport: React.FC<GhostTeleportProps> = ({
  onTeleportSuccess,
  onTriggerModal,
  evmAddress,
  solanaAddress,
}) => {
  const [fromChain, setFromChain] = useState<string>('solana');
  const [toChain, setToChain] = useState<string>('base');
  const [amount, setAmount] = useState<number>(500);
  const [tokenSymbol, setTokenSymbol] = useState<string>('USDC');

  const destChainConfig = SUPPORTED_CHAINS.find((c) => c.id === toChain) || SUPPORTED_CHAINS[0];

  // Fee calculation: $2.50 flat + 0.30%
  const flatFee = PROTOCOL_CONFIG.feeRates.ghostTeleportFixedUsd; // $2.50
  const percentFee = (amount * PROTOCOL_CONFIG.feeRates.ghostTeleportBps) / 10000;
  const totalFeeUsd = flatFee + percentFee;

  // $5.00 native gas pre-funded on destination
  const prefundedGasUsd = 5.00;
  const destNativePrice = toChain === 'solana' ? 145 : 2640;
  const prefundedGasNative = Number((prefundedGasUsd / destNativePrice).toFixed(5));

  const netReceivedTokens = amount - (percentFee + flatFee);

  const destinationRecipient = toChain === 'solana' ? solanaAddress : evmAddress;

  const handleTeleport = () => {
    if (amount <= 0) return;

    onTriggerModal({
      title: '🌉 Ghost Teleport (Gas-Included Cross-Chain Liquidity)',
      actionName: `Teleport ${amount} ${tokenSymbol} to ${destChainConfig.name}`,
      sourceDetails: {
        label: `Origin Network (${fromChain.toUpperCase()})`,
        items: [
          `Bridging: ${amount} ${tokenSymbol}`,
          `Origin Wallet: ${fromChain === 'solana' ? solanaAddress : evmAddress}`,
        ],
        totalUsd: amount,
      },
      destinationDetails: {
        label: `Destination Network (${destChainConfig.name})`,
        asset: `${tokenSymbol} + Pre-Funded Native Gas`,
        estimatedAmount: `${netReceivedTokens.toFixed(2)} ${tokenSymbol} + ${prefundedGasNative} ${destChainConfig.nativeCurrency.symbol}`,
        destinationAddress: destinationRecipient,
      },
      feeBreakdown: {
        platformFeeUsd: totalFeeUsd,
        platformFeePercent: `$${flatFee.toFixed(2)} Flat + 0.30% Routing`,
        treasuryAddress: toChain === 'solana' ? PROTOCOL_CONFIG.defaultSolanaTreasury : PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.35,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1600));
        onTeleportSuccess(totalFeeUsd, amount);
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
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30">
                <Send className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>Ghost Teleport (Gas-Included Cross-Chain Liquidity)</span>
                  <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-400 border border-blue-500/20 font-bold">
                    GAS-SPONSORED
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Bridge assets across chains with $5 in native gas atomically pre-funded. Never arrive with 0 gas again.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 px-4 py-2 text-xs text-blue-300">
              <span className="block font-bold">Teleport Fee: $2.50 + 0.30%</span>
              <span className="text-[11px] text-slate-400">Includes Destination Gas Pre-Fund</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Principal To Bridge</span>
          <div className="text-2xl font-bold font-mono text-white">
            ${amount.toFixed(2)} {tokenSymbol}
          </div>
          <span className="text-[11px] text-slate-500">From {fromChain.toUpperCase()}</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Atomic Destination Gas Bonus</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            +{prefundedGasNative} {destChainConfig.nativeCurrency.symbol}
          </div>
          <span className="text-[11px] text-slate-500">≈ $5.00 native gas delivered ready-to-use</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Protocol Fee</span>
          <div className="text-2xl font-bold font-mono text-blue-400">
            ${totalFeeUsd.toFixed(2)} USD
          </div>
          <span className="text-[11px] text-slate-500">Streamed to Protocol Treasury</span>
        </div>
      </div>

      {/* Bridge Interactive Form */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Route */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Source Chain</label>
              <select
                value={fromChain}
                onChange={(e) => setFromChain(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SUPPORTED_CHAINS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Amount to Teleport</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="5"
                  className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Destination Route */}
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Destination Chain</label>
              <select
                value={toChain}
                onChange={(e) => setToChain(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {SUPPORTED_CHAINS.filter((c) => c.id !== fromChain).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Destination Recipient
              </label>
              <input
                type="text"
                readOnly
                value={destinationRecipient}
                className="w-full rounded-xl border border-white/5 bg-slate-950/80 px-3.5 py-2.5 text-xs font-mono text-slate-300 focus:outline-none cursor-default"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Auto-assigned to your connected {toChain.toUpperCase()} wallet
              </span>
            </div>
          </div>
        </div>

        {/* Pre-Fund Guarantee Banner */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Fuel className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Pre-Funded Gas Invariant</span>
              <span className="text-slate-400 text-[11px]">
                You will arrive on {destChainConfig.name} with {prefundedGasNative} {destChainConfig.nativeCurrency.symbol} immediately in your wallet.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <Clock className="h-3.5 w-3.5 text-blue-400" /> ~12s Settlement
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleTeleport}
            disabled={amount <= 0 || fromChain === toChain}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40 transition shadow-lg shadow-blue-600/25"
          >
            <Zap className="h-4 w-4" />
            <span>Teleport With Gas Included (${totalFeeUsd.toFixed(2)} Fee)</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default GhostTeleport;
