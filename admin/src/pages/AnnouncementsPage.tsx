import CrudPage from '../components/CrudPage';

export default function AnnouncementsPage() {
  return (
    <CrudPage
      title="공지사항"
      resource="announcements"
      fields={[
        { name: 'title', label: '제목', required: true },
        { name: 'content', label: '내용', type: 'textarea', required: true },
        { name: 'locale', label: '언어 (ko/en)' },
        { name: 'isPinned', label: '고정', type: 'switch' },
        { name: 'isEnabled', label: '활성', type: 'switch' },
      ]}
      columns={[
        { title: '제목', dataIndex: 'title' },
        { title: '언어', dataIndex: 'locale' },
        { title: '고정', dataIndex: 'isPinned', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
