import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useWallet } from '@/context/WalletContext';

export default function Index() {
  const { isReady, hasWallet, isUnlocked } = useWallet();

  if (!isReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007FFF" />
      </View>
    );
  }

  if (hasWallet && !isUnlocked) {
    return <Redirect href="/unlock" />;
  }

  if (hasWallet) {
    return <Redirect href="/(tabs)/wallet" />;
  }

  return <Redirect href="/(onboarding)/welcome" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
