import CrudPage from '../components/CrudPage';

export default function AppVersionsPage() {
  return (
    <CrudPage
      title="App versions"
      resource="app-versions"
      fields={[
        { name: 'platform', label: 'Platform (android/ios)', required: true },
        { name: 'version', label: 'Version', required: true },
        { name: 'minVersion', label: 'Minimum version' },
        { name: 'forceUpdate', label: 'Force update', type: 'switch' },
        { name: 'releaseNotes', label: 'Release notes', type: 'textarea' },
        { name: 'downloadUrl', label: 'Download URL' },
        { name: 'isEnabled', label: 'Enabled', type: 'switch' },
      ]}
      columns={[
        { title: 'Platform', dataIndex: 'platform' },
        { title: 'Version', dataIndex: 'version' },
        { title: 'Force', dataIndex: 'forceUpdate', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
