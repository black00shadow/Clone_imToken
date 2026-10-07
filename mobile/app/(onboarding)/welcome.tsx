import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, radius } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>W</Text>
        </View>
        <Text style={styles.title}>Welcome to Wallet</Text>
        <Text style={styles.subtitle}>
          Securely manage your multi-chain digital assets
        </Text>
      </View>

      <View style={styles.features}>
        {['Multi-chain support', 'Secure key storage', 'DApp browser'].map((f) => (
          <View key={f} style={styles.featureRow}>
            <View style={styles.featureDot} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(onboarding)/create')}>
          <Text style={styles.primaryText}>Create Identity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(onboarding)/import')}>
          <Text style={styles.secondaryText}>Restore Identity</Text>
        </TouchableOpacity>
        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card, padding: spacing.lg },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoText: { color: '#fff', fontSize: 36, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  features: { marginBottom: spacing.lg },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  featureText: { fontSize: 14, color: colors.textSecondary },
  actions: { paddingBottom: spacing.xl, gap: 12 },
  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 16,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  secondaryText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  terms: { fontSize: 11, color: colors.textTertiary, textAlign: 'center', marginTop: 8 },
});
