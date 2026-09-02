import React from 'react';
import { Zap, Wallet, CheckCircle2 } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-tight text-white">
                NEXUS<span className="text-cyan-400">-0</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 ring-1 ring-cyan-500/30">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400"></span>
                ZERO-CUSTODY
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Zero-Custody Universal DeFi Gateway
            </p>
          </div>
        </div>

        {/* Live Gas Ticker (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5">
            <span className="text-blue-400">🔵 Base:</span>
            <span className="text-slate-200">0.008 gwei</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-cyan-400">🔷 Arb:</span>
            <span className="text-slate-200">0.015 gwei</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-purple-400">🟣 Sol:</span>
            <span className="text-slate-200">&lt;0.0001$</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-indigo-400">⬛ ETH:</span>
            <span className="text-slate-200">11.4 gwei</span>
          </div>
        </div>

        {/* Right Section: Fee Ticker + Dual Wallet Connectors */}
        <div className="flex items-center gap-3">
          {/* Cumulative Revenue Pill */}
          <button
            onClick={onOpenTreasury}
            title="View Protocol Fee Treasury Cockpit"
            className="hidden sm:flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/30 px-2.5 py-1.5 text-xs font-mono text-emerald-400 transition hover:bg-emerald-900/40"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Fees Collected:</span>
            <span className="font-bold text-emerald-300">
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </button>

          {/* EVM Wallet */}
          <button
            onClick={onToggleEvm}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ring-1 ${
              evmConnected
                ? 'bg-blue-950/60 text-blue-200 ring-blue-500/40 hover:bg-blue-900/60'
                : 'bg-slate-800/80 text-slate-300 ring-white/10 hover:bg-slate-700'
            }`}
          >
            <Wallet className="h-3.5 w-3.5 text-blue-400" />
            <span>{evmConnected ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : 'Connect EVM'}</span>
            {evmConnected && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
          </button>

          {/* Solana Wallet */}
          <button
            onClick={onToggleSolana}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ring-1 ${
              solanaConnected
                ? 'bg-purple-950/60 text-purple-200 ring-purple-500/40 hover:bg-purple-900/60'
                : 'bg-slate-800/80 text-slate-300 ring-white/10 hover:bg-slate-700'
            }`}
          >
            <span className="text-purple-400">🟣</span>
            <span>{solanaConnected ? `${solanaAddress.slice(0, 4)}...${solanaAddress.slice(-4)}` : 'Phantom'}</span>
            {solanaConnected && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
          </button>

          {onOpenWalletModal && (
            <button
              onClick={onOpenWalletModal}
              title="Connect Web3 Provider (MetaMask, Rabby, Phantom)"
              className="flex items-center gap-1 rounded-lg bg-cyan-600/20 text-cyan-300 ring-1 ring-cyan-500/40 hover:bg-cyan-600/30 px-2.5 py-1.5 text-xs font-semibold transition"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Connect</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
