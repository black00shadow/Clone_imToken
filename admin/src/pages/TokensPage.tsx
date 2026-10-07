import CrudPage from '../components/CrudPage';

export default function TokensPage() {
  return (
    <CrudPage
      title="Tokens"
      resource="tokens"
      fields={[
        { name: 'chainId', label: 'Chain ID (DB id)', required: true },
        { name: 'name', label: 'Name', required: true },
        { name: 'symbol', label: 'Symbol', required: true },
        { name: 'contractAddress', label: 'Contract address' },
        { name: 'decimals', label: 'Decimals', type: 'number' },
        { name: 'iconUrl', label: 'Icon URL' },
        { name: 'isNative', label: 'Native', type: 'switch' },
        { name: 'isEnabled', label: 'Enabled', type: 'switch' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
      ]}
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Symbol', dataIndex: 'symbol' },
        {
          title: 'Chain',
          dataIndex: 'chain',
          render: (v: unknown) => (v as { name?: string } | undefined)?.name ?? '-',
        },
        { title: 'Contract', dataIndex: 'contractAddress' },
        { title: 'Enabled', dataIndex: 'isEnabled', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
