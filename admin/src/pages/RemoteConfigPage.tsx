import CrudPage from '../components/CrudPage';

export default function RemoteConfigPage() {
  return (
    <CrudPage
      title="Remote config"
      resource="remote-config"
      fields={[
        { name: 'key', label: 'Key', required: true },
        { name: 'value', label: 'Value', required: true },
        { name: 'type', label: 'Type (string/boolean)' },
        { name: 'description', label: 'Description' },
      ]}
      columns={[
        { title: 'Key', dataIndex: 'key' },
        { title: 'Value', dataIndex: 'value' },
        { title: 'Type', dataIndex: 'type' },
      ]}
    />
  );
}
