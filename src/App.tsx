import React, { useState } from 'react';
import {
  Sparkles,
  Fuel,
  Target,
  Handshake,
  Users,
  ShieldAlert,
  Gift,
  DollarSign,
  Zap,
  Flame,
  Coins,
  AlertTriangle,
  HeartPulse,
  EyeOff,
  Layers,
  Send,
  Shield,
  TrendingUp,
  Search,
} from 'lucide-react';
import { Header } from './components/Header';
import { ChainSelector } from './components/ChainSelector';
import { DustSweeper } from './components/DustSweeper';
import { GasStation } from './components/GasStation';
import { ExitVault } from './components/ExitVault';
import { OTCEscrow } from './components/OTCEscrow';
import { BatchDisperse } from './components/BatchDisperse';
import { RevokeShield } from './components/RevokeShield';
import { AirdropRadar } from './components/AirdropRadar';
import { TaxCremator } from './components/TaxCremator';
import { RentReclaimer } from './components/RentReclaimer';
import { PanicEvacuation } from './components/PanicEvacuation';
import { DeadMansSwitch } from './components/DeadMansSwitch';
import { StealthRouter } from './components/StealthRouter';
import { PoisonRadar } from './components/PoisonRadar';
import { GhostTeleport } from './components/GhostTeleport';
import { NexusStaking } from './components/NexusStaking';
import { WalletModal } from './components/WalletModal';
import { TreasuryCockpit } from './components/TreasuryCockpit';
import { SecurityModal } from './components/SecurityModal';

import type { TokenBalance, TreasuryStats } from './types';
import { INITIAL_WALLET_BALANCES, INITIAL_TREASURY_STATS } from './lib/mockData';
import { PROTOCOL_CONFIG } from './lib/constants';

type TabType =
  | 'sweeper'
  | 'stealth'
  | 'teleport'
  | 'poison'
  | 'staking'
  | 'gas'
  | 'exit'
  | 'escrow'
  | 'disperse'
  | 'security'
  | 'airdrop'
  | 'cremator'
  | 'rent'
  | 'panic'
  | 'switch'
  | 'treasury';

type NavCategory = 'execution' | 'security' | 'utilities' | 'ecosystem';

interface ToolItem {
  id: TabType;
  label: string;
  category: NavCategory;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  description: string;
}

const ALL_TOOLS: ToolItem[] = [
  // Execution
  { id: 'sweeper', label: 'Dust Sweeper', category: 'execution', icon: Sparkles, badge: '2.5%', description: 'Sweep residual balances into ETH/SOL/USDC' },
  { id: 'stealth', label: 'Stealth Burner', category: 'execution', icon: EyeOff, badge: '0.25%', description: 'Unlinkable swaps breaking Arkham/DeBank tracking' },
  { id: 'teleport', label: 'Ghost Teleport', category: 'execution', icon: Send, badge: 'Gas-Inc', description: 'Cross-chain bridge with $5 gas pre-funded' },
  { id: 'exit', label: 'Exit Strategy', category: 'execution', icon: Target, badge: '0.35%', description: 'Non-custodial tiered profit take targets' },
  { id: 'escrow', label: 'OTC Escrow', category: 'execution', icon: Handshake, badge: '0.25%', description: 'Trustless P2P swaps with 0% DEX slippage' },
  { id: 'disperse', label: 'Batch Disperse', category: 'execution', icon: Users, badge: '$1.00', description: 'Atomic multi-address token & gas sender' },

  // Security
  { id: 'poison', label: 'Poison Radar', category: 'security', icon: ShieldAlert, badge: '$1.00', description: 'Detect lookalike address poisoning spoof traps' },
  { id: 'panic', label: 'Panic Evac', category: 'security', icon: AlertTriangle, badge: '0.75%', description: 'Flashbots private mempool cold vault sweep' },
  { id: 'security', label: 'Revoke Shield', category: 'security', icon: Shield, badge: 'Audit', description: 'Audit and disarm unlimited ERC-20 allowances' },
  { id: 'cremator', label: 'Tax Cremator', category: 'security', icon: Flame, badge: '$2.50', description: 'Burn dead honeypots for legal tax write-offs' },
  { id: 'rent', label: 'Rent Reclaimer', category: 'security', icon: Coins, badge: '15%', description: 'Recover trapped SOL from dormant token accounts' },
  { id: 'switch', label: 'Dead Man Switch', category: 'security', icon: HeartPulse, badge: '$9.99', description: 'Timelocked non-custodial estate testament' },

  // Utilities
  { id: 'gas', label: 'Gas Station', category: 'utilities', icon: Fuel, badge: '$1.50', description: 'Instant cross-chain gas refuel in ~8s' },
  { id: 'airdrop', label: 'Airdrop Radar', category: 'utilities', icon: Gift, badge: '3.0%', description: 'Discover and recover unclaimed token allocations' },

  // Ecosystem
  { id: 'staking', label: '$NEX-0 Staking', category: 'ecosystem', icon: Layers, badge: '24.8%', description: 'Stake to earn 10% of fees; up to 50% discount' },
  { id: 'treasury', label: 'Revenue Cockpit', category: 'ecosystem', icon: DollarSign, badge: 'Owner', description: 'Inspect protocol fees and cold treasury safe' },
];

const CATEGORIES: { id: NavCategory; label: string; icon: React.ComponentType<{ className?: string }>; count: number }[] = [
  { id: 'execution', label: 'Execution & Liquidity', icon: Zap, count: 6 },
  { id: 'security', label: 'Security & Shields', icon: Shield, count: 6 },
  { id: 'utilities', label: 'Gas & Utilities', icon: Fuel, count: 2 },
  { id: 'ecosystem', label: 'Real Yield & Staking', icon: TrendingUp, count: 2 },
];

export const App: React.FC = () => {
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<TabType>('sweeper');
  const [activeCategory, setActiveCategory] = useState<NavCategory>('execution');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Wallet Connection States
  const [evmConnected, setEvmConnected] = useState<boolean>(true);
  const [solanaConnected, setSolanaConnected] = useState<boolean>(true);
  const [evmAddress, setEvmAddress] = useState<string>('0x71C67073755129441Cd5426154562473D1b5e589');
  const [solanaAddress, setSolanaAddress] = useState<string>('NexusZeroTreasurySafeSol77x9PQk4VmW3b1J2n9LzP6e');

  // Live Balances & Protocol Stats
  const [balances, setBalances] = useState<TokenBalance[]>(INITIAL_WALLET_BALANCES);
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats>(INITIAL_TREASURY_STATS);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  // Security Simulation Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    actionName: string;
    sourceDetails: { label: string; items: string[]; totalUsd: number };
    destinationDetails: { label: string; asset: string; estimatedAmount: string; destinationAddress: string };
    feeBreakdown: { platformFeeUsd: number; platformFeePercent: string; treasuryAddress: string; networkGasUsd: number };
    onExecuteConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    actionName: '',
    sourceDetails: { label: '', items: [], totalUsd: 0 },
    destinationDetails: { label: '', asset: '', estimatedAmount: '', destinationAddress: '' },
    feeBreakdown: { platformFeeUsd: 0, platformFeePercent: '', treasuryAddress: '', networkGasUsd: 0 },
    onExecuteConfirm: async () => {},
  });

  // Modal Trigger Helper
  const handleTriggerModal = (details: any) => {
    setModalConfig({
      ...details,
      isOpen: true,
    });
  };

  // Fee Streaming Helper
  const addFeeRevenue = (moduleName: keyof TreasuryStats['feesByModule'], feeUsd: number, volumeUsd: number = feeUsd * 20) => {
    setTreasuryStats((prev) => ({
      ...prev,
      totalRevenueUsd: prev.totalRevenueUsd + feeUsd,
      totalVolumeProcessedUsd: prev.totalVolumeProcessedUsd + volumeUsd,
      totalTransactions: prev.totalTransactions + 1,
      feesByModule: {
        ...prev.feesByModule,
        [moduleName]: prev.feesByModule[moduleName] + feeUsd,
      },
    }));
  };

  // Sweeper Success
  const handleSweepSuccess = (sweptTokens: TokenBalance[], feeUsd: number) => {
    const sweptAddresses = new Set(sweptTokens.map((t) => t.address));
    setBalances((prev) => prev.filter((t) => !sweptAddresses.has(t.address)));
    addFeeRevenue('dustSweeper', feeUsd, feeUsd / 0.025);
  };

  const handleSelectCategory = (cat: NavCategory) => {
    setActiveCategory(cat);
    // If current tab is not in selected category, switch to the first tool in category
    const toolsInCat = ALL_TOOLS.filter((t) => t.category === cat);
    if (toolsInCat.length > 0 && !toolsInCat.some((t) => t.id === activeTab)) {
      setActiveTab(toolsInCat[0].id);
    }
  };

  const handleSelectTool = (toolId: TabType) => {
    setActiveTab(toolId);
    const tool = ALL_TOOLS.find((t) => t.id === toolId);
    if (tool && tool.category !== activeCategory) {
      setActiveCategory(tool.category);
    }
    setSearchQuery('');
  };

  // Filter tools: search query takes precedence, otherwise show active category
  const filteredTools = searchQuery.trim()
    ? ALL_TOOLS.filter(
        (t) =>
          t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.badge.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ALL_TOOLS.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen terminal-grid text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Institutional Top Header */}
      <Header
        evmConnected={evmConnected}
        solanaConnected={solanaConnected}
        evmAddress={evmAddress}
        solanaAddress={solanaAddress}
        onToggleEvm={() => setEvmConnected(!evmConnected)}
        onToggleSolana={() => setSolanaConnected(!solanaConnected)}
        totalRevenue={treasuryStats.totalRevenueUsd}
        activeChain={selectedChain}
        onSelectChain={setSelectedChain}
        onOpenTreasury={() => handleSelectTool('treasury')}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
      />

      {/* Terminal Telemetry Ribbon */}
      <div className="border-b border-white/[0.06] bg-slate-950/60 backdrop-blur-md px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between overflow-x-auto text-[11px] font-mono text-slate-400 gap-6 scrollbar-none">
          <div className="flex items-center gap-6 shrink-0">
            <div>
              <span className="text-slate-500 mr-1.5">TVL PROCESSED:</span>
              <span className="text-white font-bold tabular-nums">
                ${treasuryStats.totalVolumeProcessedUsd.toLocaleString()} USD
              </span>
            </div>
            <div>
              <span className="text-slate-500 mr-1.5">PROTOCOL FEES:</span>
              <span className="text-emerald-400 font-bold tabular-nums">
                ${treasuryStats.totalRevenueUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </span>
            </div>
            <div>
              <span className="text-slate-500 mr-1.5">STAKER REWARD APY:</span>
              <span className="text-amber-400 font-bold tabular-nums">24.8% APR (ETH/SOL)</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1.5">CUSTODY INVARIANT:</span>
              <span className="text-cyan-400 font-bold">address(this).balance == 0</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-slate-400 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>13 Production Modules Operational</span>
          </div>
        </div>
      </div>

      {/* Sub-Header & Global Network Filter */}
      <div className="border-b border-white/[0.06] bg-slate-950/40 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col md:flex-row md:items-center md:justify-between gap-4">
          <ChainSelector selectedChain={selectedChain} onSelectChain={setSelectedChain} />

          {/* Search / Command Filter Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. stealth, gas, tax)..."
              className="w-full rounded-xl border border-white/[0.08] bg-slate-900/60 pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300 font-mono"
              >
                ESC
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Category Switcher */}
      <div className="border-b border-white/[0.06] bg-slate-950/70 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3 overflow-x-auto py-2.5 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id && !searchQuery;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                    isSelected
                      ? 'bg-slate-800 text-white border border-white/10 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isSelected ? 'bg-slate-700/80 text-cyan-300' : 'bg-slate-900 text-slate-500'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sub-Tool Selector Pills */}
      <div className="border-b border-white/[0.06] bg-slate-900/30 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleSelectTool(tool.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition border ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-white border-cyan-500/50 shadow-[0_0_15px_rgba(0,242,254,0.15)] ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/40 text-slate-400 border-white/[0.05] hover:bg-slate-800/60 hover:text-slate-200 hover:border-white/10'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="font-semibold">{tool.label}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-mono uppercase ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-500 border border-white/5'
                  }`}
                >
                  {tool.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'sweeper' && (
          <DustSweeper
            balances={balances}
            selectedChain={selectedChain}
            onSweepSuccess={handleSweepSuccess}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'gas' && (
          <GasStation
            onRefuelSuccess={(fee) => addFeeRevenue('gasStation', fee, 15)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
            solanaAddress={solanaAddress}
          />
        )}

        {activeTab === 'exit' && (
          <ExitVault
            onActivateStrategy={(fee) => addFeeRevenue('exitVault', fee, fee * 100)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'escrow' && (
          <OTCEscrow
            onDealSettled={(fee) => addFeeRevenue('otcEscrow', fee, fee * 400)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'disperse' && (
          <BatchDisperse
            onDisperseSuccess={(fee) => addFeeRevenue('disperse', fee, 500)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'security' && (
          <RevokeShield onTriggerModal={handleTriggerModal} evmAddress={evmAddress} />
        )}

        {activeTab === 'airdrop' && (
          <AirdropRadar
            onClaimSuccess={(fee) => addFeeRevenue('airdropRadar', fee, fee * 33.3)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'cremator' && (
          <TaxCremator
            onCremateSuccess={(fee, loss) => addFeeRevenue('taxCremator', fee, loss)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'rent' && (
          <RentReclaimer
            onReclaimSuccess={(fee, totalSol) => addFeeRevenue('rentReclaimer', fee, totalSol * 145)}
            onTriggerModal={handleTriggerModal}
            solanaAddress={solanaAddress}
          />
        )}

        {activeTab === 'panic' && (
          <PanicEvacuation
            balances={balances}
            onEvacuateSuccess={(fee, totalUsd) => {
              addFeeRevenue('panicEvacuation', fee, totalUsd);
              setBalances([]);
            }}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'stealth' && (
          <StealthRouter
            onStealthSuccess={(fee, vol) => addFeeRevenue('stealthRouter', fee, vol)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'teleport' && (
          <GhostTeleport
            onTeleportSuccess={(fee, vol) => addFeeRevenue('ghostTeleport', fee, vol)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
            solanaAddress={solanaAddress}
          />
        )}

        {activeTab === 'poison' && (
          <PoisonRadar
            onVerifySuccess={(fee) => addFeeRevenue('poisonRadar', fee, 100)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'staking' && (
          <NexusStaking
            onStakeSuccess={() => {}}
            onClaimSuccess={(eth, sol) => addFeeRevenue('stakingPoolYield', eth * 2640 + sol * 145, 0)}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'switch' && (
          <DeadMansSwitch
            onArmSuccess={(fee) => addFeeRevenue('deadMansSwitch', fee, 48500)}
            onPingSuccess={() => {}}
            onTriggerModal={handleTriggerModal}
            evmAddress={evmAddress}
          />
        )}

        {activeTab === 'treasury' && (
          <TreasuryCockpit
            stats={treasuryStats}
            onUpdateTreasuries={(evm, sol) => {
              setTreasuryStats((prev) => ({ ...prev, evmTreasury: evm, solanaTreasury: sol }));
              setEvmAddress(evm);
              setSolanaAddress(sol);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950/80 px-4 py-6 sm:px-6 mt-12 text-xs text-slate-500 font-mono">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">NEXUS-0 v{PROTOCOL_CONFIG.version}</span>
            <span>—</span>
            <span>Zero-Custody Universal DeFi Gateway</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Base</span>
            <span>•</span>
            <span>Arbitrum</span>
            <span>•</span>
            <span>Solana</span>
            <span>•</span>
            <span>Ethereum</span>
            <span>•</span>
            <span>zkSync</span>
            <span>•</span>
            <span>Polygon</span>
            <span>•</span>
            <span>BNB</span>
          </div>
        </div>
      </footer>

      {/* Atomic Transaction Simulation Modal */}
      <SecurityModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        actionName={modalConfig.actionName}
        sourceDetails={modalConfig.sourceDetails}
        destinationDetails={modalConfig.destinationDetails}
        feeBreakdown={modalConfig.feeBreakdown}
        onExecuteConfirm={modalConfig.onExecuteConfirm}
      />

      {/* Multi-Chain Live Wallet Connect Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnectEvmSuccess={(addr) => {
          setEvmAddress(addr);
          setEvmConnected(true);
        }}
        onConnectSolanaSuccess={(addr) => {
          setSolanaAddress(addr);
          setSolanaConnected(true);
        }}
      />
    </div>
  );
};
export default App;
