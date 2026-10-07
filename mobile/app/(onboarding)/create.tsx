import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { createWallet } from '@/services/wallet';

export default function CreateScreen() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const onGenerate = async () => {
    const { mnemonic: words } = await createWallet();
    setMnemonic(words);
  };

  const onCopy = async () => {
    if (mnemonic) {
      await Clipboard.setStringAsync(mnemonic);
      Alert.alert('Copied', 'Mnemonic copied to clipboard');
    }
  };

  const onContinue = () => {
    if (!confirmed) {
      Alert.alert('Confirm', 'Please confirm you saved your mnemonic');
      return;
    }
    router.push('/(onboarding)/pin');
  };

  if (!mnemonic) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create Wallet</Text>
        <Text style={styles.desc}>Generate a new 12-word recovery phrase. Keep it safe.</Text>
        <TouchableOpacity style={styles.btn} onPress={onGenerate}>
          <Text style={styles.btnText}>Generate Mnemonic</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Backup Mnemonic</Text>
      <Text style={styles.desc}>Write down these 12 words in order. Never share them.</Text>
      <View style={styles.mnemonicBox}>
        <Text style={styles.mnemonic}>{mnemonic}</Text>
      </View>
      <TouchableOpacity style={styles.linkBtn} onPress={onCopy}>
        <Text style={styles.linkText}>Copy to clipboard</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.checkRow} onPress={() => setConfirmed(!confirmed)}>
        <View style={[styles.checkbox, confirmed && styles.checked]} />
        <Text style={styles.checkLabel}>I have saved my recovery phrase</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, !confirmed && styles.btnDisabled]} onPress={onContinue}>
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 48, marginBottom: 8 },
  desc: { fontSize: 14, color: '#666', marginBottom: 24 },
  mnemonicBox: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 12, marginBottom: 12 },
  mnemonic: { fontSize: 16, lineHeight: 28, fontWeight: '500' },
  btn: { backgroundColor: '#1677ff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkBtn: { alignItems: 'center', padding: 8 },
  linkText: { color: '#1677ff' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 12 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#1677ff', borderRadius: 4 },
  checked: { backgroundColor: '#1677ff' },
  checkLabel: { flex: 1, fontSize: 14 },
});
