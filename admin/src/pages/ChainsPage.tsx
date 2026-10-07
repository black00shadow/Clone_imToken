import CrudPage from '../components/CrudPage';

export default function ChainsPage() {
  return (
    <CrudPage
      title="체인 관리"
      resource="chains"
      fields={[
        { name: 'name', label: '이름', required: true },
        { name: 'symbol', label: '심볼', required: true },
        { name: 'chainId', label: 'Chain ID', type: 'number' },
        { name: 'rpcUrl', label: 'RPC URL', required: true },
        { name: 'explorerUrl', label: 'Explorer URL' },
        { name: 'family', label: 'Family (evm/btc/tron/ton/cosmos/sol...)' },
        { name: 'coinType', label: 'BIP44 Coin Type', type: 'number' },
        { name: 'bech32Prefix', label: 'Bech32 Prefix' },
        { name: 'iconUrl', label: '아이콘 URL' },
        { name: 'isEvm', label: 'EVM', type: 'switch' },
        { name: 'isEnabled', label: '활성', type: 'switch' },
        { name: 'sortOrder', label: '정렬', type: 'number' },
      ]}
      columns={[
        { title: '이름', dataIndex: 'name' },
        { title: '심볼', dataIndex: 'symbol' },
        { title: 'Chain ID', dataIndex: 'chainId' },
        { title: 'Family', dataIndex: 'family' },
        { title: 'RPC', dataIndex: 'rpcUrl' },
        { title: '활성', dataIndex: 'isEnabled', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
