import CrudPage from '../components/CrudPage';

export default function DappsPage() {
  return (
    <CrudPage
      title="DApp 관리"
      resource="dapps"
      fields={[
        { name: 'name', label: '이름', required: true },
        { name: 'description', label: '설명', type: 'textarea' },
        { name: 'url', label: 'URL', required: true },
        { name: 'iconUrl', label: '아이콘 URL' },
        { name: 'category', label: '카테고리' },
        { name: 'isFeatured', label: '추천', type: 'switch' },
        { name: 'isEnabled', label: '활성', type: 'switch' },
        { name: 'sortOrder', label: '정렬', type: 'number' },
      ]}
      columns={[
        { title: '이름', dataIndex: 'name' },
        { title: 'URL', dataIndex: 'url' },
        { title: '카테고리', dataIndex: 'category' },
        { title: '추천', dataIndex: 'isFeatured', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
