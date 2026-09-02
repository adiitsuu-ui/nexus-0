import React, { useState } from 'react';
import { Handshake, Copy, Check, Clock, ArrowRight, PlusCircle } from 'lucide-react';
import type { OTCDeal } from '../types';
import { INITIAL_OTC_DEALS } from '../lib/mockData';
import { PROTOCOL_CONFIG } from '../lib/constants';

interface OTCEscrowProps {
  onDealSettled: (feeUsd: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const OTCEscrow: React.FC<OTCEscrowProps> = ({
  onDealSettled,
  onTriggerModal,
  evmAddress,
}) => {
  const [deals, setDeals] = useState<OTCDeal[]>(INITIAL_OTC_DEALS);
  const [offerSymbol, setOfferSymbol] = useState<string>('PEPE');
  const [offerAmount, setOfferAmount] = useState<number>(1000000);
  const [requestSymbol, setRequestSymbol] = useState<string>('USDC');
  const [requestAmount, setRequestAmount] = useState<number>(950);
  const [takerAddress, setTakerAddress] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const feeUsd = (requestAmount * PROTOCOL_CONFIG.feeRates.otcEscrowBps) / 10000;

  const handleCreateDeal = () => {
    onTriggerModal({
      title: 'Create Trustless OTC Deal',
      actionName: 'Sign Atomic Escrow Order',
      sourceDetails: {
        label: 'You Are Offering',
        items: [`${offerAmount.toLocaleString()} ${offerSymbol} (~$${requestAmount.toFixed(2)})`],
        totalUsd: requestAmount,
      },
      destinationDetails: {
        label: 'You Will Receive',
        asset: requestSymbol,
        estimatedAmount: requestAmount.toLocaleString(),
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd: feeUsd,
        platformFeePercent: '0.25%',
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.006,
      },
      onExecuteConfirm: async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const newDeal: OTCDeal = {
          id: `deal-${Math.floor(1000 + Math.random() * 9000)}`,
          maker: `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}`,
          taker: takerAddress ? `${takerAddress.slice(0, 6)}...${takerAddress.slice(-4)}` : undefined,
          chain: 'base',
          offerSymbol,
          offerAmount,
          offerUsd: requestAmount,
          requestSymbol,
          requestAmount,
          requestUsd: requestAmount,
          createdAt: 'Just now',
          expiresIn: '24h 00m',
          status: 'active',
          isPrivate: Boolean(takerAddress),
        };
        setDeals([newDeal, ...deals]);
        onDealSettled(feeUsd);
      },
    });
  };

  const copyLink = (id: string) => {
    setCopiedId(id);
    navigator.clipboard.writeText(`https://nexus-0.terminal/deal/${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Handshake className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-bold text-white">Trustless P2P / OTC Escrow</h2>
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Execute large or illiquid whale trades directly with a counterparty without crashing DEX prices,
              paying high slippage, or falling victim to MEV sandwich attacks.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4 text-xs space-y-1">
            <span className="text-slate-400">Zero-Slippage Guaranteed</span>
            <div className="text-sm font-bold text-emerald-400">100% Peer-to-Peer Atomic</div>
            <p className="text-[11px] text-slate-500">Platform fee: Only 0.25% upon settlement</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Deal Form */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Create Custom Deal</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">You Deposit (Offer)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(Number(e.target.value))}
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-white"
                  placeholder="Amount"
                />
                <input
                  type="text"
                  value={offerSymbol}
                  onChange={(e) => setOfferSymbol(e.target.value.toUpperCase())}
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-white"
                  placeholder="Symbol"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">You Receive (Request)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(Number(e.target.value))}
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-400"
                  placeholder="Amount"
                />
                <input
                  type="text"
                  value={requestSymbol}
                  onChange={(e) => setRequestSymbol(e.target.value.toUpperCase())}
                  className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-white"
                  placeholder="Symbol"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Specific Counterparty Address <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={takerAddress}
                onChange={(e) => setTakerAddress(e.target.value)}
                placeholder="0x... or leave empty for public link"
                className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-300"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-950/60 p-3 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Platform Fee (0.25%):</span>
              <span className="font-mono text-emerald-400">${feeUsd.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Safety Refund:</span>
              <span className="text-slate-300">Anytime before fill</span>
            </div>
          </div>

          <button
            onClick={handleCreateDeal}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition"
          >
            <span>Create Deal Link</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Live Deals List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Deals ({deals.length})</h3>
            <span className="text-xs text-slate-400 font-mono">Protected by NEXUS-0 OTC Escrow</span>
          </div>

          <div className="space-y-3">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="rounded-xl border border-white/5 bg-slate-950/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono">{deal.id}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono uppercase text-blue-400">
                      {deal.chain}
                    </span>
                    {deal.isPrivate && (
                      <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/30">
                        Private Deal
                      </span>
                    )}
                    <span className="text-xs text-slate-500">Maker: {deal.maker}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-mono pt-1">
                    <span className="font-semibold text-white">
                      {deal.offerAmount.toLocaleString()} {deal.offerSymbol}
                    </span>
                    <span className="text-slate-500">⇄</span>
                    <span className="font-semibold text-emerald-400">
                      {deal.requestAmount.toLocaleString()} {deal.requestSymbol}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" /> {deal.expiresIn}
                    </div>
                    <span className={`capitalize ${deal.status === 'active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {deal.status}
                    </span>
                  </div>

                  <button
                    onClick={() => copyLink(deal.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 transition"
                  >
                    {copiedId === deal.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedId === deal.id ? 'Copied' : 'Share'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
