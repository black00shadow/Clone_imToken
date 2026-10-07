import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useWallet } from '@/context/WalletContext';
import { getMnemonic } from '@/services/wallet';
import { colors, spacing, radius } from '@/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout, address, accounts, biometricEnabled, setBiometric, lock } = useWallet();

  const onBackup = async () => {
    const mnemonic = await getMnemonic();
    if (mnemonic) {
      Alert.alert(t('profile.backupMnemonic'), mnemonic, [{ text: 'OK' }]);
    }
  };

  const onReset = () => {
    Alert.alert(t('profile.resetWallet'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.resetWallet'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(onboarding)/welcome');
        },
      },
    ]);
  };

  const setLanguage = () => {
    Alert.alert(t('profile.language'), '', [
      { text: 'English', onPress: () => i18n.changeLanguage('en') },
      { text: '한국어', onPress: () => i18n.changeLanguage('ko') },
      { text: '中文', onPress: () => i18n.changeLanguage('zh') },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.primary} />
        </View>
        <Text style={styles.profileName}>Account ({accounts.length})</Text>
        <Text style={styles.profileAddr} numberOfLines={1}>{address}</Text>
      </View>

      <Text style={styles.sectionTitle}>{t('profile.manageWallets')}</Text>
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={onBackup}>
          <Ionicons name="key-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>{t('profile.backupMnemonic')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <View style={[styles.menuItem, styles.menuItemBorder]}>
          <Ionicons name="finger-print-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>{t('profile.biometric')}</Text>
          <Switch value={biometricEnabled} onValueChange={setBiometric} />
        </View>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            lock();
            router.replace('/unlock');
          }}
        >
          <Ionicons name="lock-closed-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>Lock Wallet</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/history')}>
          <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>Transaction History</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => router.push('/(tabs)/approvals')}>
          <Ionicons name="shield-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>Token Approvals</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/hardware')}>
          <Ionicons name="hardware-chip-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>{t('hardware.title')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={() => router.push('/(tabs)/walletconnect')}>
          <Ionicons name="link-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>WalletConnect</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>{t('profile.language')}</Text>
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem} onPress={setLanguage}>
          <Ionicons name="language-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>{t('profile.language')}</Text>
          <Text style={styles.menuValue}>{i18n.language.toUpperCase()}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="cash-outline" size={22} color={colors.textSecondary} />
          <Text style={styles.menuLabel}>{t('profile.currency')}</Text>
          <Text style={styles.menuValue}>USD</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
        <Text style={styles.resetText}>{t('profile.resetWallet')}</Text>
      </TouchableOpacity>
      <Text style={styles.version}>Wallet v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  profileHeader: { alignItems: 'center', paddingVertical: spacing.lg, backgroundColor: colors.card, marginBottom: spacing.sm },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EBF5FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileAddr: { fontSize: 12, color: colors.textSecondary, marginTop: 4, paddingHorizontal: 32 },
  sectionTitle: { fontSize: 13, color: colors.textSecondary, marginHorizontal: spacing.md, marginBottom: 6, marginTop: spacing.md, fontWeight: '500' },
  menuCard: { backgroundColor: colors.card, marginHorizontal: spacing.md, borderRadius: radius.md, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 15 },
  menuValue: { fontSize: 13, color: colors.textSecondary, marginRight: 4 },
  resetBtn: { margin: spacing.lg, padding: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, alignItems: 'center' },
  resetText: { color: colors.danger, fontWeight: '600' },
  version: { textAlign: 'center', color: colors.textTertiary, fontSize: 12, marginBottom: 32 },
});
