import CrudPage from '../components/CrudPage';

export default function RiskAddressesPage() {
  return (
    <CrudPage
      title="리스크 주소"
      resource="risk-addresses"
      fields={[
        { name: 'address', label: '주소', required: true },
        { name: 'chain', label: '체인', required: true },
        { name: 'reason', label: '사유', required: true },
        { name: 'severity', label: '심각도 (high/medium/low)' },
        { name: 'isEnabled', label: '활성', type: 'switch' },
      ]}
      columns={[
        { title: '주소', dataIndex: 'address' },
        { title: '체인', dataIndex: 'chain' },
        { title: '사유', dataIndex: 'reason' },
        { title: '심각도', dataIndex: 'severity' },
      ]}
    />
  );
}
