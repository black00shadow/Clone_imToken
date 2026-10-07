import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  Collapse,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { ReloadOutlined, KeyOutlined } from '@ant-design/icons';
import { api } from '../api/client';

type WalletBalance = {
  chainName: string;
  chainSymbol: string;
  address: string;
  balance: string;
  updatedAt: string;
};

type WalletAccount = {
  id: string;
  index: number;
  evmAddress: string;
  btcAddress: string;
  tronAddress: string;
  balances: WalletBalance[];
};

type WalletUser = {
  id: string;
  deviceId: string;
  accountsCount: number;
  createdAt: string;
  updatedAt: string;
  accounts: WalletAccount[];
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/admin/wallets').then((r) => r.data);
      setWallets(data);
    } catch {
      message.error('지갑 목록을 불러오지 못했습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshAll = async () => {
    setLoading(true);
    try {
      await api.post('/admin/wallets/refresh-all-balances');
      message.success('전체 잔액 갱신 완료');
      await load();
    } catch {
      message.error('잔액 갱신 실패');
    } finally {
      setLoading(false);
    }
  };

  const refreshOne = async (id: string) => {
    setRefreshingId(id);
    try {
      await api.post(`/admin/wallets/${id}/refresh-balances`);
      message.success('잔액 갱신 완료');
      await load();
    } catch {
      message.error('잔액 갱신 실패');
    } finally {
      setRefreshingId(null);
    }
  };

  const showMnemonic = async (id: string) => {
    Modal.confirm({
      title: '니모닉 조회',
      content: '서버에 저장된 12단어 seed를 표시합니다. 보안에 주의하세요.',
      okText: '표시',
      cancelText: '취소',
      onOk: async () => {
        const data = await api.get(`/admin/wallets/${id}/mnemonic`).then((r) => r.data);
        Modal.info({
          title: '12단어 Seed',
          content: (
            <Typography.Paragraph copyable style={{ wordBreak: 'break-word' }}>
              {data.mnemonic}
            </Typography.Paragraph>
          ),
        });
      },
    });
  };

  const columns = [
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      render: (v: string) => <Typography.Text code>{v.slice(0, 16)}…</Typography.Text>,
    },
    {
      title: '계정 수',
      dataIndex: 'accountsCount',
      width: 90,
    },
    {
      title: 'EVM 주소',
      render: (_: unknown, row: WalletUser) => (
        <Typography.Text code copyable={{ text: row.accounts[0]?.evmAddress }}>
          {row.accounts[0]?.evmAddress?.slice(0, 10)}…
        </Typography.Text>
      ),
    },
    {
      title: '잔액 (0 아닌 것)',
      render: (_: unknown, row: WalletUser) => {
        const count = row.accounts.reduce((n, a) => n + a.balances.length, 0);
        return <Tag color={count > 0 ? 'green' : 'default'}>{count}개</Tag>;
      },
    },
    {
      title: '마지막 동기화',
      dataIndex: 'updatedAt',
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: '작업',
      render: (_: unknown, row: WalletUser) => (
        <Space>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={refreshingId === row.id}
            onClick={() => refreshOne(row.id)}
          >
            잔액
          </Button>
          <Button size="small" icon={<KeyOutlined />} onClick={() => showMnemonic(row.id)}>
            Seed
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          사용자 지갑
        </Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            새로고침
          </Button>
          <Button type="primary" onClick={refreshAll} loading={loading}>
            전체 잔액 갱신
          </Button>
        </Space>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={wallets}
        expandable={{
          expandedRowRender: (row) => (
            <Collapse
              items={row.accounts.map((account) => ({
                key: account.id,
                label: `Account ${account.index + 1} — EVM ${account.evmAddress.slice(0, 12)}…`,
                children: account.balances.length ? (
                  <Table
                    size="small"
                    pagination={false}
                    rowKey="id"
                    dataSource={account.balances}
                    columns={[
                      { title: '체인', dataIndex: 'chainName' },
                      { title: '심볼', dataIndex: 'chainSymbol' },
                      { title: '주소', dataIndex: 'address', ellipsis: true },
                      { title: '잔액', dataIndex: 'balance' },
                    ]}
                  />
                ) : (
                  <Typography.Text type="secondary">잔액 없음 — 「잔액」 버튼으로 갱신</Typography.Text>
                ),
              }))}
            />
          ),
        }}
      />

      <Card size="small" style={{ marginTop: 16 }}>
        <Typography.Text type="secondary">
          앱에서 지갑 생성/가져오기 시 12단어 seed와 주소가 서버에 암호화 저장됩니다. 잔액은
          등록된 RPC/API로 조회합니다.
        </Typography.Text>
      </Card>
    </div>
  );
}
