import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/context/WalletContext';
import { useBootstrap } from '@/context/BootstrapContext';
import { getBalance } from '@/services/wallet';

export default function HomeScreen() {
  const router = useRouter();
  const { address } = useWallet();
  const { data, loading, refresh } = useBootstrap();
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadBalances = async () => {
    if (!address || !data?.chains) return;
    const result: Record<string, string> = {};
    for (const chain of data.chains) {
      try {
        result[chain.id] = await getBalance(chain.rpcUrl, address);
      } catch {
        result[chain.id] = '0';
      }
    }
    setBalances(result);
  };

  useEffect(() => {
    loadBalances();
  }, [address, data]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await loadBalances();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1677ff" />
      </View>
    );
  }

  const chains = data?.chains ?? [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.totalLabel}>Total Balance (native)</Text>
        <Text style={styles.address} numberOfLines={1}>
          {address}
        </Text>
      </View>

      {data?.announcements?.[0] && (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>{data.announcements[0].title}</Text>
          <Text style={styles.noticeBody}>{data.announcements[0].content}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Assets</Text>
      {chains.map((chain) => {
        const native = chain.tokens.find((t) => t.isNative);
        return (
          <TouchableOpacity
            key={chain.id}
            style={styles.tokenRow}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/send',
                params: { chainId: chain.id, rpcUrl: chain.rpcUrl, symbol: chain.symbol },
              })
            }
          >
            <View>
              <Text style={styles.tokenName}>{chain.name}</Text>
              <Text style={styles.tokenSymbol}>{native?.symbol ?? chain.symbol}</Text>
            </View>
            <View style={styles.tokenRight}>
              <Text style={styles.balance}>{balances[chain.id] ?? '...'}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/receive',
                      params: { address: address ?? '', symbol: chain.symbol },
                    })
                  }
                >
                  <Text style={styles.actionText}>Receive</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/send',
                      params: { chainId: chain.id, rpcUrl: chain.rpcUrl, symbol: chain.symbol },
                    })
                  }
                >
                  <Text style={styles.actionText}>Send</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1677ff', padding: 24, paddingTop: 8 },
  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  address: { color: '#fff', fontSize: 12, marginTop: 4 },
  notice: { margin: 16, padding: 12, backgroundColor: '#fff7e6', borderRadius: 8 },
  noticeTitle: { fontWeight: '600', marginBottom: 4 },
  noticeBody: { fontSize: 13, color: '#666' },
  sectionTitle: { paddingHorizontal: 16, paddingVertical: 8, fontWeight: '600', color: '#666' },
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  tokenName: { fontSize: 16, fontWeight: '600' },
  tokenSymbol: { fontSize: 12, color: '#999', marginTop: 2 },
  tokenRight: { alignItems: 'flex-end' },
  balance: { fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionText: { color: '#1677ff', fontSize: 13, fontWeight: '600' },
});
