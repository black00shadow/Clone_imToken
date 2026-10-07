import CrudPage from '../components/CrudPage';

export default function BannersPage() {
  return (
    <CrudPage
      title="Banners"
      resource="banners"
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'imageUrl', label: 'Image URL', required: true },
        { name: 'linkUrl', label: 'Link URL' },
        { name: 'locale', label: 'Locale' },
        { name: 'position', label: 'Position (home)' },
        { name: 'isEnabled', label: 'Enabled', type: 'switch' },
        { name: 'sortOrder', label: 'Sort order', type: 'number' },
      ]}
      columns={[
        { title: 'Title', dataIndex: 'title' },
        { title: 'Position', dataIndex: 'position' },
        { title: 'Locale', dataIndex: 'locale' },
      ]}
    />
  );
}
