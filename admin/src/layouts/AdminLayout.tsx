import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import {
  DashboardOutlined,
  LinkOutlined,
  DollarOutlined,
  AppstoreOutlined,
  NotificationOutlined,
  PictureOutlined,
  SettingOutlined,
  WarningOutlined,
  MobileOutlined,
  LogoutOutlined,
  WalletOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '대시보드' },
  { key: '/chains', icon: <LinkOutlined />, label: '체인 관리' },
  { key: '/tokens', icon: <DollarOutlined />, label: '토큰 관리' },
  { key: '/dapps', icon: <AppstoreOutlined />, label: 'DApp 관리' },
  { key: '/announcements', icon: <NotificationOutlined />, label: '공지사항' },
  { key: '/banners', icon: <PictureOutlined />, label: '배너' },
  { key: '/remote-config', icon: <SettingOutlined />, label: '원격 설정' },
  { key: '/risk-addresses', icon: <WarningOutlined />, label: '리스크 주소' },
  { key: '/wallets', icon: <WalletOutlined />, label: '사용자 지갑' },
  { key: '/app-versions', icon: <MobileOutlined />, label: '앱 버전' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: themeToken } = theme.useToken();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: collapsed ? 14 : 18,
          }}
        >
          {collapsed ? 'W' : 'Wallet Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname === '/' ? '/' : location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: themeToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <Button icon={<LogoutOutlined />} onClick={logout}>
            로그아웃
          </Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
