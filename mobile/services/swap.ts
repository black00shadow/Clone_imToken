import { ethers } from 'ethers';

const ZEROX_API = 'https://api.0x.org';

export type SwapQuote = {
  buyAmount: string;
  sellAmount: string;
  price: string;
  guaranteedPrice: string;
  to: string;
  data: string;
  value: string;
  gas: string;
};

export async function getSwapQuote(params: {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  chainId: number;
  takerAddress: string;
}): Promise<SwapQuote | null> {
  const apiKey = process.env.EXPO_PUBLIC_0X_API_KEY;
  const qs = new URLSearchParams({
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    takerAddress: params.takerAddress,
  });
  try {
    const res = await fetch(`${ZEROX_API}/swap/v1/quote?${qs}`, {
      headers: apiKey ? { '0x-api-key': apiKey } : {},
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function executeSwap(rpcUrl: string, privateKey: string, quote: SwapQuote): Promise<string> {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const tx = await wallet.sendTransaction({
    to: quote.to,
    data: quote.data,
    value: BigInt(quote.value || '0'),
    gasLimit: BigInt(quote.gas || '300000'),
  });
  await tx.wait();
  return tx.hash;
}

// Native ETH placeholder for 0x
export const NATIVE_TOKEN = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
