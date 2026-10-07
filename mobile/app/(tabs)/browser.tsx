import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useBootstrap } from '@/context/BootstrapContext';
import { useWallet } from '@/context/WalletContext';
import { getInjectedEthereumScript, handleEthereumRequest } from '@/services/dapp-provider';
import { colors, spacing, radius } from '@/constants/theme';

export default function BrowserScreen() {
  const { t } = useTranslation();
  const { data } = useBootstrap();
  const { address, activeAccount } = useWallet();
  const webRef = useRef<WebView>(null);
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [showWebView, setShowWebView] = useState(false);

  const dapps = data?.dapps ?? [];
  const ethChain = data?.chains.find((c) => c.chainId === 1) ?? data?.chains[0];

  const openUrl = (target: string) => {
    let normalized = target.trim();
    if (!normalized.startsWith('http')) normalized = `https://${normalized}`;
    setCurrentUrl(normalized);
    setUrl(normalized);
    setShowWebView(true);
  };

  const onWebViewMessage = async (event: WebViewMessageEvent) => {
    if (!activeAccount || !ethChain?.chainId) return;
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'eth_request' || msg.method) {
        const result = await handleEthereumRequest(msg.method, msg.params ?? [], {
          address: activeAccount.address,
          privateKey: activeAccount.privateKey,
          rpcUrl: ethChain.rpcUrl,
          chainId: ethChain.chainId,
        });
        webRef.current?.injectJavaScript(
          `window.__handleEthereumResponse(${msg.id}, ${JSON.stringify(result)}, null); true;`,
        );
      }
    } catch (e) {
      const msg = JSON.parse(event.nativeEvent.data);
      webRef.current?.injectJavaScript(
        `window.__handleEthereumResponse(${msg.id}, null, ${JSON.stringify(String(e))}); true;`,
      );
    }
  };

  if (showWebView && Platform.OS !== 'web' && address && ethChain?.chainId) {
    return (
      <View style={styles.container}>
        <View style={styles.browserBar}>
          <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <TextInput
            style={styles.urlInput}
            value={url}
            onChangeText={setUrl}
            onSubmitEditing={() => openUrl(url)}
            autoCapitalize="none"
            returnKeyType="go"
          />
          <TouchableOpacity onPress={() => webRef.current?.reload()}>
            <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <WebView
          ref={webRef}
          source={{ uri: currentUrl }}
          style={{ flex: 1 }}
          injectedJavaScriptBeforeContentLoaded={getInjectedEthereumScript(ethChain.chainId, address)}
          onMessage={onWebViewMessage}
          onNavigationStateChange={(nav) => setUrl(nav.url)}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('browser.search')}
          value={url}
          onChangeText={setUrl}
          onSubmitEditing={() => url && openUrl(url)}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      <Text style={styles.sectionTitle}>{t('browser.recommend')}</Text>
      <View style={styles.dappGrid}>
        {dapps.slice(0, 9).map((dapp) => (
          <TouchableOpacity key={dapp.id} style={styles.dappCard} onPress={() => openUrl(dapp.url)}>
            <View style={styles.dappIcon}>
              <Text style={styles.dappIconText}>{dapp.name[0]}</Text>
            </View>
            <Text style={styles.dappName} numberOfLines={1}>{dapp.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t('browser.recently')}</Text>
      {dapps.slice(0, 5).map((dapp) => (
        <TouchableOpacity key={`recent-${dapp.id}`} style={styles.listItem} onPress={() => openUrl(dapp.url)}>
          <View style={styles.dappIconSmall}>
            <Text style={styles.dappIconText}>{dapp.name[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listItemName}>{dapp.name}</Text>
            <Text style={styles.listItemUrl} numberOfLines={1}>{dapp.url}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      ))}

      {Platform.OS === 'web' && (
        <TouchableOpacity
          style={styles.openExternal}
          onPress={() => url && Linking.openURL(url.startsWith('http') ? url : `https://${url}`)}
        >
          <Text style={styles.openExternalText}>Open in browser (Web mode)</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, margin: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.full, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: spacing.md, marginBottom: spacing.sm, marginTop: spacing.sm },
  dappGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, gap: 12 },
  dappCard: { width: '30%', backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.sm, alignItems: 'center' },
  dappIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  dappIconSmall: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  dappIconText: { color: colors.primary, fontWeight: '700', fontSize: 18 },
  dappName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, marginHorizontal: spacing.md, marginBottom: 8, padding: spacing.md, borderRadius: radius.md },
  listItemName: { fontWeight: '600', fontSize: 14 },
  listItemUrl: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  browserBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: spacing.sm, paddingTop: 48, paddingBottom: spacing.sm, gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { padding: 4 },
  urlInput: { flex: 1, backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  openExternal: { margin: spacing.md, alignItems: 'center' },
  openExternalText: { color: colors.primary, fontWeight: '600' },
});
