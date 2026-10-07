import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '@/context/WalletContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, address } = useWallet();

  const onReset = () => {
    Alert.alert('Reset Wallet', 'This will remove your wallet from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(onboarding)/welcome');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.section}>Wallet</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Address</Text>
        <Text style={styles.value} numberOfLines={1}>
          {address}
        </Text>
      </View>
      <Text style={styles.section}>Security</Text>
      <TouchableOpacity style={styles.dangerBtn} onPress={onReset}>
        <Text style={styles.dangerText}>Reset Wallet</Text>
      </TouchableOpacity>
      <Text style={styles.version}>Wallet v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  section: { fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 8 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 8 },
  label: { fontSize: 12, color: '#999' },
  value: { fontSize: 13, marginTop: 4 },
  dangerBtn: { backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center' },
  dangerText: { color: '#ff4d4f', fontWeight: '600' },
  version: { textAlign: 'center', color: '#999', marginTop: 32, fontSize: 12 },
});
