export type ChainType = 'evm' | 'solana';

export interface ChainConfig {
  id: string; // 'base' | 'arbitrum' | 'ethereum' | 'zksync' | 'polygon' | 'bnb' | 'solana'
  name: string;
  type: ChainType;
  chainId?: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  blockExplorer: string;
  icon: string;
  color: string;
  gasPriceGwei: number;
}

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  priceUsd: number;
  usdValue: number;
  chainId: string;
  icon?: string;
  isDust?: boolean;
}

export interface WalletState {
  evmConnected: boolean;
  evmAddress?: string;
  evmChainId?: number;
  solanaConnected: boolean;
  solanaAddress?: string;
}

export interface DustSweepItem extends TokenBalance {
  selected: boolean;
}

export interface GasRefuelQuote {
  fromChain: string;
  fromToken: string;
  fromAmount: number;
  toChain: string;
  toAmountNative: number;
  toUsdValue: number;
  estimatedTimeSec: number;
  platformFeeUsd: number;
  protocolProvider: string;
}

export interface ExitTier {
  id: string;
  targetMultiplier: number; // e.g., 2 for 2x
  sellPercent: number; // e.g., 25%
  targetPrice: number;
  projectedProfitUsd: number;
  executed: boolean;
}

export interface ExitStrategy {
  tokenSymbol: string;
  tokenAddress: string;
  chainId: string;
  entryPrice: number;
  currentPrice: number;
  holdingAmount: number;
  stopLossPercent?: number; // e.g., -20%
  stopLossPrice?: number;
  tiers: ExitTier[];
  moonbagPercent: number;
}

export interface OTCDeal {
  id: string;
  maker: string;
  taker?: string;
  chain: string;
  offerSymbol: string;
  offerAmount: number;
  offerUsd: number;
  requestSymbol: string;
  requestAmount: number;
  requestUsd: number;
  createdAt: string;
  expiresIn: string;
  status: 'active' | 'filled' | 'cancelled';
  isPrivate: boolean;
}

export interface AllowanceRiskItem {
  id: string;
  chain: string;
  tokenSymbol: string;
  tokenAddress: string;
  spenderName: string;
  spenderAddress: string;
  allowanceAmount: string;
  riskLevel: 'critical' | 'caution' | 'safe';
  exposureUsd: number;
  selected: boolean;
}

export interface AirdropClaim {
  id: string;
  protocol: string;
  chain: string;
  tokenSymbol: string;
  unclaimedAmount: number;
  usdValue: number;
  expiryDate: string;
  status: 'unclaimed' | 'claimed';
  logo: string;
}

export interface DeadTokenItem {
  id: string;
  chain: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  balance: number;
  costBasisUsd: number;
  currentValueUsd: number;
  unrealizedLossUsd: number;
  taxWriteOffEstimateUsd: number; // e.g. at 30% capital loss deduction
  rugReason: string;
  icon: string;
  selected: boolean;
}

export interface SolanaRentAccount {
  pubkey: string;
  mint: string;
  tokenSymbol: string;
  rentLamports: number;
  rentSol: number;
  rentUsd: number;
  closed: boolean;
  selected: boolean;
}

export interface PanicEvacuationConfig {
  coldStorageAddress: string;
  usePrivateMempool: boolean;
  autoUnstakePositions: boolean;
  revokeApprovalsOnSweep: boolean;
  priorityFeeGwei: number;
}

export interface DeadMansSwitchConfig {
  isArmed: boolean;
  beneficiaryAddress: string;
  inactivityThresholdDays: number;
  lastHeartbeatTimestamp: number;
  designatedAssetsUsd: number;
  emailAlert?: string;
}

export interface StealthSwapConfig {
  sourceToken: string;
  sourceAmount: number;
  sourceUsd: number;
  targetToken: string;
  targetAmount: number;
  destinationAddress: string;
  ephemeralAddress: string;
  useRelayer: boolean;
  relayerFeeUsd: number;
}

export interface AddressPoisonAlert {
  id: string;
  originalAddress: string;
  spoofAddress: string;
  tokenTransferred: string;
  similarityScore: number; // e.g. 94%
  detectedAt: string;
  isVerifiedSafe: boolean;
}

export interface GhostTeleportQuote {
  fromChain: string;
  toChain: string;
  tokenSymbol: string;
  amount: number;
  amountUsd: number;
  prefundedGasAmountNative: number;
  prefundedGasUsd: number;
  platformFeeUsd: number;
  estimatedSeconds: number;
}

export interface StakingTier {
  id: string;
  name: string;
  lockDurationDays: number;
  multiplier: number; // e.g., 1.5x
  feeDiscountPercent: number; // e.g., 20%, 35%, 50%
  minStakeAmount: number;
}

export interface UserStakingPosition {
  stakedAmount: number;
  stakedUsd: number;
  tier: StakingTier;
  lockEndTime: number;
  accruedYieldUsd: number;
  claimableEth: number;
  claimableSol: number;
}

export interface TreasuryStats {
  totalRevenueUsd: number;
  totalVolumeProcessedUsd: number;
  totalTransactions: number;
  evmTreasury: string;
  solanaTreasury: string;
  feesByModule: {
    dustSweeper: number;
    gasStation: number;
    exitVault: number;
    otcEscrow: number;
    disperse: number;
    airdropRadar: number;
    taxCremator: number;
    rentReclaimer: number;
    panicEvacuation: number;
    deadMansSwitch: number;
    stealthRouter: number;
    poisonRadar: number;
    ghostTeleport: number;
    stakingPoolYield: number;
  };
}
