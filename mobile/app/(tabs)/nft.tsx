import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useBootstrap } from '@/context/BootstrapContext';
import { useWallet } from '@/context/WalletContext';
import { fetchNfts } from '@/services/nft';
import { colors, spacing, radius } from '@/constants/theme';

const DEFAULT_NFT_CONTRACTS = [
  { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', name: 'BAYC' },
];

export default function NftScreen() {
  const { t } = useTranslation();
  const { address, activeAccount } = useWallet();
  const { data } = useBootstrap();
  const [nfts, setNfts] = useState<Awaited<ReturnType<typeof fetchNfts>>>([]);
  const [loading, setLoading] = useState(true);

  const ethChain = data?.chains.find((c) => c.chainId === 1);

  useEffect(() => {
    if (!address || !ethChain) return;
    fetchNfts(ethChain.rpcUrl, address, DEFAULT_NFT_CONTRACTS)
      .then(setNfts)
      .finally(() => setLoading(false));
  }, [address, ethChain]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('wallet.nft')}</Text>
      <FlatList
        data={nfts}
        keyExtractor={(item) => `${item.contractAddress}-${item.tokenId}`}
        numColumns={2}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={<Text style={styles.empty}>No NFTs found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>NFT</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.collection}>{item.collection}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', padding: spacing.md },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 40 },
  card: { flex: 1, margin: 6, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm },
  imagePlaceholder: { aspectRatio: 1, backgroundColor: '#EBF5FF', borderRadius: radius.sm, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: colors.primary, fontWeight: '700' },
  name: { fontWeight: '600', marginTop: 8, fontSize: 13 },
  collection: { fontSize: 11, color: colors.textSecondary },
});
