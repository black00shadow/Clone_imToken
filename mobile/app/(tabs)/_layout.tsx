import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 49,
          paddingBottom: 4,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="wallet-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: 'Tokenlon',
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { fontWeight: '700', fontSize: 17, color: colors.tokenlon },
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="browser"
        options={{
          title: 'Browser',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="globe-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="nft" options={{ href: null, title: 'NFT' }} />
      <Tabs.Screen name="walletconnect" options={{ href: null, title: 'WalletConnect' }} />
      <Tabs.Screen name="approvals" options={{ href: null, title: 'Approvals' }} />
      <Tabs.Screen name="history" options={{ href: null, title: 'History' }} />
      <Tabs.Screen name="scan" options={{ href: null, title: 'Scan' }} />
      <Tabs.Screen name="hardware" options={{ href: null, title: 'Hardware Wallet' }} />
      <Tabs.Screen name="send" options={{ href: null, title: 'Send' }} />
      <Tabs.Screen name="receive" options={{ href: null, title: 'Receive' }} />
      <Tabs.Screen name="home" options={{ href: null }} />
      <Tabs.Screen name="dapps" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
