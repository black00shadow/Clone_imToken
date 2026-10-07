const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export type Chain = {
  id: string;
  name: string;
  symbol: string;
  chainId: number | null;
  rpcUrl: string;
  explorerUrl?: string;
  isEvm?: boolean;
  tokens: Token[];
};

export type Token = {
  id: string;
  name: string;
  symbol: string;
  contractAddress?: string;
  decimals: number;
  isNative: boolean;
};

export type BootstrapData = {
  chains: Chain[];
  dapps: { id: string; name: string; url: string; category: string; isFeatured?: boolean }[];
  announcements: { id: string; title: string; content: string }[];
  banners: { id: string; title: string; imageUrl: string; linkUrl?: string }[];
  config: Record<string, string>;
};

export async function fetchBootstrap(locale = 'en', platform = 'android'): Promise<BootstrapData> {
  const res = await fetch(`${API_URL}/public/bootstrap?locale=${locale}&platform=${platform}`);
  if (!res.ok) throw new Error('Failed to load bootstrap');
  return res.json();
}

export async function checkRiskAddress(address: string, chain?: string) {
  const params = new URLSearchParams({ address });
  if (chain) params.set('chain', chain);
  const res = await fetch(`${API_URL}/public/risk-check?${params}`);
  if (!res.ok) return null;
  return res.json();
}
