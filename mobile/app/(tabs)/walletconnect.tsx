import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWalletConnect } from '@/context/WalletConnectContext';
import { isWalletConnectUri } from '@/services/walletconnect';
import { colors, spacing, radius } from '@/constants/theme';

export default function WalletConnectScreen() {
  const router = useRouter();
  const {
    sessions,
    pendingProposal,
    pendingRequest,
    refreshSessions,
    connectUri,
    approveSession,
    rejectSession,
    approveRequest,
    rejectPendingRequest,
    disconnect,
  } = useWalletConnect();
  const [uri, setUri] = useState('');

  useEffect(() => {
    refreshSessions();
  }, []);

  const onConnect = async () => {
    if (!isWalletConnectUri(uri)) {
      Alert.alert('Invalid URI', 'Paste a wc:... URI');
      return;
    }
    try {
      await connectUri(uri);
      Alert.alert('Pairing', 'Waiting for session proposal...');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Connect failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="wc:... paste WalletConnect URI"
          value={uri}
          onChangeText={setUri}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.connectBtn} onPress={onConnect}>
          <Text style={styles.connectText}>Connect</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/(tabs)/scan')}>
        <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
        <Text style={styles.scanText}>Scan QR Code</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Active Sessions ({sessions.length})</Text>
      {sessions.map((s) => (
        <View key={s.topic} style={styles.sessionCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionName}>{s.peerName}</Text>
            <Text style={styles.sessionUrl} numberOfLines={1}>{s.peerUrl}</Text>
          </View>
          <TouchableOpacity onPress={() => disconnect(s.topic)}>
            <Text style={styles.disconnect}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      ))}
      {sessions.length === 0 && <Text style={styles.empty}>No active WalletConnect sessions</Text>}

      <Modal visible={!!pendingProposal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Connection Request</Text>
            <Text style={styles.modalBody}>
              {pendingProposal?.params.proposer.metadata.name} wants to connect
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.rejectBtn} onPress={rejectSession}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={approveSession}>
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!pendingRequest} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Sign Request</Text>
            <Text style={styles.modalBody}>{pendingRequest?.params.request.method}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.rejectBtn} onPress={rejectPendingRequest}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={approveRequest}>
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, backgroundColor: colors.card, borderRadius: radius.sm, padding: 12, fontSize: 13 },
  connectBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 16, justifyContent: 'center' },
  connectText: { color: '#fff', fontWeight: '600' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 12, marginBottom: 16 },
  scanText: { color: colors.primary, fontWeight: '600' },
  section: { fontWeight: '700', marginBottom: 8 },
  sessionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: spacing.md, borderRadius: radius.md, marginBottom: 8 },
  sessionName: { fontWeight: '600' },
  sessionUrl: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  disconnect: { color: colors.danger, fontWeight: '600' },
  empty: { color: colors.textSecondary, textAlign: 'center', marginTop: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalBody: { color: colors.textSecondary, marginBottom: spacing.lg },
  modalActions: { flexDirection: 'row', gap: 12 },
  rejectBtn: { flex: 1, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  rejectText: { color: colors.danger, fontWeight: '600' },
  approveBtn: { flex: 1, padding: 14, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center' },
  approveText: { color: '#fff', fontWeight: '600' },
});
