const COINGECKO = 'https://api.coingecko.com/api/v3';

export type PriceData = Record<string, { usd: number; usd_24h_change?: number }>;

export async function fetchPrices(ids: string[]): Promise<PriceData> {
  if (!ids.length) return {};
  try {
    const res = await fetch(
      `${COINGECKO}/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`,
    );
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

const SYMBOL_TO_ID: Record<string, string> = {
  ETH: 'ethereum',
  BNB: 'binancecoin',
  MATIC: 'matic-network',
  POL: 'matic-network',
  AVAX: 'avalanche-2',
  BTC: 'bitcoin',
  TRX: 'tron',
  USDT: 'tether',
  USDC: 'usd-coin',
  DAI: 'dai',
  ARB: 'arbitrum',
  OP: 'optimism',
};

export function symbolToCoingeckoId(symbol: string): string {
  return SYMBOL_TO_ID[symbol.toUpperCase()] ?? symbol.toLowerCase();
}

export async function fetchPricesBySymbols(symbols: string[]): Promise<Record<string, number>> {
  const ids = [...new Set(symbols.map(symbolToCoingeckoId))];
  const data = await fetchPrices(ids);
  const result: Record<string, number> = {};
  for (const sym of symbols) {
    const id = symbolToCoingeckoId(sym);
    result[sym] = data[id]?.usd ?? 0;
  }
  return result;
}
