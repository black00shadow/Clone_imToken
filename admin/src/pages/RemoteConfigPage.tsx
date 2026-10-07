import CrudPage from '../components/CrudPage';

export default function RemoteConfigPage() {
  return (
    <CrudPage
      title="원격 설정"
      resource="remote-config"
      fields={[
        { name: 'key', label: '키', required: true },
        { name: 'value', label: '값', required: true },
        { name: 'type', label: '타입 (string/boolean)' },
        { name: 'description', label: '설명' },
      ]}
      columns={[
        { title: '키', dataIndex: 'key' },
        { title: '값', dataIndex: 'value' },
        { title: '타입', dataIndex: 'type' },
      ]}
    />
  );
}
