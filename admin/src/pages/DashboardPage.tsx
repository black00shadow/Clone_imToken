import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { dashboardApi } from '../api/client';

type Stats = Record<string, number>;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({});

  useEffect(() => {
    dashboardApi.stats().then(setStats);
  }, []);

  const items = [
    { title: 'Chains', key: 'chains' },
    { title: 'Tokens', key: 'tokens' },
    { title: 'DApps', key: 'dapps' },
    { title: 'Announcements', key: 'announcements' },
    { title: 'Banners', key: 'banners' },
    { title: 'Risk addresses', key: 'riskAddresses' },
    { title: 'Remote config', key: 'configs' },
    { title: 'App versions', key: 'versions' },
    { title: 'User wallets', key: 'walletUsers' },
  ];

  return (
    <div>
      <Typography.Title level={4}>Dashboard</Typography.Title>
      <Row gutter={[16, 16]}>
        {items.map((item) => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
            <Card>
              <Statistic title={item.title} value={stats[item.key] ?? 0} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
