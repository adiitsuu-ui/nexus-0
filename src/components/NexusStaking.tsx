import React, { useState } from 'react';
import { Layers, Coins, Sparkles, TrendingUp, ShieldCheck, Check, Gift } from 'lucide-react';
import type { UserStakingPosition } from '../types';
import { INITIAL_USER_STAKING } from '../lib/mockData';
import { STAKING_TIERS, PROTOCOL_CONFIG } from '../lib/constants';

interface NexusStakingProps {
  onStakeSuccess: (amount: number) => void;
  onClaimSuccess: (claimedEth: number, claimedSol: number) => void;
  onTriggerModal: (details: any) => void;
  evmAddress: string;
}

export const NexusStaking: React.FC<NexusStakingProps> = ({
  onStakeSuccess,
  onClaimSuccess,
  onTriggerModal,
  evmAddress,
}) => {
  const [position, setPosition] = useState<UserStakingPosition>(INITIAL_USER_STAKING);
  const [stakeAmountInput, setStakeAmountInput] = useState<number>(5000);
  const [selectedTierId, setSelectedTierId] = useState<string>('tier-90');
  const [claimedNotice, setClaimedNotice] = useState<boolean>(false);

  const selectedTier = STAKING_TIERS.find((t) => t.id === selectedTierId) || STAKING_TIERS[0];
  const protocolRevenuePoolUsd = 71210.40;
  const stakingShareUsd = (protocolRevenuePoolUsd * PROTOCOL_CONFIG.feeRates.stakingRevenueSharePercent) / 100;

  const handleStake = () => {
    if (stakeAmountInput <= 0) return;

    onTriggerModal({
      title: '🪙 Stake $NEX-0 in Real-Yield Vault',
      actionName: `Lock ${stakeAmountInput.toLocaleString()} $NEX-0 (${selectedTier.name})`,
      sourceDetails: {
        label: 'Staking Wallet',
        items: [
          `Deposit: ${stakeAmountInput.toLocaleString()} $NEX-0`,
          `Lock Tier: ${selectedTier.name} (${selectedTier.lockDurationDays} days)`,
          `Fee Discount: ${selectedTier.feeDiscountPercent}% across entire NEXUS-0 suite`,
        ],
        totalUsd: stakeAmountInput * 0.50,
      },
      destinationDetails: {
        label: 'Nexus Non-Custodial Staking Vault',
        asset: 'Real-Yield Staking Position',
        estimatedAmount: `APY: 24.8% APR (Native ETH & SOL Dividends)`,
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd: 0,
        platformFeePercent: '0% Staking Fee (Free Participation)',
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.22,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1200));
        setPosition((prev) => ({
          ...prev,
          stakedAmount: prev.stakedAmount + stakeAmountInput,
          stakedUsd: (prev.stakedAmount + stakeAmountInput) * 0.50,
          tier: selectedTier,
          lockEndTime: Date.now() + selectedTier.lockDurationDays * 24 * 60 * 60 * 1000,
        }));
        onStakeSuccess(stakeAmountInput);
      },
    });
  };

  const handleClaimRewards = () => {
    if (position.claimableEth <= 0 && position.claimableSol <= 0) return;

    onTriggerModal({
      title: '🎁 Claim Accrued Real-Yield Dividends',
      actionName: 'Claim Native ETH & SOL Rewards',
      sourceDetails: {
        label: 'Accrued Platform Dividends (10% Fee Share)',
        items: [
          `ETH Dividends: ${position.claimableEth} ETH ($${(position.claimableEth * 2640).toFixed(2)})`,
          `SOL Dividends: ${position.claimableSol} SOL ($${(position.claimableSol * 145).toFixed(2)})`,
        ],
        totalUsd: position.accruedYieldUsd,
      },
      destinationDetails: {
        label: 'Claim Destination Wallet',
        asset: 'Native ETH & SOL',
        estimatedAmount: `$${position.accruedYieldUsd.toFixed(2)} USD Net`,
        destinationAddress: evmAddress,
      },
      feeBreakdown: {
        platformFeeUsd: 0,
        platformFeePercent: '0% Claim Fee (100% Net to Staker)',
        treasuryAddress: PROTOCOL_CONFIG.defaultEvmTreasury,
        networkGasUsd: 0.15,
      },
      onExecuteConfirm: async () => {
        await new Promise((r) => setTimeout(r, 1100));
        const cEth = position.claimableEth;
        const cSol = position.claimableSol;
        setPosition((prev) => ({
          ...prev,
          claimableEth: 0,
          claimableSol: 0,
          accruedYieldUsd: 0,
        }));
        setClaimedNotice(true);
        onClaimSuccess(cEth, cSol);
        setTimeout(() => setClaimedNotice(false), 3000);
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
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                <TrendingUp className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>$NEX-0 Real-Yield Staking & Tokenomics</span>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400 border border-amber-500/20 font-bold">
                    24.8% APR
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Earn a 10% direct dividend share of all protocol fees across all 13 modules paid in real ETH & SOL.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-2 text-xs text-amber-300">
              <span className="block font-bold">Your VIP Fee Discount: {position.tier.feeDiscountPercent}%</span>
              <span className="text-[11px] text-slate-400">Tier: {position.tier.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Your Staked $NEX-0</span>
          <div className="text-2xl font-bold font-mono text-white">
            {position.stakedAmount.toLocaleString()} $NEX-0
          </div>
          <span className="text-[11px] text-slate-500">≈ ${position.stakedUsd.toLocaleString()} USD</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Claimable Platform Dividends</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ${position.accruedYieldUsd.toFixed(2)} USD
          </div>
          <span className="text-[11px] text-slate-500">
            {position.claimableEth} ETH + {position.claimableSol} SOL
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Total Platform Pool Shared</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            ${stakingShareUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
          </div>
          <span className="text-[11px] text-slate-500">10% of $71,210 protocol revenue</span>
        </div>
      </div>

      {/* Staking Tiers & Position Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stake Form */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Stake Tokens & Lock Tier</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">
                Amount to Stake ($NEX-0)
              </label>
              <input
                type="number"
                value={stakeAmountInput}
                onChange={(e) => setStakeAmountInput(Number(e.target.value))}
                min="100"
                step="500"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium block mb-2">
                Select Lock Tier (Higher Lock = Higher Fee Discount)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {STAKING_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      selectedTierId === tier.id
                        ? 'border-amber-500/60 bg-amber-950/20'
                        : 'border-white/5 bg-slate-950/40 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-white">
                      <span>{tier.name}</span>
                      <span className="text-amber-400">{tier.multiplier}x</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                      {tier.feeDiscountPercent}% Fee Discount
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStake}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-amber-600 py-3.5 text-xs font-bold text-white hover:bg-amber-500 transition shadow-lg shadow-amber-600/25"
            >
              <Coins className="h-4 w-4" />
              <span>Lock & Stake in Real-Yield Pool</span>
            </button>
          </div>
        </div>

        {/* Claim Rewards & Benefits */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Gift className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Claimable Dividends & Status</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Active Lock Duration:</span>
                <span className="text-white font-bold">{position.tier.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Protocol Fee Discount Active:</span>
                <span className="text-emerald-400 font-bold">{position.tier.feeDiscountPercent}% OFF All Tools</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-white/5 pt-2">
                <span>Available Native Dividends:</span>
                <span className="text-white font-bold">${position.accruedYieldUsd.toFixed(2)} USD</span>
              </div>
            </div>

            <button
              onClick={handleClaimRewards}
              disabled={position.accruedYieldUsd <= 0}
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-40 transition shadow-lg shadow-emerald-600/25"
            >
              {claimedNotice ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              <span>{claimedNotice ? 'Dividends Claimed!' : 'Claim Real-Yield Dividends'}</span>
            </button>

            <div className="rounded-xl border border-white/5 bg-slate-950/40 p-3 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Zero Dilution:</strong> Dividends are derived strictly from live protocol fees captured by NEXUS-0. No new tokens are minted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NexusStaking;
