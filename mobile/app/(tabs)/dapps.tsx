import { View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView } from 'react-native';
import { useBootstrap } from '@/context/BootstrapContext';

export default function DappsScreen() {
  const { data } = useBootstrap();
  const dapps = data?.dapps ?? [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.section}>Featured DApps</Text>
      {dapps.map((dapp) => (
        <TouchableOpacity key={dapp.id} style={styles.row} onPress={() => Linking.openURL(dapp.url)}>
          <View>
            <Text style={styles.name}>{dapp.name}</Text>
            <Text style={styles.category}>{dapp.category}</Text>
          </View>
          <Text style={styles.open}>Open</Text>
        </TouchableOpacity>
      ))}
      {dapps.length === 0 && <Text style={styles.empty}>No DApps configured in Admin</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { padding: 16, fontWeight: '600', color: '#666' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  name: { fontSize: 16, fontWeight: '600' },
  category: { fontSize: 12, color: '#999', marginTop: 2 },
  open: { color: '#1677ff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40 },
});
