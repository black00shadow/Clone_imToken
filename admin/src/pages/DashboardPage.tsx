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
    { title: '체인', key: 'chains' },
    { title: '토큰', key: 'tokens' },
    { title: 'DApp', key: 'dapps' },
    { title: '공지', key: 'announcements' },
    { title: '배너', key: 'banners' },
    { title: '리스크 주소', key: 'riskAddresses' },
    { title: '원격 설정', key: 'configs' },
    { title: '앱 버전', key: 'versions' },
    { title: '사용자 지갑', key: 'walletUsers' },
  ];

  return (
    <div>
      <Typography.Title level={4}>대시보드</Typography.Title>
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
