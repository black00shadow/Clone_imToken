import CrudPage from '../components/CrudPage';

export default function RiskAddressesPage() {
  return (
    <CrudPage
      title="Risk addresses"
      resource="risk-addresses"
      fields={[
        { name: 'address', label: 'Address', required: true },
        { name: 'chain', label: 'Chain', required: true },
        { name: 'reason', label: 'Reason', required: true },
        { name: 'severity', label: 'Severity (high/medium/low)' },
        { name: 'isEnabled', label: 'Enabled', type: 'switch' },
      ]}
      columns={[
        { title: 'Address', dataIndex: 'address' },
        { title: 'Chain', dataIndex: 'chain' },
        { title: 'Reason', dataIndex: 'reason' },
        { title: 'Severity', dataIndex: 'severity' },
      ]}
    />
  );
}
