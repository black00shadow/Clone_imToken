import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '@/context/WalletContext';
import { colors, spacing, radius } from '@/constants/theme';
import '@/i18n';

export default function UnlockScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { unlock, unlockWithBiometric, biometricEnabled } = useWallet();
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (biometricEnabled) {
      unlockWithBiometric().then((ok) => {
        if (ok) router.replace('/(tabs)/wallet');
      });
    }
  }, [biometricEnabled]);

  const onUnlock = async () => {
    const ok = await unlock(pin);
    if (ok) {
      router.replace('/(tabs)/wallet');
    } else {
      Alert.alert(t('unlock.wrongPin'));
      setPin('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoText}>W</Text>
      </View>
      <Text style={styles.title}>{t('unlock.title')}</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={setPin}
        autoFocus
      />
      <TouchableOpacity style={[styles.btn, pin.length < 6 && styles.btnDisabled]} onPress={onUnlock}>
        <Text style={styles.btnText}>{t('common.confirm')}</Text>
      </TouchableOpacity>
      {biometricEnabled && (
        <TouchableOpacity style={styles.bioBtn} onPress={async () => {
          const ok = await unlockWithBiometric();
          if (ok) router.replace('/(tabs)/wallet');
        }}>
          <Ionicons name="finger-print" size={24} color={colors.primary} />
          <Text style={styles.bioText}>{t('unlock.biometric')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card, justifyContent: 'center', padding: spacing.lg },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: spacing.lg },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: spacing.md,
  },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: radius.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  bioBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: spacing.lg },
  bioText: { color: colors.primary, fontWeight: '600' },
});
