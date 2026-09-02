/**
 * Multi-chain live wallet connector for NEXUS-0
 * Supports MetaMask, Rabby, Coinbase Wallet via viem, and Phantom / Solflare for Solana.
 */
import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';

export interface WalletProviderInfo {
  id: string;
  name: string;
  type: 'evm' | 'solana';
  icon: string;
  isInstalled: boolean;
}

export const getAvailableWallets = (): WalletProviderInfo[] => {
  const hasEth = typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
  const hasSol = typeof window !== 'undefined' && typeof (window as any).solana !== 'undefined';

  return [
    {
      id: 'metamask',
      name: 'MetaMask / Injected',
      type: 'evm',
      icon: '🦊',
      isInstalled: hasEth,
    },
    {
      id: 'rabby',
      name: 'Rabby Wallet',
      type: 'evm',
      icon: '🐰',
      isInstalled: hasEth && !!(window as any).ethereum?.isRabby,
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      type: 'evm',
      icon: '🔵',
      isInstalled: hasEth && !!(window as any).ethereum?.isCoinbaseWallet,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      type: 'solana',
      icon: '👻',
      isInstalled: hasSol && !!(window as any).solana?.isPhantom,
    },
    {
      id: 'solflare',
      name: 'Solflare',
      type: 'solana',
      icon: '☀️',
      isInstalled: typeof window !== 'undefined' && !!(window as any).solflare,
    },
  ];
};

export const connectBrowserEvm = async (): Promise<{ address: string; chainId: number } | null> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('No EVM browser wallet detected. Please install MetaMask or Rabby.');
  }

  const client = createWalletClient({
    chain: base,
    transport: custom((window as any).ethereum),
  });

  const [address] = await client.requestAddresses();
  const chainId = await client.getChainId();

  return { address, chainId };
};

export const connectBrowserSolana = async (): Promise<{ address: string } | null> => {
  if (typeof window === 'undefined' || !(window as any).solana) {
    throw new Error('No Solana browser wallet detected. Please install Phantom.');
  }

  const resp = await (window as any).solana.connect();
  return { address: resp.publicKey.toString() };
};

export const formatAddress = (addr: string, prefixLen: number = 6, suffixLen: number = 4): string => {
  if (!addr) return '';
  if (addr.length <= prefixLen + suffixLen) return addr;
  return `${addr.slice(0, prefixLen)}...${addr.slice(-suffixLen)}`;
};
