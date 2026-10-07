import { getAllowance, approveToken } from './wallet';

export const KNOWN_SPENDERS = [
  { address: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', name: 'Uniswap V2 Router' },
  { address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', name: 'Uniswap V3 Router' },
  { address: '0x1111111254EEB25477B68fb85Ed929f73A960582', name: '1inch Router v5' },
  { address: '0xDef1C0ded9bec7B1D1670815733F007A0aD1A3C4', name: '0x Exchange Proxy' },
  { address: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88', name: 'Uniswap V3 Positions' },
];

export type ApprovalItem = {
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  spenderAddress: string;
  spenderName: string;
  allowance: string;
};

export async function fetchApprovals(
  rpcUrl: string,
  owner: string,
  tokens: { contractAddress: string; symbol: string; decimals: number }[],
): Promise<ApprovalItem[]> {
  const items: ApprovalItem[] = [];
  for (const token of tokens) {
    if (!token.contractAddress) continue;
    for (const spender of KNOWN_SPENDERS) {
      try {
        const raw = await getAllowance(rpcUrl, token.contractAddress, owner, spender.address, token.decimals);
        if (parseFloat(raw) > 0) {
          items.push({
            tokenAddress: token.contractAddress,
            tokenSymbol: token.symbol,
            tokenDecimals: token.decimals,
            spenderAddress: spender.address,
            spenderName: spender.name,
            allowance: raw,
          });
        }
      } catch {
        /* skip */
      }
    }
  }
  return items;
}

export async function revokeApproval(
  rpcUrl: string,
  privateKey: string,
  tokenAddress: string,
  spender: string,
  decimals: number,
): Promise<string> {
  return approveToken(rpcUrl, privateKey, tokenAddress, spender, '0', decimals);
}
