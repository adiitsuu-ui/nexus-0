import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Wallet, Copy, Check, Search, Menu, X } from 'lucide-react';
import { BrandMark } from './BrandMark';
import { ALL_TOOLS, type TabType } from '../lib/navigation';

interface HeaderProps {
  evmConnected: boolean;
  solanaConnected: boolean;
  evmAddress: string;
  solanaAddress: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectTool: (id: TabType) => void;
  onOpenWalletModal?: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  evmConnected,
  solanaConnected,
  evmAddress,
  solanaAddress,
  searchQuery,
  onSearchChange,
  onSelectTool,
  onOpenWalletModal,
  onToggleSidebar,
  sidebarOpen,
}) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_TOOLS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [searchQuery]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1600);
  };

  const connectedCount = Number(evmConnected) + Number(solanaConnected);

  return (
    <header className="sticky top-0 z-50 h-16 shrink-0 border-b border-white/[0.06] bg-[#0b1219]/90 backdrop-blur-xl">
      <div className="flex h-full items-center gap-3 px-4 lg:px-6">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg p-2 text-[#b8c2ce] hover:bg-white/5 hover:text-white"
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-2.5 lg:hidden">
          <BrandMark className="h-7 w-7" />
          <span className="text-[13px] font-semibold tracking-[0.12em] text-white">NEXUS-0</span>
        </div>

        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7a8a]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Search operations…"
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-[#eef2f6] placeholder:text-[#6d7a8a] outline-none focus:border-[#c9a86c]/40 focus:bg-white/[0.05]"
          />
          {searchOpen && results.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] overflow-hidden rounded-xl border border-white/10 bg-[#141c26] shadow-2xl">
              {results.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      onSelectTool(tool.id);
                      onSearchChange('');
                      setSearchOpen(false);
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.04]"
                  >
                    <Icon className="h-4 w-4 text-[#c9a86c]" />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-white">{tool.label}</div>
                      <div className="truncate text-[11px] text-[#8b98a8]">{tool.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-full border border-[#3dba8b]/25 bg-[#3dba8b]/10 px-2.5 py-1 text-[11px] font-medium text-[#3dba8b]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3dba8b]" />
            All systems operational
          </div>

          {evmConnected && (
            <button
              onClick={(e) => handleCopy(evmAddress, e)}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-[#c5cdd6] hover:border-white/15"
              title="Copy EVM address"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#3dba8b]" />
              <span className="font-mono">
                {evmAddress.slice(0, 6)}…{evmAddress.slice(-4)}
              </span>
              {copied === evmAddress ? (
                <Check className="h-3 w-3 text-[#3dba8b]" />
              ) : (
                <Copy className="h-3 w-3 text-[#6d7a8a]" />
              )}
            </button>
          )}

          {solanaConnected && (
            <button
              onClick={(e) => handleCopy(solanaAddress, e)}
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12px] text-[#c5cdd6] hover:border-white/15"
              title="Copy Solana address"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#c9a86c]" />
              <span className="font-mono">
                {solanaAddress.slice(0, 4)}…{solanaAddress.slice(-4)}
              </span>
              {copied === solanaAddress ? (
                <Check className="h-3 w-3 text-[#3dba8b]" />
              ) : (
                <Copy className="h-3 w-3 text-[#6d7a8a]" />
              )}
            </button>
          )}

          <button
            onClick={onOpenWalletModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#c9a86c] px-3 py-1.5 text-[13px] font-semibold text-[#0b1219] hover:bg-[#d4b57a] transition"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>{connectedCount > 0 ? 'Wallets' : 'Connect'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
