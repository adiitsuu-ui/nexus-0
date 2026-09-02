import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChainSelector } from './components/ChainSelector';
import { Overview } from './components/Overview';
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
import { BrandMark } from './components/BrandMark';

import type { TokenBalance, TreasuryStats } from './types';
import { INITIAL_WALLET_BALANCES, INITIAL_TREASURY_STATS } from './lib/mockData';
import { PROTOCOL_CONFIG } from './lib/constants';
import { getCategoryLabel, getTool, type TabType } from './lib/navigation';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const [evmConnected, setEvmConnected] = useState<boolean>(true);
  const [solanaConnected, setSolanaConnected] = useState<boolean>(true);
  const [evmAddress, setEvmAddress] = useState<string>('0x71C67073755129441Cd5426154562473D1b5e589');
  const [solanaAddress, setSolanaAddress] = useState<string>('NexusZeroTreasurySafeSol77x9PQk4VmW3b1J2n9LzP6e');

  const [balances, setBalances] = useState<TokenBalance[]>(INITIAL_WALLET_BALANCES);
  const [treasuryStats, setTreasuryStats] = useState<TreasuryStats>(INITIAL_TREASURY_STATS);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

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

  const handleTriggerModal = (details: Omit<typeof modalConfig, 'isOpen'>) => {
    setModalConfig({
      ...details,
      isOpen: true,
    });
  };

  const addFeeRevenue = (
    moduleName: keyof TreasuryStats['feesByModule'],
    feeUsd: number,
    volumeUsd: number = feeUsd * 20
  ) => {
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

  const handleSweepSuccess = (sweptTokens: TokenBalance[], feeUsd: number) => {
    const sweptAddresses = new Set(sweptTokens.map((t) => t.address));
    setBalances((prev) => prev.filter((t) => !sweptAddresses.has(t.address)));
    addFeeRevenue('dustSweeper', feeUsd, feeUsd / 0.025);
  };

  const handleSelectTool = (toolId: TabType) => {
    setActiveTab(toolId);
    setSearchQuery('');
    setSidebarOpen(false);
  };

  const activeTool = getTool(activeTab);

  return (
    <div className="min-h-screen app-canvas text-[#eef2f6] flex selection:bg-[#c9a86c]/30 selection:text-white">
      {sidebarOpen && (
        <button
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/60 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-50 w-[272px] transform transition-transform duration-200 lg:static lg:top-auto lg:bottom-auto lg:z-auto lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full lg:h-screen lg:sticky lg:top-0 flex-col bg-[#0e151d]">
          {sidebarOpen && (
            <div className="lg:hidden px-4 pt-4 pb-1">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6d7a8a]" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search operations…"
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-[#eef2f6] placeholder:text-[#6d7a8a] outline-none focus:border-[#c9a86c]/40"
                />
              </div>
            </div>
          )}
          <div className="min-h-0 flex-1">
            <Sidebar
              activeTab={activeTab}
              onSelect={handleSelectTool}
              searchQuery={searchQuery}
              onCloseMobile={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col min-h-screen">
        <Header
          evmConnected={evmConnected}
          solanaConnected={solanaConnected}
          evmAddress={evmAddress}
          solanaAddress={solanaAddress}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectTool={handleSelectTool}
          onOpenWalletModal={() => setIsWalletModalOpen(true)}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          sidebarOpen={sidebarOpen}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            {activeTab !== 'overview' && activeTool && (
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-[12px] text-[#8b98a8]">
                  <span className="text-[#c9a86c]">{getCategoryLabel(activeTool.category)}</span>
                  <span className="mx-2 text-white/20">/</span>
                  <span className="text-[#eef2f6]">{activeTool.label}</span>
                </div>
                <ChainSelector selectedChain={selectedChain} onSelectChain={setSelectedChain} />
              </div>
            )}

            {activeTab === 'overview' && (
              <Overview stats={treasuryStats} onSelectTool={handleSelectTool} />
            )}

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
          </div>
        </main>

        <footer className="border-t border-white/[0.06] px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <BrandMark className="h-5 w-5" />
              <span className="text-[12px] text-[#8b98a8]">
                NEXUS-0 v{PROTOCOL_CONFIG.version} · Zero-custody capital protection
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6d7a8a]">
              <span>Keys never leave your wallet</span>
              <span className="hidden sm:inline">·</span>
              <span>Atomic settlement</span>
              <span className="hidden sm:inline">·</span>
              <span>Direct-to-treasury fees</span>
            </div>
          </div>
        </footer>
      </div>

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
