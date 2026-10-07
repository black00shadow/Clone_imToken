import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTransactionHistory } from './wallet';
import { getTronHistory } from './chains/tron';

const HISTORY_KEY = 'tx_history_local';

export type TxRecord = {
  id: string;
  hash: string;
  chain: string;
  symbol: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  direction: 'in' | 'out';
};

export async function saveLocalTx(tx: Omit<TxRecord, 'id'>) {
  const list = await getLocalHistory();
  const record: TxRecord = { ...tx, id: `${tx.hash}-${Date.now()}` };
  list.unshift(record);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 200)));
}

export async function getLocalHistory(): Promise<TxRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchAllHistory(
  address: string,
  tronAddress: string,
  chains: { name: string; symbol: string; rpcUrl: string; isEvm?: boolean }[],
): Promise<TxRecord[]> {
  const local = await getLocalHistory();
  const remote: TxRecord[] = [];

  for (const chain of chains) {
    if (chain.isEvm === false && chain.symbol === 'TRX') {
      const tronTxs = await getTronHistory(tronAddress);
      for (const tx of tronTxs) {
        remote.push({
          id: tx.hash,
          hash: tx.hash,
          chain: chain.name,
          symbol: 'TRX',
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: Date.now(),
          status: 'confirmed',
          direction: tx.from.includes(address.slice(2)) ? 'out' : 'in',
        });
      }
      continue;
    }
    try {
      const evmTxs = await getTransactionHistory(chain.rpcUrl, address, 10);
      for (const tx of evmTxs) {
        remote.push({
          id: tx.hash,
          hash: tx.hash,
          chain: chain.name,
          symbol: chain.symbol,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: Date.now(),
          status: 'confirmed',
          direction: tx.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in',
        });
      }
    } catch {
      /* skip chain */
    }
  }

  const merged = [...local, ...remote];
  const seen = new Set<string>();
  return merged.filter((tx) => {
    if (seen.has(tx.hash)) return false;
    seen.add(tx.hash);
    return true;
  });
}
