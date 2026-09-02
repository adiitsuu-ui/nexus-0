import React, { useState } from 'react';
import { Zap, Wallet, Copy, Check } from 'lucide-react';

interface HeaderProps {
  evmConnected: boolean;
  solanaConnected: boolean;
  evmAddress: string;
  solanaAddress: string;
  onToggleEvm: () => void;
  onToggleSolana: () => void;
  totalRevenue: number;
  activeChain?: string;
  onSelectChain?: (chainId: string) => void;
  onOpenTreasury: () => void;
  onOpenWalletModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  evmConnected,
  solanaConnected,
  evmAddress,
  solanaAddress,
  onToggleEvm,
  onToggleSolana,
  totalRevenue,
  onOpenTreasury,
  onOpenWalletModal,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#06080d]/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Terminal Meta */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-cyan-400/20 to-blue-600/10 border border-cyan-400/30 shadow-[0_0_15px_rgba(0,242,254,0.15)]">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-extrabold tracking-wider text-white">
                NEXUS<span className="text-cyan-400 font-normal">/0</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-300 border border-white/10 tracking-wide">
                MAINNET V2
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-mono font-medium text-emerald-400 border border-emerald-500/30 tracking-wide">
                NON-CUSTODIAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block tracking-tight font-medium">
              Institutional Zero-Custody Universal Gateway
            </p>
          </div>
        </div>

        {/* Live Network & Gas Telemetry Ribbon */}
        <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
            <span className="text-slate-400">Base:</span>
            <span className="text-slate-200 font-semibold">0.008 gwei</span>
          </div>
          <span className="text-white/10">/</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-slate-400">Arb:</span>
            <span className="text-slate-200 font-semibold">0.012 gwei</span>
          </div>
          <span className="text-white/10">/</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
            <span className="text-slate-400">Solana:</span>
            <span className="text-slate-200 font-semibold">2,840 TPS</span>
          </div>
          <span className="text-white/10">/</span>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">Relayers:</span>
            <span className="text-emerald-400 font-semibold">100% Up</span>
          </div>
        </div>

        {/* Right Section: Fee Revenue & Wallet Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Real-Time Revenue Trigger */}
          <button
            onClick={onOpenTreasury}
            title="View Protocol Treasury & Real-Yield Distribution"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/30 hover:bg-emerald-900/30 px-2.5 py-1.5 text-xs font-mono transition group"
          >
            <Zap className="h-3 w-3 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-slate-400 text-[11px]">Fees:</span>
            <span className="font-bold text-emerald-400 tabular-nums">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </button>

          {/* EVM Wallet Badge */}
          <div
            onClick={onToggleEvm}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleEvm(); }}
            className={`cursor-pointer flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono transition border ${
              evmConnected
                ? 'bg-slate-900/80 text-slate-200 border-white/10 hover:border-cyan-500/40'
                : 'bg-slate-900/40 text-slate-500 border-white/5 hover:text-slate-300'
            }`}
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
            <span className="text-[11px] font-medium">
              {evmConnected ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : 'EVM Offline'}
            </span>
            {evmConnected && (
              <button
                onClick={(e) => handleCopy(evmAddress, e)}
                title="Copy Address"
                className="text-slate-500 hover:text-slate-200 ml-0.5"
              >
                {copiedAddress === evmAddress ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {/* Solana Wallet Badge */}
          <div
            onClick={onToggleSolana}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggleSolana(); }}
            className={`cursor-pointer hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-mono transition border ${
              solanaConnected
                ? 'bg-slate-900/80 text-slate-200 border-white/10 hover:border-purple-500/40'
                : 'bg-slate-900/40 text-slate-500 border-white/5 hover:text-slate-300'
            }`}
          >
            <span className="flex h-2 w-2 rounded-full bg-purple-400"></span>
            <span className="text-[11px] font-medium">
              {solanaConnected ? `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}` : 'Sol Offline'}
            </span>
            {solanaConnected && (
              <button
                onClick={(e) => handleCopy(solanaAddress, e)}
                title="Copy Address"
                className="text-slate-500 hover:text-slate-200 ml-0.5"
              >
                {copiedAddress === solanaAddress ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            )}
          </div>

          {/* Connect Live Wallet CTA */}
          {onOpenWalletModal && (
            <button
              onClick={onOpenWalletModal}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition shadow-[0_0_15px_rgba(0,242,254,0.2)]"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Connect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
export default Header;
