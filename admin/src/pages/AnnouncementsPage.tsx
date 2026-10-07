import CrudPage from '../components/CrudPage';

export default function AnnouncementsPage() {
  return (
    <CrudPage
      title="Announcements"
      resource="announcements"
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'content', label: 'Content', type: 'textarea', required: true },
        { name: 'locale', label: 'Locale (en/zh/...)' },
        { name: 'isPinned', label: 'Pinned', type: 'switch' },
        { name: 'isEnabled', label: 'Enabled', type: 'switch' },
      ]}
      columns={[
        { title: 'Title', dataIndex: 'title' },
        { title: 'Locale', dataIndex: 'locale' },
        { title: 'Pinned', dataIndex: 'isPinned', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
