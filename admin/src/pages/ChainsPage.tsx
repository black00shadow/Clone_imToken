import CrudPage from '../components/CrudPage';

export default function ChainsPage() {
  return (
    <CrudPage
      title="Chains"
      resource="chains"
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'symbol', label: 'Symbol', required: true },
        { name: 'chainId', label: 'Chain ID', type: 'number' },
        { name: 'rpcUrl', label: 'RPC URL', required: true },
        { name: 'explorerUrl', label: 'Explorer URL' },
        { name: 'family', label: 'Family (evm/btc/tron/ton/cosmos/sol...)' },
        { name: 'coinType', label: 'BIP44 coin type', type: 'number' },
        { name: 'bech32Prefix', label: 'Bech32 prefix' },
        { name: 'iconUrl', label: 'Icon URL' },
        { name: 'isEvm', label: 'EVM', type: 'switch' },
        { name: 'isEnabled', label: 'Enabled', type: 'switch' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
      ]}
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Symbol', dataIndex: 'symbol' },
        { title: 'Chain ID', dataIndex: 'chainId' },
        { title: 'Family', dataIndex: 'family' },
        { title: 'RPC', dataIndex: 'rpcUrl' },
        { title: 'Enabled', dataIndex: 'isEnabled', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
