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

export const App: React.FC = () => {
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<TabType>('sweeper');
  const [selectedChain, setSelectedChain] = useState<string>('all');

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

  const navTabs = [
    { id: 'sweeper', label: 'Dust Sweeper', icon: Sparkles, badge: '2.5%' },
    { id: 'stealth', label: 'Stealth Burner', icon: EyeOff, badge: '0.25%' },
    { id: 'teleport', label: 'Ghost Teleport', icon: Send, badge: 'Gas-Inc' },
    { id: 'poison', label: 'Poison Radar', icon: ShieldAlert, badge: '$1.00' },
    { id: 'staking', label: '$NEX-0 Staking', icon: Layers, badge: '24.8%' },
    { id: 'cremator', label: 'Tax Cremator', icon: Flame, badge: '$2.50' },
    { id: 'rent', label: 'Rent Reclaimer', icon: Coins, badge: '15%' },
    { id: 'panic', label: 'Panic Evac', icon: AlertTriangle, badge: '0.75%' },
    { id: 'switch', label: 'Dead Man Switch', icon: HeartPulse, badge: '$9.99' },
    { id: 'gas', label: 'Gas Station', icon: Fuel, badge: '$1.50' },
    { id: 'exit', label: 'Exit Vault', icon: Target, badge: 'Smart' },
    { id: 'escrow', label: 'OTC Escrow', icon: Handshake, badge: 'P2P' },
    { id: 'disperse', label: 'Batch Send', icon: Users, badge: '$1.00' },
    { id: 'security', label: 'Revoke Shield', icon: ShieldAlert, badge: 'Audit' },
    { id: 'airdrop', label: 'Airdrop Radar', icon: Gift, badge: 'Find' },
    { id: 'treasury', label: 'Revenue Cockpit', icon: DollarSign, badge: 'Owner' },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Header with Dual Wallets & Live Gas */}
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
        onOpenTreasury={() => setActiveTab('treasury')}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
      />

      {/* Main Sub-Header & Controls */}
      <div className="border-b border-white/5 bg-slate-950/40 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <ChainSelector selectedChain={selectedChain} onSelectChain={setSelectedChain} />

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Security Engine: Active</span>
            <span className="text-slate-600">|</span>
            <span className="text-blue-400">Audited Routers Only</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="border-b border-white/5 bg-slate-900/40 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/50'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span
                  className={`rounded px-1.5 py-0.2 text-[9px] font-mono uppercase ${
                    isActive ? 'bg-blue-900/60 text-blue-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
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
