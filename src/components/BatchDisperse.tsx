import React, { useState } from 'react';
import { Send, Users } from 'lucide-react';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface BatchDisperseProps {
  onDisperseSuccess: (feeUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress?: string;
}

export const BatchDisperse: React.FC<BatchDisperseProps> = ({
  onDisperseSuccess,
  onTriggerModal,
  evmAddress: _evmAddress,
}) => {
  const [tokenSymbol, setTokenSymbol] = useState<string>('ETH');
  const [inputText, setInputText] = useState<string>(
    `0x3a4872c019dE391b49Af757719B5dC091b6191F2, 0.05\n0x992B15D7b23C132B0Fa653e5066A96C20b8dc204, 0.08\n0x71cA929940B7E11a129E3856124B892019b88B01, 0.12\n0x183910F1c828292837262E198302B91823901920, 0.05`
  );

  const flatFeeUsd = PROTOCOL_CONFIG.feeRates.disperseFixedUsd; // $1.00

  // Parse lines
  const lines = inputText.trim().split('\n').filter(Boolean);
  const parsedRecipients = lines.map((l) => {
    const [addr, amount] = l.split(',').map((s) => s.trim());
    return {
      address: addr || '',
      amount: parseFloat(amount) || 0,
      isValid: addr?.startsWith('0x') && addr?.length === 42,
    };
  });

  const totalTokenAmount = parsedRecipients.reduce((acc, r) => acc + r.amount, 0);
  const validCount = parsedRecipients.filter((r) => r.isValid).length;

  const handleDisperse = () => {
    if (validCount === 0) return;

    onTriggerModal({
      title: 'Batch Disperse Multi-Send',
      actionName: `Broadcast to ${validCount} Wallets`,
      sourceDetails: {
        label: `Dispersing ${tokenSymbol}`,
        items: parsedRecipients.map((r) => `${r.address.slice(0, 6)}...${r.address.slice(-4)}: ${r.amount} ${tokenSymbol}`),
        totalUsd: totalTokenAmount * (tokenSymbol === 'ETH' ? 2640 : 1),
      },
      destinationDetails: {
        label: 'Recipients Count',
        asset: tokenSymbol,
        estimatedAmount: `${totalTokenAmount.toFixed(4)} total`,
        destinationAddress: `${validCount} distinct wallets`,
      },
      feeBreakdown: {
        platformFeeUsd: flatFeeUsd,
        platformFeePercent: 'Flat Rate',
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.015,
      },
      onExecuteConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1400));
        onDisperseSuccess(flatFeeUsd);
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
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
                <Users className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Batch Multi-Sender (Disperse)</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Distribute ETH, SOL, or any ERC20 to hundreds of addresses in a single atomic smart contract call.
              Save over 75% on gas fees compared to individual transfers.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-xs font-mono space-y-1 text-right">
            <span className="text-slate-400">Batch Efficiency</span>
            <div className="text-sm font-bold text-emerald-400">1 Click = Many Transfers</div>
            <span className="text-slate-500 font-sans">Flat fee: $1.00 only</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Text Area */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Recipients & Amounts (Address, Amount)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {validCount} valid / {lines.length} lines
            </span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-4 font-mono text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
            placeholder="0x123...abc, 0.5&#10;0x456...def, 1.2"
          />

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Format: <code className="text-slate-300">address, amount</code> on each line.</span>
          </div>
        </div>

        {/* Configuration & Action */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Disperse Summary</h3>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Select Asset</label>
              <select
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ETH">ETH (Native)</option>
                <option value="USDC">USDC (Stable)</option>
                <option value="BRETT">BRETT (Token)</option>
                <option value="DEGEN">DEGEN (Token)</option>
              </select>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Recipients:</span>
                <span className="font-mono text-white">{validCount} addresses</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {totalTokenAmount.toFixed(4)} {tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>NEXUS-0 Fixed Fee:</span>
                <span className="font-mono text-slate-200">${flatFeeUsd.toFixed(2)} USD</span>
              </div>
              <div className="border-t border-white/5 pt-2 flex justify-between text-slate-400">
                <span>Est. Gas Saved:</span>
                <span className="font-mono text-emerald-400 font-semibold">~74% Gas Saved</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDisperse}
            disabled={validCount === 0}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition ${
              validCount > 0
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/20 hover:from-pink-500 hover:to-rose-500'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Disperse to {validCount} Wallets</span>
          </button>
        </div>
      </div>
    </div>
  );
};
