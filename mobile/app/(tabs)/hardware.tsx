import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  scanLedgerDevices,
  connectLedger,
  getLedgerEthAddress,
  disconnectLedger,
  getConnectedDevice,
  isHardwareSupported,
  type LedgerDevice,
} from '@/services/hardware';
import { colors, spacing, radius } from '@/constants/theme';

export default function HardwareScreen() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<LedgerDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [addresses, setAddresses] = useState<string[]>([]);
  const connected = getConnectedDevice();

  const onScan = async () => {
    if (!isHardwareSupported()) {
      Alert.alert(t('hardware.notSupported'), t('hardware.nativeOnly'));
      return;
    }
    setScanning(true);
    try {
      setDevices(await scanLedgerDevices());
    } finally {
      setScanning(false);
    }
  };

  const onConnect = async (device: LedgerDevice) => {
    setConnecting(true);
    try {
      await connectLedger(device.id);
      const acc = await getLedgerEthAddress(0);
      setAddresses([acc.address]);
      Alert.alert(t('hardware.connected'), device.name);
    } catch (e) {
      Alert.alert(t('hardware.failed'), e instanceof Error ? e.message : 'Unknown');
    } finally {
      setConnecting(false);
    }
  };

  const onDisconnect = async () => {
    await disconnectLedger();
    setAddresses([]);
    setDevices([]);
  };

  return (
    <>
      <Stack.Screen options={{ title: t('hardware.title'), headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="hardware-chip-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>{t('hardware.title')}</Text>
          <Text style={styles.heroSub}>{t('hardware.subtitle')}</Text>
        </View>

        {connected ? (
          <View style={styles.connectedCard}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.connectedText}>{connected.name}</Text>
            <TouchableOpacity onPress={onDisconnect}>
              <Text style={styles.disconnect}>{t('hardware.disconnect')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.scanBtn} onPress={onScan} disabled={scanning}>
            {scanning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="bluetooth" size={20} color="#fff" />
                <Text style={styles.scanBtnText}>{t('hardware.scan')}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.section}>{t('hardware.devices')}</Text>
        <FlatList
          data={devices}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.empty}>{t('hardware.noDevices')}</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.deviceRow} onPress={() => onConnect(item)} disabled={connecting}>
              <Ionicons name="wallet-outline" size={24} color={colors.primary} />
              <Text style={styles.deviceName}>{item.name}</Text>
              {connecting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          )}
        />

        {addresses.length > 0 && (
          <>
            <Text style={styles.section}>{t('hardware.accounts')}</Text>
            {addresses.map((addr) => (
              <View key={addr} style={styles.addrRow}>
                <Text style={styles.addrText} numberOfLines={1}>{addr}</Text>
              </View>
            ))}
          </>
        )}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.noteText}>{t('hardware.devBuildNote')}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.card, marginBottom: spacing.md },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  heroSub: { fontSize: 13, color: colors.textSecondary, marginTop: 6, textAlign: 'center' },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  scanBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  connectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  connectedText: { flex: 1, fontWeight: '600' },
  disconnect: { color: colors.danger, fontWeight: '600' },
  section: {
    fontSize: 13,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: 8,
    fontWeight: '500',
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: 8,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  deviceName: { flex: 1, fontSize: 15, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.textSecondary, marginVertical: spacing.lg },
  addrRow: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginBottom: 8,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  addrText: { fontFamily: 'monospace', fontSize: 13 },
  note: {
    flexDirection: 'row',
    gap: 8,
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
  },
  noteText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
});
