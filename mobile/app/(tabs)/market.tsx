import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useWallet } from '@/context/WalletContext';
import { useBootstrap } from '@/context/BootstrapContext';
import { fetchPricesBySymbols } from '@/services/prices';
import { getSwapQuote, executeSwap, NATIVE_TOKEN } from '@/services/swap';
import {
  getTokenlonQuote,
  executeTokenlonSwap,
  TOKENLON_USDT,
  type TokenlonQuote,
} from '@/services/tokenlon';
import { colors, spacing, radius, typography } from '@/constants/theme';

export default function MarketScreen() {
  const { t } = useTranslation();
  const { address, activeAccount } = useWallet();
  const { data } = useBootstrap();
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const ethChain = data?.chains.find((c) => c.chainId === 1) ?? data?.chains[0];
  const swapEnabled = data?.config?.swap_enabled !== 'false';

  useEffect(() => {
    fetchPricesBySymbols(['ETH', 'BTC', 'BNB', 'USDT', 'USDC', 'MATIC', 'ARB', 'OP', 'TON', 'ATOM']).then(setPrices);
  }, []);

  const fetchQuote = async () => {
    if (!amount || !address || !ethChain?.chainId) return;
    setLoading(true);
    try {
      const sellAmount = (parseFloat(amount) * 1e18).toFixed(0);
      const src = fromToken === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : TOKENLON_USDT;
      const dst = toToken === 'USDT' ? TOKENLON_USDT : '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

      const tokenlonQ = await getTokenlonQuote({
        chainId: ethChain.chainId,
        src,
        dst,
        amount: sellAmount,
        from: address,
      });
      if (tokenlonQ?.dstAmount) {
        setQuote((parseInt(tokenlonQ.dstAmount) / (toToken === 'USDT' ? 1e6 : 1e18)).toFixed(4));
        return;
      }

      const oxQ = await getSwapQuote({
        sellToken: fromToken === 'ETH' ? NATIVE_TOKEN : TOKENLON_USDT,
        buyToken: toToken === 'USDT' ? TOKENLON_USDT : NATIVE_TOKEN,
        sellAmount,
        chainId: ethChain.chainId,
        takerAddress: address,
      });
      setQuote(oxQ ? (parseInt(oxQ.buyAmount) / 1e6).toFixed(4) : null);
    } finally {
      setLoading(false);
    }
  };

  const onSwap = async () => {
    if (!swapEnabled) {
      Alert.alert(t('market.disabled'));
      return;
    }
    if (!amount || !address || !activeAccount || !ethChain?.chainId) return;
    setSwapping(true);
    try {
      const sellAmount = (parseFloat(amount) * 1e18).toFixed(0);
      const src = fromToken === 'ETH' ? '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' : TOKENLON_USDT;
      const dst = toToken === 'USDT' ? TOKENLON_USDT : '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

      let hash: string;
      const tokenlonQ = await getTokenlonQuote({
        chainId: ethChain.chainId,
        src,
        dst,
        amount: sellAmount,
        from: address,
      });

      if (tokenlonQ?.tx) {
        hash = await executeTokenlonSwap(ethChain.rpcUrl, activeAccount.privateKey, tokenlonQ as TokenlonQuote);
      } else {
        const oxQ = await getSwapQuote({
          sellToken: fromToken === 'ETH' ? NATIVE_TOKEN : TOKENLON_USDT,
          buyToken: toToken === 'USDT' ? TOKENLON_USDT : NATIVE_TOKEN,
          sellAmount,
          chainId: ethChain.chainId,
          takerAddress: address,
        });
        if (!oxQ) {
          Alert.alert(t('market.quoteFailed'));
          return;
        }
        hash = await executeSwap(ethChain.rpcUrl, activeAccount.privateKey, oxQ);
      }

      Alert.alert(t('market.success'), hash.slice(0, 16) + '...');
      setAmount('');
      setQuote(null);
    } catch (e) {
      Alert.alert(t('market.failed'), e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSwapping(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Tokenlon brand header - imToken style */}
      <View style={styles.brandBar}>
        <View style={styles.tokenlonLogo}>
          <Text style={styles.tokenlonLogoText}>T</Text>
        </View>
        <View>
          <Text style={styles.tokenlonTitle}>Tokenlon</Text>
          <Text style={styles.tokenlonSub}>{t('market.tokenlonDesc')}</Text>
        </View>
      </View>

      <View style={styles.swapCard}>
        <Text style={styles.sectionLabel}>{t('market.from')}</Text>
        <View style={styles.tokenRow}>
          <TouchableOpacity style={styles.tokenSelect}>
            <View style={styles.tokenDot} />
            <Text style={styles.tokenSelectText}>{fromToken}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.amountInput}
            placeholder="0.0"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            onBlur={fetchQuote}
          />
        </View>

        <TouchableOpacity
          style={styles.swapIcon}
          onPress={() => {
            setFromToken(toToken);
            setToToken(fromToken);
            setQuote(null);
          }}
        >
          <Ionicons name="swap-vertical" size={18} color={colors.tokenlon} />
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>{t('market.to')}</Text>
        <View style={styles.tokenRow}>
          <TouchableOpacity style={styles.tokenSelect}>
            <View style={[styles.tokenDot, { backgroundColor: colors.success }]} />
            <Text style={styles.tokenSelectText}>{toToken}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.amountOutput}>{loading ? '...' : quote ?? '0.0'}</Text>
        </View>

        <View style={styles.poweredRow}>
          <Text style={styles.poweredBy}>{t('market.poweredBy')}</Text>
          <Text style={styles.tokenlonBadge}>Tokenlon</Text>
        </View>

        <TouchableOpacity
          style={styles.swapBtn}
          onPress={onSwap}
          disabled={swapping || !amount}
        >
          {swapping ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.swapBtnText}>{t('market.swapNow')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.marketTitle}>{t('market.trend')}</Text>
      {Object.entries(prices).map(([symbol, price]) => (
        <View key={symbol} style={styles.marketRow}>
          <View style={styles.marketIcon}>
            <Text style={styles.marketIconText}>{symbol[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.marketSymbol}>{symbol}</Text>
            <Text style={styles.marketChange}>+0.00%</Text>
          </View>
          <Text style={styles.marketPrice}>${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Text>
        </View>
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.tokenlon,
  },
  tokenlonLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tokenlon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenlonLogoText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  tokenlonTitle: { ...typography.h2, fontSize: 18, color: colors.text },
  tokenlonSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  swapCard: {
    backgroundColor: colors.card,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  tokenSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  tokenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  tokenSelectText: { fontWeight: '600', fontSize: 15 },
  amountInput: { flex: 1, fontSize: 26, fontWeight: '600', textAlign: 'right', color: colors.text },
  amountOutput: { flex: 1, fontSize: 26, fontWeight: '600', textAlign: 'right', color: colors.textSecondary },
  swapIcon: {
    alignSelf: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: colors.card,
  },
  poweredRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 12 },
  poweredBy: { fontSize: 12, color: colors.textSecondary },
  tokenlonBadge: { fontSize: 12, color: colors.tokenlon, fontWeight: '700' },
  swapBtn: { backgroundColor: colors.tokenlon, padding: 16, borderRadius: radius.md, alignItems: 'center' },
  swapBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  marketTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: spacing.md, marginBottom: 8, color: colors.text },
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: 8,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  marketIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  marketIconText: { color: colors.primary, fontWeight: '700' },
  marketSymbol: { fontWeight: '600', fontSize: 15 },
  marketChange: { fontSize: 12, color: colors.success, marginTop: 2 },
  marketPrice: { fontWeight: '600', fontSize: 15 },
});
