import type { ComponentType } from 'react';
import {
  Sparkles,
  Fuel,
  Target,
  Handshake,
  Users,
  ShieldAlert,
  Gift,
  DollarSign,
  Flame,
  Coins,
  AlertTriangle,
  HeartPulse,
  EyeOff,
  Layers,
  Send,
  Shield,
  LayoutGrid,
} from 'lucide-react';

export type TabType =
  | 'overview'
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

export type NavCategory = 'execution' | 'security' | 'utilities' | 'ecosystem';

export interface ToolItem {
  id: Exclude<TabType, 'overview'>;
  label: string;
  category: NavCategory;
  icon: ComponentType<{ className?: string }>;
  badge: string;
  description: string;
}

export const ALL_TOOLS: ToolItem[] = [
  {
    id: 'sweeper',
    label: 'Dust Sweeper',
    category: 'execution',
    icon: Sparkles,
    badge: '2.5%',
    description: 'Consolidate residual balances into ETH, SOL, or USDC',
  },
  {
    id: 'stealth',
    label: 'Stealth Router',
    category: 'execution',
    icon: EyeOff,
    badge: '0.25%',
    description: 'Private swaps that break public wallet clustering',
  },
  {
    id: 'teleport',
    label: 'Ghost Teleport',
    category: 'execution',
    icon: Send,
    badge: 'Gas-inc.',
    description: 'Cross-chain transfer with destination gas pre-funded',
  },
  {
    id: 'exit',
    label: 'Exit Strategy',
    category: 'execution',
    icon: Target,
    badge: '0.35%',
    description: 'Non-custodial tiered profit-taking ladders',
  },
  {
    id: 'escrow',
    label: 'OTC Escrow',
    category: 'execution',
    icon: Handshake,
    badge: '0.25%',
    description: 'Trustless peer-to-peer settlement without DEX slippage',
  },
  {
    id: 'disperse',
    label: 'Batch Disperse',
    category: 'execution',
    icon: Users,
    badge: '$1.00',
    description: 'Atomic multi-address token and gas payments',
  },
  {
    id: 'poison',
    label: 'Poison Radar',
    category: 'security',
    icon: ShieldAlert,
    badge: '$1.00',
    description: 'Detect lookalike address-poisoning traps',
  },
  {
    id: 'panic',
    label: 'Emergency Withdrawal',
    category: 'security',
    icon: AlertTriangle,
    badge: '0.75%',
    description: 'Private-mempool sweep to a cold-storage vault',
  },
  {
    id: 'security',
    label: 'Revoke Shield',
    category: 'security',
    icon: Shield,
    badge: 'Audit',
    description: 'Review and revoke unlimited token allowances',
  },
  {
    id: 'cremator',
    label: 'Tax-Loss Disposal',
    category: 'security',
    icon: Flame,
    badge: '$2.50',
    description: 'Dispose of unsellable tokens for documented tax losses',
  },
  {
    id: 'rent',
    label: 'Rent Recovery',
    category: 'security',
    icon: Coins,
    badge: '15%',
    description: 'Recover trapped SOL from dormant token accounts',
  },
  {
    id: 'switch',
    label: 'Estate Protection',
    category: 'security',
    icon: HeartPulse,
    badge: '$9.99',
    description: 'Timelocked non-custodial inheritance testament',
  },
  {
    id: 'gas',
    label: 'Gas Station',
    category: 'utilities',
    icon: Fuel,
    badge: '$1.50',
    description: 'Cross-chain gas refuel in approximately eight seconds',
  },
  {
    id: 'airdrop',
    label: 'Airdrop Radar',
    category: 'utilities',
    icon: Gift,
    badge: '3.0%',
    description: 'Discover and claim unclaimed token allocations',
  },
  {
    id: 'staking',
    label: 'Protocol Staking',
    category: 'ecosystem',
    icon: Layers,
    badge: '24.8%',
    description: 'Stake to share protocol fees and reduce execution costs',
  },
  {
    id: 'treasury',
    label: 'Treasury',
    category: 'ecosystem',
    icon: DollarSign,
    badge: 'Owner',
    description: 'Inspect protocol fees and cold-storage treasury',
  },
];

export const CATEGORIES: {
  id: NavCategory;
  label: string;
  count: number;
}[] = [
  { id: 'execution', label: 'Execution', count: 6 },
  { id: 'security', label: 'Protection', count: 6 },
  { id: 'utilities', label: 'Utilities', count: 2 },
  { id: 'ecosystem', label: 'Protocol', count: 2 },
];

export const OVERVIEW_ITEM = {
  id: 'overview' as const,
  label: 'Overview',
  icon: LayoutGrid,
  description: 'Security posture, protocol status, and operations catalog',
};

export function getTool(id: TabType): ToolItem | undefined {
  if (id === 'overview') return undefined;
  return ALL_TOOLS.find((t) => t.id === id);
}

export function getCategoryLabel(id: NavCategory): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
