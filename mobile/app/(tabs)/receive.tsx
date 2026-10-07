import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

export default function ReceiveScreen() {
  const params = useLocalSearchParams<{ address: string; symbol: string }>();
  const address = params.address ?? '';

  const onCopy = async () => {
    await Clipboard.setStringAsync(address);
    Alert.alert('Copied', 'Address copied');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive {params.symbol ?? ''}</Text>
      <View style={styles.qrWrap}>
        {address ? <QRCode value={address} size={200} /> : null}
      </View>
      <Text style={styles.address} selectable>
        {address}
      </Text>
      <TouchableOpacity style={styles.btn} onPress={onCopy}>
        <Text style={styles.btnText}>Copy Address</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  qrWrap: { padding: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 24 },
  address: { fontSize: 13, textAlign: 'center', color: '#333', marginBottom: 24 },
  btn: { backgroundColor: '#1677ff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
});
