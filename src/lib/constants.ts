import type { ChainConfig } from '../types';

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 'base',
    name: 'Base',
    type: 'evm',
    chainId: 8453,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    icon: '🔵',
    color: '#0052ff',
    gasPriceGwei: 0.008,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum One',
    type: 'evm',
    chainId: 42161,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    icon: '🔷',
    color: '#28a0f0',
    gasPriceGwei: 0.015,
  },
  {
    id: 'solana',
    name: 'Solana',
    type: 'solana',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    blockExplorer: 'https://solscan.io',
    icon: '🟣',
    color: '#9945ff',
    gasPriceGwei: 0.000005,
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    type: 'evm',
    chainId: 1,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    icon: '⬛',
    color: '#627eea',
    gasPriceGwei: 11.4,
  },
  {
    id: 'zksync',
    name: 'zkSync Era',
    type: 'evm',
    chainId: 324,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrl: 'https://mainnet.era.zksync.io',
    blockExplorer: 'https://explorer.zksync.io',
    icon: '⚪',
    color: '#8c8dfc',
    gasPriceGwei: 0.02,
  },
  {
    id: 'polygon',
    name: 'Polygon PoS',
    type: 'evm',
    chainId: 137,
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    icon: '🟣',
    color: '#8247e5',
    gasPriceGwei: 32.5,
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    type: 'evm',
    chainId: 56,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrl: 'https://binance.llamarpc.com',
    blockExplorer: 'https://bscscan.com',
    icon: '🟡',
    color: '#f0b90b',
    gasPriceGwei: 1.2,
  },
];

export const PROTOCOL_CONFIG = {
  name: 'NEXUS-0',
  version: '2.0.0-PROD',
  tagline: 'Zero-Custody Universal DeFi Gateway',
  defaultEvmTreasury: '0x71C67073755129441Cd5426154562473D1b5e589',
  defaultSolanaTreasury: 'NexusZeroTreasurySafeSol77x9PQk4VmW3b1J2n9LzP6e',
  feeRates: {
    dustSweeperBps: 250, // 2.5%
    gasStationFixedUsd: 1.50, // Flat $1.50
    exitVaultBps: 35, // 0.35%
    otcEscrowBps: 25, // 0.25%
    disperseFixedUsd: 1.00, // Flat $1.00
    airdropRecoveryBps: 300, // 3.0%
    taxCrematorFixedUsd: 2.50, // Flat $2.50 per tax disposal batch
    rentReclaimerCutPercent: 15, // 15% performance fee cut of reclaimed SOL
    panicEvacBps: 75, // 0.75% priority protection fee (min $5.00)
    panicEvacMinUsd: 5.00,
    deadMansSwitchSetupUsd: 9.99, // $9.99 one-time activation
    deadMansSwitchExecBps: 50, // 0.50% execution fee on transfer
    stealthRouterBps: 25, // 0.25% stealth execution fee
    stealthRouterMinUsd: 2.00,
    poisonRadarFixedUsd: 1.00, // $1.00 whitelist verification badge
    ghostTeleportFixedUsd: 2.50, // $2.50 flat pre-funding fee
    ghostTeleportBps: 30, // 0.30% teleport routing cut
    stakingRevenueSharePercent: 10, // 10% of all protocol revenue streamed to Staking Pool
  },
};

export const STAKING_TIERS: import('../types').StakingTier[] = [
  { id: 'tier-flex', name: 'Flexible', lockDurationDays: 0, multiplier: 1.0, feeDiscountPercent: 10, minStakeAmount: 100 },
  { id: 'tier-30', name: '30 Days', lockDurationDays: 30, multiplier: 1.5, feeDiscountPercent: 25, minStakeAmount: 500 },
  { id: 'tier-90', name: '90 Days', lockDurationDays: 90, multiplier: 2.2, feeDiscountPercent: 40, minStakeAmount: 2000 },
  { id: 'tier-365', name: '1 Year (VIP)', lockDurationDays: 365, multiplier: 4.0, feeDiscountPercent: 50, minStakeAmount: 10000 },
];
