import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useWallet } from '@/context/WalletContext';
import { useBootstrap } from '@/context/BootstrapContext';
import { fetchApprovals, revokeApproval, ApprovalItem } from '@/services/approvals';
import { colors, spacing, radius } from '@/constants/theme';

export default function ApprovalsScreen() {
  const { address, activeAccount } = useWallet();
  const { data } = useBootstrap();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const ethChain = data?.chains.find((c) => c.chainId === 1) ?? data?.chains[0];

  const load = async () => {
    if (!address || !ethChain) return;
    setLoading(true);
    const tokens = ethChain.tokens
      .filter((t) => t.contractAddress)
      .map((t) => ({ contractAddress: t.contractAddress!, symbol: t.symbol, decimals: t.decimals }));
    setItems(await fetchApprovals(ethChain.rpcUrl, address, tokens));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [address, ethChain]);

  const onRevoke = (item: ApprovalItem) => {
    Alert.alert('Revoke Approval', `Revoke ${item.tokenSymbol} for ${item.spenderName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: async () => {
          if (!activeAccount || !ethChain) return;
          try {
            await revokeApproval(ethChain.rpcUrl, activeAccount.privateKey, item.tokenAddress, item.spenderAddress, item.tokenDecimals);
            Alert.alert('Success', 'Approval revoked');
            load();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.tokenAddress}-${item.spenderAddress}`}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={<Text style={styles.empty}>No active token approvals</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.token}>{item.tokenSymbol}</Text>
              <Text style={styles.spender}>{item.spenderName}</Text>
              <Text style={styles.allowance}>Allowance: {item.allowance}</Text>
            </View>
            <TouchableOpacity style={styles.revokeBtn} onPress={() => onRevoke(item)}>
              <Text style={styles.revokeText}>Revoke</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, marginBottom: 8 },
  token: { fontWeight: '700', fontSize: 16 },
  spender: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  allowance: { fontSize: 12, color: colors.textTertiary, marginTop: 4 },
  revokeBtn: { backgroundColor: '#FFF1F0', paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm },
  revokeText: { color: colors.danger, fontWeight: '600' },
});
