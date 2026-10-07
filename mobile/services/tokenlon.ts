import { ethers } from 'ethers';

const ONE_INCH_API = 'https://api.1inch.dev/swap/v6.0';

export type TokenlonQuote = {
  dstAmount: string;
  tx: { to: string; data: string; value: string; gas: number };
};

export async function getTokenlonQuote(params: {
  chainId: number;
  src: string;
  dst: string;
  amount: string;
  from: string;
}): Promise<TokenlonQuote | null> {
  const apiKey = process.env.EXPO_PUBLIC_1INCH_API_KEY;
  const headers: Record<string, string> = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
  try {
    const qs = new URLSearchParams({
      src: params.src,
      dst: params.dst,
      amount: params.amount,
      from: params.from,
      slippage: '1',
    });
    const res = await fetch(`${ONE_INCH_API}/${params.chainId}/swap?${qs}`, { headers });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function executeTokenlonSwap(
  rpcUrl: string,
  privateKey: string,
  quote: TokenlonQuote,
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const tx = await wallet.sendTransaction({
    to: quote.tx.to,
    data: quote.tx.data,
    value: BigInt(quote.tx.value || '0'),
    gasLimit: BigInt(quote.tx.gas || 300000),
  });
  await tx.wait();
  return tx.hash;
}

export const TOKENLON_NATIVE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const TOKENLON_USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
