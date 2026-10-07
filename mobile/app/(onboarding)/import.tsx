import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { importWallet } from '@/services/wallet';

export default function ImportScreen() {
  const router = useRouter();
  const [mnemonic, setMnemonic] = useState('');

  const onImport = async () => {
    try {
      await importWallet(mnemonic);
      router.push('/(onboarding)/pin');
    } catch {
      Alert.alert('Error', 'Invalid recovery phrase');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Import Wallet</Text>
      <Text style={styles.desc}>Enter your 12 or 24 word recovery phrase</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="word1 word2 word3 ..."
        value={mnemonic}
        onChangeText={setMnemonic}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.btn} onPress={onImport}>
        <Text style={styles.btnText}>Import</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 48, marginBottom: 8 },
  desc: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, minHeight: 120, textAlignVertical: 'top' },
  btn: { backgroundColor: '#1677ff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
