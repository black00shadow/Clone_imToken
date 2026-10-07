import CrudPage from '../components/CrudPage';

export default function BannersPage() {
  return (
    <CrudPage
      title="배너 관리"
      resource="banners"
      fields={[
        { name: 'title', label: '제목', required: true },
        { name: 'imageUrl', label: '이미지 URL', required: true },
        { name: 'linkUrl', label: '링크 URL' },
        { name: 'locale', label: '언어' },
        { name: 'position', label: '위치 (home)' },
        { name: 'isEnabled', label: '활성', type: 'switch' },
        { name: 'sortOrder', label: '정렬', type: 'number' },
      ]}
      columns={[
        { title: '제목', dataIndex: 'title' },
        { title: '위치', dataIndex: 'position' },
        { title: '언어', dataIndex: 'locale' },
      ]}
    />
  );
}
