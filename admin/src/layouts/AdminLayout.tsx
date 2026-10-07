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
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/chains', icon: <LinkOutlined />, label: 'Chains' },
  { key: '/tokens', icon: <DollarOutlined />, label: 'Tokens' },
  { key: '/dapps', icon: <AppstoreOutlined />, label: 'DApps' },
  { key: '/announcements', icon: <NotificationOutlined />, label: 'Announcements' },
  { key: '/banners', icon: <PictureOutlined />, label: 'Banners' },
  { key: '/remote-config', icon: <SettingOutlined />, label: 'Remote config' },
  { key: '/risk-addresses', icon: <WarningOutlined />, label: 'Risk addresses' },
  { key: '/wallets', icon: <WalletOutlined />, label: 'User wallets' },
  { key: '/app-versions', icon: <MobileOutlined />, label: 'App versions' },
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
            Log out
          </Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
