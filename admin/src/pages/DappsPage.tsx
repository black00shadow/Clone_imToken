import CrudPage from '../components/CrudPage';

export default function DappsPage() {
  return (
    <CrudPage
      title="DApps"
      resource="dapps"
      fields={[
        { name: 'name', label: 'Name', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'url', label: 'URL', required: true },
        { name: 'iconUrl', label: 'Icon URL' },
        { name: 'category', label: 'Category' },
        { name: 'isFeatured', label: 'Featured', type: 'switch' },
        { name: 'isEnabled', label: 'Enabled', type: 'switch' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
      ]}
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'URL', dataIndex: 'url' },
        { title: 'Category', dataIndex: 'category' },
        { title: 'Featured', dataIndex: 'isFeatured', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
