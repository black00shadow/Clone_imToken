import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useWalletConnect } from '@/context/WalletConnectContext';
import { isWalletConnectUri } from '@/services/walletconnect';
import { colors, spacing } from '@/constants/theme';

export default function ScanScreen() {
  const router = useRouter();
  const { connectUri } = useWalletConnect();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required for QR scan</Text>
        <Text style={styles.link} onPress={requestPermission}>Grant Permission</Text>
      </View>
    );
  }

  const onBarcode = async ({ data }: { data: string }) => {
    if (scanned) return;
    if (!isWalletConnectUri(data)) {
      Alert.alert('Not a WalletConnect QR');
      return;
    }
    setScanned(true);
    try {
      await connectUri(data);
      Alert.alert('Connected', 'Check WalletConnect for session approval');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
      setScanned(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : onBarcode}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Scan WalletConnect QR Code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', marginBottom: 12 },
  link: { color: colors.primary, fontWeight: '600' },
  overlay: { position: 'absolute', bottom: 80, alignSelf: 'center' },
  hint: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
