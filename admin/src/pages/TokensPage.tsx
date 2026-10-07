import CrudPage from '../components/CrudPage';

export default function TokensPage() {
  return (
    <CrudPage
      title="토큰 관리"
      resource="tokens"
      fields={[
        { name: 'chainId', label: '체인 ID (DB id)', required: true },
        { name: 'name', label: '이름', required: true },
        { name: 'symbol', label: '심볼', required: true },
        { name: 'contractAddress', label: '컨트랙트 주소' },
        { name: 'decimals', label: 'Decimals', type: 'number' },
        { name: 'iconUrl', label: '아이콘 URL' },
        { name: 'isNative', label: '네이티브', type: 'switch' },
        { name: 'isEnabled', label: '활성', type: 'switch' },
        { name: 'sortOrder', label: '정렬', type: 'number' },
      ]}
      columns={[
        { title: '이름', dataIndex: 'name' },
        { title: '심볼', dataIndex: 'symbol' },
        {
          title: '체인',
          dataIndex: 'chain',
          render: (v: unknown) => (v as { name?: string } | undefined)?.name ?? '-',
        },
        { title: '컨트랙트', dataIndex: 'contractAddress' },
        { title: '활성', dataIndex: 'isEnabled', render: (v) => (v ? 'Y' : 'N') },
      ]}
    />
  );
}
