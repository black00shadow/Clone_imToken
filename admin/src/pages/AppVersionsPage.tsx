import CrudPage from '../components/CrudPage';

export default function AppVersionsPage() {
  return (
    <CrudPage
      title="앱 버전"
      resource="app-versions"
      fields={[
        { name: 'platform', label: '플랫폼 (android/ios)', required: true },
        { name: 'version', label: '버전', required: true },
        { name: 'minVersion', label: '최소 버전' },
        { name: 'forceUpdate', label: '강제 업데이트', type: 'switch' },
        { name: 'releaseNotes', label: '릴리즈 노트', type: 'textarea' },
        { name: 'downloadUrl', label: '다운로드 URL' },
        { name: 'isEnabled', label: '활성', type: 'switch' },
      ]}
      columns={[
        { title: '플랫폼', dataIndex: 'platform' },
        { title: '버전', dataIndex: 'version' },
        { title: '강제', dataIndex: 'forceUpdate', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
