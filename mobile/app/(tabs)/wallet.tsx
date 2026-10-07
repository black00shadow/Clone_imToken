import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/context/WalletContext';
import { useBootstrap } from '@/context/BootstrapContext';
import { getBalance, getTokenBalance } from '@/services/wallet';
import { getBtcBalance } from '@/services/chains/btc';
import { getTronBalance } from '@/services/chains/tron';
import { getTonBalance } from '@/services/chains/ton';
import { getCosmosBalance } from '@/services/chains/cosmos';
import { fetchPricesBySymbols } from '@/services/prices';
import { colors, spacing, radius } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

export default function WalletScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { address, accounts, activeAccount, switchAccount, addAccount } = useWallet();
  const { data, loading, refresh } = useBootstrap();
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);

  const chains = data?.chains ?? [];
  const activeChain = chains.find((c) => c.id === selectedChainId) ?? chains[0];

  const loadBalances = async () => {
    if (!address || !chains.length || !activeAccount) return;
    const native: Record<string, string> = {};
    const tokens: Record<string, string> = {};
    const symbols = new Set<string>(['BTC', 'TRX', 'TON', 'ATOM', 'OSMO']);
    for (const chain of chains) {
      symbols.add(chain.symbol);
      try {
        if (chain.symbol === 'BTC') {
          native[chain.id] = await getBtcBalance(activeAccount.btcAddress);
        } else if (chain.symbol === 'TRX') {
          native[chain.id] = await getTronBalance(activeAccount.tronAddress);
        } else if (chain.symbol === 'TON') {
          native[chain.id] = await getTonBalance(activeAccount.tonAddress);
        } else if (chain.symbol === 'ATOM' || chain.symbol === 'OSMO') {
          native[chain.id] = await getCosmosBalance(activeAccount.cosmosAddress);
        } else if (chain.rpcUrl) {
          native[chain.id] = await getBalance(chain.rpcUrl, address);
        }
      } catch {
        native[chain.id] = '0';
      }
      for (const token of chain.tokens) {
        symbols.add(token.symbol);
        if (token.isNative || !token.contractAddress || !chain.rpcUrl) continue;
        try {
          tokens[token.id] = await getTokenBalance(chain.rpcUrl, token.contractAddress, address, token.decimals);
        } catch {
          tokens[token.id] = '0';
        }
      }
    }
    setBalances(native);
    setTokenBalances(tokens);
    setPrices(await fetchPricesBySymbols([...symbols]));
  };

  useEffect(() => {
    if (chains.length && !selectedChainId) setSelectedChainId(chains[0].id);
  }, [chains, selectedChainId]);

  useEffect(() => {
    loadBalances();
  }, [address, activeAccount, data]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await loadBalances();
    setRefreshing(false);
  };

  const totalUsd = chains.reduce((sum, chain) => {
    let chainTotal = parseFloat(balances[chain.id] ?? '0') * (prices[chain.symbol] ?? 0);
    for (const token of chain.tokens) {
      if (!token.isNative) {
        chainTotal += parseFloat(tokenBalances[token.id] ?? '0') * (prices[token.symbol] ?? 0);
      }
    }
    return sum + chainTotal;
  }, 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - imToken style */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.accountBtn} onPress={() => setAccountModal(true)}>
          <View style={styles.accountAvatar}>
            <Ionicons name="person" size={16} color={colors.primary} />
          </View>
          <Text style={styles.accountName} numberOfLines={1}>
            {activeAccount?.name ?? 'Account 1'}
          </Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/nft')}>
            <Ionicons name="images-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/walletconnect')}>
            <Ionicons name="scan-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/(tabs)/history')}>
            <Ionicons name="time-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Total balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>{t('wallet.totalAsset')}</Text>
        <Text style={styles.balanceValue}>≈ ${totalUsd.toFixed(2)}</Text>
        <Text style={styles.balanceSub}>{address?.slice(0, 6)}...{address?.slice(-4)}</Text>
      </View>

      {/* Quick actions - imToken style row */}
      <View style={styles.quickActions}>
        {[
          { icon: 'arrow-up-outline' as const, label: t('wallet.transfer'), route: 'send' },
          { icon: 'arrow-down-outline' as const, label: t('wallet.receive'), route: 'receive' },
          { icon: 'swap-horizontal-outline' as const, label: t('wallet.swap'), route: 'market' },
          { icon: 'layers-outline' as const, label: t('wallet.buy'), route: 'market' },
        ].map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.quickAction}
            onPress={() => {
              if (action.route === 'send' && activeChain) {
                const chainType =
                  activeChain.symbol === 'BTC'
                    ? 'btc'
                    : activeChain.symbol === 'TRX'
                      ? 'tron'
                      : activeChain.symbol === 'TON'
                        ? 'ton'
                        : activeChain.symbol === 'ATOM' || activeChain.symbol === 'OSMO'
                          ? 'cosmos'
                          : 'evm';
                router.push({
                  pathname: '/(tabs)/send',
                  params: {
                    rpcUrl: activeChain.rpcUrl,
                    symbol: activeChain.symbol,
                    chainName: activeChain.name,
                    chainType,
                  },
                });
              } else if (action.route === 'receive') {
                const recvAddr =
                  activeChain?.symbol === 'BTC'
                    ? activeAccount?.btcAddress
                    : activeChain?.symbol === 'TRX'
                      ? activeAccount?.tronAddress
                      : activeChain?.symbol === 'TON'
                        ? activeAccount?.tonAddress
                        : activeChain?.symbol === 'ATOM' || activeChain?.symbol === 'OSMO'
                          ? activeAccount?.cosmosAddress
                          : address;
                router.push({
                  pathname: '/(tabs)/receive',
                  params: { address: recvAddr ?? '', symbol: activeChain?.symbol ?? 'ETH' },
                });
              } else {
                router.push('/(tabs)/market');
              }
            }}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name={action.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chain filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chainFilter}
        contentContainerStyle={styles.chainFilterContent}
      >
        {chains.map((chain) => (
          <TouchableOpacity
            key={chain.id}
            style={[styles.chainChip, selectedChainId === chain.id && styles.chainChipActive]}
            onPress={() => setSelectedChainId(chain.id)}
          >
            <Text style={[styles.chainChipText, selectedChainId === chain.id && styles.chainChipTextActive]}>
              {chain.symbol}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Token list */}
      <ScrollView
        style={styles.tokenList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {chains
          .filter((c) => !selectedChainId || c.id === selectedChainId)
          .map((chain) =>
            chain.tokens.map((token) => (
              <TouchableOpacity
                key={token.id}
                style={styles.tokenRow}
                onPress={() => {
                  const chainType =
                    chain.symbol === 'BTC'
                      ? 'btc'
                      : chain.symbol === 'TRX'
                        ? 'tron'
                        : chain.symbol === 'TON'
                          ? 'ton'
                          : chain.symbol === 'ATOM' || chain.symbol === 'OSMO'
                            ? 'cosmos'
                            : 'evm';
                  router.push({
                    pathname: '/(tabs)/send',
                    params: {
                      rpcUrl: chain.rpcUrl,
                      symbol: token.symbol,
                      chainName: chain.name,
                      chainType,
                      contractAddress: token.contractAddress ?? '',
                      decimals: String(token.decimals),
                    },
                  });
                }}
              >
                <View style={styles.tokenIcon}>
                  <Text style={styles.tokenIconText}>{token.symbol.slice(0, 1)}</Text>
                </View>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenName}>{token.name}</Text>
                  <Text style={styles.tokenChain}>{chain.name}</Text>
                </View>
                <View style={styles.tokenBalance}>
                  <Text style={styles.tokenAmount}>
                    {token.isNative ? balances[chain.id] ?? '0' : tokenBalances[token.id] ?? '0'}
                  </Text>
                  <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                  {prices[token.symbol] ? (
                    <Text style={styles.tokenUsd}>
                      $
                      {(
                        parseFloat(token.isNative ? balances[chain.id] ?? '0' : tokenBalances[token.id] ?? '0') *
                        prices[token.symbol]
                      ).toFixed(2)}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )),
          )}

      <View style={styles.toolsRow}>
        {[
          { label: 'History', icon: 'time-outline' as const, route: '/(tabs)/history' },
          { label: 'Approvals', icon: 'shield-outline' as const, route: '/(tabs)/approvals' },
          { label: 'WalletConnect', icon: 'link-outline' as const, route: '/(tabs)/walletconnect' },
        ].map((tool) => (
          <TouchableOpacity key={tool.label} style={styles.toolBtn} onPress={() => router.push(tool.route as never)}>
            <Ionicons name={tool.icon} size={18} color={colors.primary} />
            <Text style={styles.toolLabel}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

        {data?.banners?.map((banner) => (
          <TouchableOpacity key={banner.id} style={styles.banner}>
            <Text style={styles.bannerTitle}>{banner.title}</Text>
          </TouchableOpacity>
        ))}

        {data?.announcements?.[0] && (
          <View style={styles.notice}>
            <Ionicons name="megaphone-outline" size={16} color={colors.warning} />
            <Text style={styles.noticeText}>{data.announcements[0].title}</Text>
          </View>
        )}
      </ScrollView>

      {/* Account modal */}
      <Modal visible={accountModal} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAccountModal(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('wallet.switchAccount')}</Text>
            <FlatList
              data={accounts}
              keyExtractor={(item) => String(item.index)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={async () => {
                    await switchAccount(item.index);
                    setAccountModal(false);
                  }}
                >
                  <View style={styles.accountAvatar}>
                    <Ionicons name="person" size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemAddr} numberOfLines={1}>{item.address}</Text>
                  </View>
                  {activeAccount?.index === item.index && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.addAccountBtn}
              onPress={async () => {
                await addAccount();
                setAccountModal(false);
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
              <Text style={styles.addAccountText}>{t('wallet.addAccount')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 48,
    paddingBottom: spacing.md,
  },
  accountBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  accountAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: { color: '#fff', fontWeight: '600', fontSize: 16, maxWidth: 120 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerIcon: { padding: 4 },
  balanceSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: '700', marginTop: 4 },
  balanceSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },
  quickActions: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: -20,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAction: { flex: 1, alignItems: 'center', gap: 6 },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: { fontSize: 12, color: colors.text, fontWeight: '500' },
  chainFilter: { maxHeight: 48, marginTop: spacing.md },
  chainFilterContent: { paddingHorizontal: spacing.md, gap: 8 },
  chainChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chainChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chainChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  chainChipTextActive: { color: '#fff' },
  tokenList: { flex: 1, marginTop: spacing.sm },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: 8,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  tokenIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenIconText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  tokenInfo: { flex: 1 },
  tokenName: { fontSize: 15, fontWeight: '600', color: colors.text },
  tokenChain: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  tokenBalance: { alignItems: 'flex-end' },
  tokenAmount: { fontSize: 15, fontWeight: '600', color: colors.text },
  tokenSymbol: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  tokenUsd: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  banner: {
    marginHorizontal: spacing.md,
    marginBottom: 8,
    padding: spacing.md,
    backgroundColor: '#EBF5FF',
    borderRadius: radius.md,
  },
  bannerTitle: { color: colors.primary, fontWeight: '600' },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FFFBE6',
    borderRadius: radius.sm,
  },
  noticeText: { flex: 1, fontSize: 13, color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: spacing.md },
  modalItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  modalItemName: { fontSize: 15, fontWeight: '600' },
  modalItemAddr: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  addAccountBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, justifyContent: 'center' },
  addAccountText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  toolsRow: { flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: spacing.sm, gap: 8 },
  toolBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.card, padding: 10, borderRadius: radius.sm },
  toolLabel: { fontSize: 11, fontWeight: '600', color: colors.primary },
});
