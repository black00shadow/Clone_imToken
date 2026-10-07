import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { setPin } from '@/services/wallet';
import { useWallet } from '@/context/WalletContext';

export default function PinScreen() {
  const router = useRouter();
  const { refresh, unlock } = useWallet();
  const [pin, setPinValue] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSave = async () => {
    if (pin.length < 6 || pin !== confirm) return;
    await setPin(pin);
    await refresh();
    await unlock(pin);
    router.replace('/(tabs)/wallet');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set PIN</Text>
      <Text style={styles.desc}>Create a 6-digit PIN to unlock your wallet</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        placeholder="PIN"
        value={pin}
        onChangeText={setPinValue}
      />
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        placeholder="Confirm PIN"
        value={confirm}
        onChangeText={setConfirm}
      />
      <TouchableOpacity
        style={[styles.btn, (pin.length < 6 || pin !== confirm) && styles.btnDisabled]}
        onPress={onSave}
      >
        <Text style={styles.btnText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: '700', marginTop: 48, marginBottom: 8 },
  desc: { fontSize: 14, color: '#666', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 16, marginBottom: 12, fontSize: 18 },
  btn: { backgroundColor: '#1677ff', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
