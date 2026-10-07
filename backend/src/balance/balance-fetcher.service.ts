import { Injectable } from '@nestjs/common';

type ChainInfo = {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  family: string;
  isEvm: boolean;
};

@Injectable()
export class BalanceFetcherService {
  async fetchNativeBalance(chain: ChainInfo, address: string): Promise<string> {
    if (!address) return '0';
    try {
      const family = chain.family?.toLowerCase() ?? (chain.isEvm ? 'evm' : '');
      switch (family) {
        case 'btc':
          return await this.fetchBtc(address, chain.rpcUrl);
        case 'tron':
          return await this.fetchTron(address, chain.rpcUrl);
        case 'ton':
          return await this.fetchTon(address, chain.rpcUrl);
        case 'cosmos':
          return await this.fetchCosmos(address, chain.symbol, chain.rpcUrl);
        case 'sol':
          return await this.fetchSol(address, chain.rpcUrl);
        case 'evm':
        default:
          if (chain.isEvm && chain.rpcUrl) return await this.fetchEvm(chain.rpcUrl, address);
          return '0';
      }
    } catch {
      return '0';
    }
  }

  resolveAddress(
    chain: ChainInfo,
    account: {
      evmAddress: string;
      btcAddress: string;
      tronAddress: string;
      tonAddress: string;
      cosmosAddress: string;
    },
  ): string {
    switch (chain.symbol.toUpperCase()) {
      case 'BTC':
        return account.btcAddress;
      case 'TRX':
        return account.tronAddress;
      case 'TON':
        return account.tonAddress;
      case 'ATOM':
      case 'OSMO':
        return account.cosmosAddress;
      default:
        return chain.isEvm ? account.evmAddress : '';
    }
  }

  private async fetchEvm(rpcUrl: string, address: string): Promise<string> {
    const res = await this.postJson(rpcUrl, {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    const hex = res.result as string;
    if (!hex) return '0';
    const wei = BigInt(hex);
    return this.formatUnits(wei, 18);
  }

  private async fetchBtc(address: string, rpcUrl: string): Promise<string> {
    const base = (rpcUrl || 'https://blockstream.info/api').replace(/\/$/, '');
    const res = await fetch(`${base}/address/${address}`);
    if (!res.ok) return '0';
    const json = (await res.json()) as {
      chain_stats?: { funded_txo_sum?: number; spent_txo_sum?: number };
    };
    const funded = json.chain_stats?.funded_txo_sum ?? 0;
    const spent = json.chain_stats?.spent_txo_sum ?? 0;
    return ((funded - spent) / 1e8).toFixed(8);
  }

  private async fetchTron(address: string, rpcUrl: string): Promise<string> {
    const base = (rpcUrl || 'https://api.trongrid.io').replace(/\/$/, '');
    const res = await fetch(`${base}/v1/accounts/${address}`);
    if (!res.ok) return '0';
    const json = (await res.json()) as { data?: Array<{ balance?: number }> };
    const balance = json.data?.[0]?.balance ?? 0;
    return (balance / 1_000_000).toFixed(6);
  }

  private async fetchTon(address: string, rpcUrl: string): Promise<string> {
    const base = (rpcUrl || 'https://toncenter.com/api/v2').replace(/\/jsonRPC$/, '').replace(/\/$/, '');
    const res = await fetch(`${base}/getAddressBalance?address=${encodeURIComponent(address)}`);
    if (!res.ok) return '0';
    const json = (await res.json()) as { result?: string };
    return ((Number(json.result ?? 0)) / 1e9).toFixed(4);
  }

  private async fetchCosmos(address: string, symbol: string, rpcUrl: string): Promise<string> {
    let rest = rpcUrl.replace(/-rpc\.publicnode\.com$/, '-rest.publicnode.com').replace(/\/$/, '');
    if (!rest.includes('publicnode') && !rest.includes('/cosmos/')) {
      rest = symbol.toUpperCase() === 'OSMO'
        ? 'https://osmosis-rest.publicnode.com'
        : 'https://cosmos-rest.publicnode.com';
    }
    const res = await fetch(`${rest}/cosmos/bank/v1beta1/balances/${address}`);
    if (!res.ok) return '0';
    const json = (await res.json()) as { balances?: Array<{ denom: string; amount: string }> };
    const denom = symbol.toUpperCase() === 'OSMO' ? 'uosmo' : 'uatom';
    const item = json.balances?.find((b) => b.denom === denom);
    return ((Number(item?.amount ?? 0)) / 1e6).toFixed(4);
  }

  private async fetchSol(address: string, rpcUrl: string): Promise<string> {
    const res = await this.postJson(rpcUrl || 'https://api.mainnet-beta.solana.com', {
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [address],
    });
    const lamports = res.result?.value as number | undefined;
    return ((lamports ?? 0) / 1e9).toFixed(9);
  }

  private formatUnits(value: bigint, decimals: number): string {
    const base = 10n ** BigInt(decimals);
    const whole = value / base;
    const frac = value % base;
    if (frac === 0n) return whole.toString();
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
    return `${whole}.${fracStr}`;
  }

  private async postJson(url: string, body: unknown): Promise<any> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return {};
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  }
}
