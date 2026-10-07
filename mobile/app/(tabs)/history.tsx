import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/context/WalletContext';
import { useBootstrap } from '@/context/BootstrapContext';
import { fetchAllHistory, TxRecord } from '@/services/history';
import { colors, spacing, radius } from '@/constants/theme';

export default function HistoryScreen() {
  const { address, activeAccount } = useWallet();
  const { data } = useBootstrap();
  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!address || !activeAccount || !data?.chains) return;
    const chains = data.chains.map((c) => ({
      name: c.name,
      symbol: c.symbol,
      rpcUrl: c.rpcUrl,
      isEvm: c.chainId !== null,
    }));
    chains.push({ name: 'TRON', symbol: 'TRX', rpcUrl: '', isEvm: false });
    setTxs(await fetchAllHistory(address, activeAccount.tronAddress, chains));
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [address, activeAccount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={txs}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ padding: spacing.md }}
      ListEmptyComponent={<Text style={styles.empty}>No transactions yet</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={[styles.icon, item.direction === 'out' ? styles.out : styles.in]}>
            <Ionicons
              name={item.direction === 'out' ? 'arrow-up' : 'arrow-down'}
              size={18}
              color={item.direction === 'out' ? colors.danger : colors.success}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.chain}>{item.chain} · {item.symbol}</Text>
            <Text style={styles.hash} numberOfLines={1}>{item.hash}</Text>
            <Text style={styles.addrs} numberOfLines={1}>
              {item.direction === 'out' ? `To: ${item.to.slice(0, 10)}...` : `From: ${item.from.slice(0, 10)}...`}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.value, item.direction === 'out' && styles.outValue]}>
              {item.direction === 'out' ? '-' : '+'}{item.value}
            </Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, marginBottom: 8, gap: 12 },
  icon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  in: { backgroundColor: '#F6FFED' },
  out: { backgroundColor: '#FFF1F0' },
  chain: { fontWeight: '600', fontSize: 14 },
  hash: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  addrs: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  value: { fontWeight: '700', fontSize: 15 },
  outValue: { color: colors.danger },
  status: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});
