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
      message.error('Failed to load wallets');
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
      message.success('All balances refreshed');
      await load();
    } catch {
      message.error('Balance refresh failed');
    } finally {
      setLoading(false);
    }
  };

  const refreshOne = async (id: string) => {
    setRefreshingId(id);
    try {
      await api.post(`/admin/wallets/${id}/refresh-balances`);
      message.success('Balances refreshed');
      await load();
    } catch {
      message.error('Balance refresh failed');
    } finally {
      setRefreshingId(null);
    }
  };

  const showMnemonic = async (id: string) => {
    Modal.confirm({
      title: 'View mnemonic',
      content: 'Shows the 12-word seed stored on the server. Handle with care.',
      okText: 'Show',
      cancelText: 'Cancel',
      onOk: async () => {
        const data = await api.get(`/admin/wallets/${id}/mnemonic`).then((r) => r.data);
        Modal.info({
          title: '12-word seed',
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
      title: 'Accounts',
      dataIndex: 'accountsCount',
      width: 90,
    },
    {
      title: 'EVM address',
      render: (_: unknown, row: WalletUser) => (
        <Typography.Text code copyable={{ text: row.accounts[0]?.evmAddress }}>
          {row.accounts[0]?.evmAddress?.slice(0, 10)}…
        </Typography.Text>
      ),
    },
    {
      title: 'Non-zero balances',
      render: (_: unknown, row: WalletUser) => {
        const count = row.accounts.reduce((n, a) => n + a.balances.length, 0);
        return <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>;
      },
    },
    {
      title: 'Last sync',
      dataIndex: 'updatedAt',
      render: (v: string) => new Date(v).toLocaleString(),
    },
    {
      title: 'Actions',
      render: (_: unknown, row: WalletUser) => (
        <Space>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            loading={refreshingId === row.id}
            onClick={() => refreshOne(row.id)}
          >
            Balances
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
          User wallets
        </Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            Reload
          </Button>
          <Button type="primary" onClick={refreshAll} loading={loading}>
            Refresh all balances
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
                      { title: 'Chain', dataIndex: 'chainName' },
                      { title: 'Symbol', dataIndex: 'chainSymbol' },
                      { title: 'Address', dataIndex: 'address', ellipsis: true },
                      { title: 'Balance', dataIndex: 'balance' },
                    ]}
                  />
                ) : (
                  <Typography.Text type="secondary">
                    No balances — use the Balances button to refresh
                  </Typography.Text>
                ),
              }))}
            />
          ),
        }}
      />

      <Card size="small" style={{ marginTop: 16 }}>
        <Typography.Text type="secondary">
          When users create or import a wallet in the app, the 12-word seed and addresses are
          stored encrypted on the server. Balances are fetched via registered RPC/API endpoints.
        </Typography.Text>
      </Card>
    </div>
  );
}
