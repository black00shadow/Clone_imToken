import '@/polyfills';
import '@/i18n';
import 'react-native-get-random-values';
import { Stack } from 'expo-router';
import { WalletProvider } from '@/context/WalletContext';
import { BootstrapProvider } from '@/context/BootstrapContext';
import { WalletConnectProvider } from '@/context/WalletConnectContext';

export default function RootLayout() {
  return (
    <BootstrapProvider>
      <WalletProvider>
        <WalletConnectProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="unlock" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </WalletConnectProvider>
      </WalletProvider>
    </BootstrapProvider>
  );
}
