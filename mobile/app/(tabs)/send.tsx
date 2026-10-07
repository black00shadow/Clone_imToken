import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useWallet } from '@/context/WalletContext';
import { getAccount, getMnemonic, sendNative, sendToken } from '@/services/wallet';
import { sendBtc } from '@/services/chains/btc';
import { sendTron } from '@/services/chains/tron';
import { checkRiskAddress } from '@/services/api';
import { saveLocalTx } from '@/services/history';
import { colors, spacing, radius } from '@/constants/theme';

export default function SendScreen() {
  const params = useLocalSearchParams<{
    rpcUrl?: string;
    symbol?: string;
    chainType?: string;
    chainName?: string;
    contractAddress?: string;
    decimals?: string;
  }>();
  const { address, activeAccount } = useWallet();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const chainType = params.chainType ?? 'evm';
  const fromAddress =
    chainType === 'btc'
      ? activeAccount?.btcAddress
      : chainType === 'tron'
        ? activeAccount?.tronAddress
        : chainType === 'ton'
          ? activeAccount?.tonAddress
          : chainType === 'cosmos'
            ? activeAccount?.cosmosAddress
            : address;

  const onSend = async () => {
    if (!to || !amount || !activeAccount) return;
    setLoading(true);
    try {
      if (chainType === 'evm') {
        const risk = await checkRiskAddress(to, params.chainName);
        if (risk) {
          Alert.alert('Risk Warning', risk.reason ?? 'Flagged address');
          setLoading(false);
          return;
        }
      }

      let hash: string;
      if (chainType === 'btc') {
        const mnemonic = await getMnemonic();
        if (!mnemonic) throw new Error('No wallet');
        hash = await sendBtc(mnemonic, activeAccount.index, to, amount);
      } else if (chainType === 'tron') {
        hash = await sendTron(activeAccount.tronPrivateKey, to, amount);
      } else if (chainType === 'ton' || chainType === 'cosmos') {
        Alert.alert('Coming soon', `${params.symbol} send requires native SDK integration`);
        setLoading(false);
        return;
      } else if (params.contractAddress) {
        hash = await sendToken(
          params.rpcUrl!,
          activeAccount.privateKey,
          params.contractAddress,
          to,
          amount,
          parseInt(params.decimals ?? '18', 10),
        );
      } else {
        hash = await sendNative(params.rpcUrl!, activeAccount.privateKey, to, amount);
      }

      await saveLocalTx({
        hash,
        chain: params.chainName ?? params.symbol ?? 'Unknown',
        symbol: params.symbol ?? '',
        from: fromAddress ?? '',
        to,
        value: amount,
        timestamp: Date.now(),
        status: 'confirmed',
        direction: 'out',
      });

      Alert.alert('Success', `TX: ${hash.slice(0, 14)}...`);
      setTo('');
      setAmount('');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>From</Text>
      <Text style={styles.from}>{fromAddress}</Text>
      <Text style={styles.label}>To Address</Text>
      <TextInput style={styles.input} value={to} onChangeText={setTo} placeholder="Address" autoCapitalize="none" />
      <Text style={styles.label}>Amount ({params.symbol ?? 'Token'})</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.0" />
      <TouchableOpacity style={styles.btn} onPress={onSend} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.card, padding: spacing.lg },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, marginTop: 12 },
  from: { fontSize: 12, color: colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 14, fontSize: 16 },
  btn: { backgroundColor: colors.primary, padding: 16, borderRadius: radius.md, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
