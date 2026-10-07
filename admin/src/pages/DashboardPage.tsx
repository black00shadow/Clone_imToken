import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Button, Card, Col, Row, Spin, Typography } from 'antd';
import {
  AppstoreOutlined,
  DollarOutlined,
  LinkOutlined,
  MobileOutlined,
  NotificationOutlined,
  PictureOutlined,
  ReloadOutlined,
  SettingOutlined,
  WalletOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { dashboardApi } from '../api/client';

type TokenHolding = {
  symbol: string;
  name: string;
  amount: number;
};

type TokenPoint = {
  date: string;
  total: number;
  bySymbol: Record<string, number>;
};

type TokenAmount = {
  total: number;
  holdings: TokenHolding[];
  daily: TokenPoint[];
};

type Stats = Record<string, number> & {
  tokenAmount?: TokenAmount;
};

type Metric = {
  title: string;
  key: string;
  color: string;
  icon: ReactNode;
  group: string;
};

const METRICS: Metric[] = [
  { title: 'Chains', key: 'chains', color: '#1677ff', icon: <LinkOutlined />, group: 'Network' },
  { title: 'Tokens', key: 'tokens', color: '#13c2c2', icon: <DollarOutlined />, group: 'Network' },
  { title: 'DApps', key: 'dapps', color: '#722ed1', icon: <AppstoreOutlined />, group: 'Content' },
  { title: 'Announcements', key: 'announcements', color: '#eb2f96', icon: <NotificationOutlined />, group: 'Content' },
  { title: 'Banners', key: 'banners', color: '#fa8c16', icon: <PictureOutlined />, group: 'Content' },
  { title: 'Risk addresses', key: 'riskAddresses', color: '#f5222d', icon: <WarningOutlined />, group: 'Safety' },
  { title: 'Remote config', key: 'configs', color: '#2f54eb', icon: <SettingOutlined />, group: 'Safety' },
  { title: 'App versions', key: 'versions', color: '#52c41a', icon: <MobileOutlined />, group: 'Safety' },
  { title: 'User wallets', key: 'walletUsers', color: '#faad14', icon: <WalletOutlined />, group: 'Wallets' },
];

const GROUPS = [
  { name: 'Network', hint: 'Chains and tokens', color: '#1677ff', keys: ['chains', 'tokens'] },
  { name: 'Content', hint: 'DApps, announcements, banners', color: '#722ed1', keys: ['dapps', 'announcements', 'banners'] },
  { name: 'Safety', hint: 'Risk list, config, versions', color: '#fa8c16', keys: ['riskAddresses', 'configs', 'versions'] },
  { name: 'Wallets', hint: 'Synced user wallets', color: '#13c2c2', keys: ['walletUsers'] },
];

function useCountUp(value: number, duration = 900) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return display;
}

function CountUp({ value, digits = 0 }: { value: number; digits?: number }) {
  const display = useCountUp(Math.round(value * 10 ** digits));
  const scaled = digits ? display / 10 ** digits : display;
  return <>{scaled.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits })}</>;
}

function formatAmount(value: number) {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (value >= 1) return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

const SERIES_COLORS = ['#1677ff', '#13c2c2', '#722ed1', '#fa8c16', '#52c41a', '#eb2f96', '#f5222d', '#2f54eb'];

function DailyTokenChart({ points }: { points: TokenPoint[] }) {
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const width = 760;
  const height = 280;
  const pad = { top: 18, right: 16, bottom: 32, left: 58 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const peak = Math.max(...points.map((point) => point.total), 0);
  const maxY = peak > 0 ? peak * 1.12 : 1;
  const symbols = [...new Set(points.flatMap((point) => Object.keys(point.bySymbol)))].slice(0, 6);

  const xAt = (index: number) =>
    pad.left + (points.length <= 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
  const yAt = (value: number) => pad.top + innerH - (value / maxY) * innerH;
  const line = (values: number[]) =>
    values
      .map((value, index) => `${index === 0 ? 'M' : 'L'} ${xAt(index).toFixed(1)} ${yAt(value).toFixed(1)}`)
      .join(' ');
  const area = `${line(points.map((point) => point.total))} L ${xAt(points.length - 1).toFixed(1)} ${yAt(0).toFixed(1)} L ${xAt(0).toFixed(1)} ${yAt(0).toFixed(1)} Z`;
  const ticks = [0, 0.5, 1].map((ratio) => maxY * ratio);
  const labelIndexes = points.length <= 1 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1];
  const active = hover == null ? null : points[hover];

  useEffect(() => {
    setDrawn(false);
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, [points]);

  return (
    <div className="dash-token-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily token amount chart">
        <defs>
          <linearGradient id="token-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1677ff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1677ff" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={yAt(tick)} y2={yAt(tick)} className="dash-grid" />
            <text x={pad.left - 8} y={yAt(tick) + 4} textAnchor="end" className="dash-axis">
              {formatAmount(tick)}
            </text>
          </g>
        ))}
        <path d={area} fill="url(#token-area)" className={drawn ? 'dash-draw' : 'dash-draw dash-draw-hidden'} />
        <path
          d={line(points.map((point) => point.total))}
          fill="none"
          stroke="#1677ff"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className={drawn ? 'dash-draw' : 'dash-draw dash-draw-hidden'}
        />
        {symbols.map((symbol, series) => (
          <path
            key={symbol}
            d={line(points.map((point) => point.bySymbol[symbol] ?? 0))}
            fill="none"
            stroke={SERIES_COLORS[series % SERIES_COLORS.length]}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className={drawn ? 'dash-draw' : 'dash-draw dash-draw-hidden'}
          />
        ))}
        {points.map((point, index) => (
          <rect
            key={point.date}
            x={xAt(index) - innerW / Math.max(points.length, 1) / 2}
            y={pad.top}
            width={innerW / Math.max(points.length, 1)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        {hover != null && (
          <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.top} y2={pad.top + innerH} className="dash-hover-line" />
        )}
        {labelIndexes.map((index) => (
          <text key={points[index].date} x={xAt(index)} y={height - 8} textAnchor="middle" className="dash-axis">
            {points[index].date.slice(5)}
          </text>
        ))}
      </svg>
      <div className="dash-token-readout">
        <div>
          <span>{active ? active.date : 'Latest day'}</span>
          <strong>{formatAmount(active ? active.total : points[points.length - 1]?.total ?? 0)}</strong>
        </div>
        <ul>
          {symbols.map((symbol, index) => (
            <li key={symbol}>
              <i style={{ background: SERIES_COLORS[index % SERIES_COLORS.length] }} />
              {symbol}
              <b>{formatAmount((active ?? points[points.length - 1])?.bySymbol[symbol] ?? 0)}</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({
  metric,
  value,
  share,
  delay,
}: {
  metric: Metric;
  value: number;
  share: number;
  delay: number;
}) {
  return (
    <Card className="dash-card" style={{ animationDelay: `${delay}ms` }} bordered={false}>
      <div className="dash-stat">
        <div className="dash-stat-icon" style={{ background: `${metric.color}18`, color: metric.color }}>
          {metric.icon}
        </div>
        <div>
          <div className="dash-stat-label">{metric.title}</div>
          <div className="dash-stat-value">
            <CountUp value={value} />
          </div>
        </div>
      </div>
      <div className="dash-stat-meta">
        <span>{metric.group}</span>
        <span>{share.toFixed(0)}% of records</span>
      </div>
      <div className="dash-stat-track" aria-hidden>
        <span style={{ width: `${share}%`, background: metric.color, transitionDelay: `${delay}ms` }} />
      </div>
    </Card>
  );
}

function DonutChart({
  segments,
}: {
  segments: { key: string; title: string; value: number; color: string }[];
}) {
  const [drawn, setDrawn] = useState(false);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    setDrawn(false);
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, [total]);

  let cursor = 0;

  return (
    <div className="dash-donut-wrap">
      <svg viewBox="0 0 220 220" className="dash-donut" role="img" aria-label="Record mix chart">
        <g transform="rotate(-90 110 110)">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#f0f2f5" strokeWidth="22" />
          {total > 0 &&
            segments.map((segment) => {
              const length = (segment.value / total) * circumference;
              const dash = drawn ? length : 0;
              const node = (
                <circle
                  key={segment.key}
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="22"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-cursor}
                  className="dash-donut-seg"
                />
              );
              cursor += length;
              return node;
            })}
        </g>
        <text x="110" y="104" textAnchor="middle" className="dash-donut-total">
          {total.toLocaleString()}
        </text>
        <text x="110" y="126" textAnchor="middle" className="dash-donut-caption">
          records
        </text>
      </svg>
      <ul className="dash-legend">
        {segments.map((segment) => {
          const percent = total ? (segment.value / total) * 100 : 0;
          return (
            <li key={segment.key}>
              <i style={{ background: segment.color }} />
              <span>{segment.title}</span>
              <strong>{percent.toFixed(0)}%</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barsReady, setBarsReady] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    dashboardApi
      .stats()
      .then((data: Stats) => setStats(data ?? {}))
      .catch(() => setError('Could not load dashboard stats. Check that the API is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(
    () => METRICS.map((metric) => ({ ...metric, value: Number(stats[metric.key] ?? 0) })),
    [stats],
  );
  const tokenAmount = stats.tokenAmount ?? { total: 0, holdings: [], daily: [] };
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const peak = Math.max(...rows.map((row) => row.value), 1);
  const ranked = [...rows].sort((a, b) => b.value - a.value);
  const leader = ranked[0];

  const groups = GROUPS.map((group) => {
    const value = group.keys.reduce((sum, key) => sum + (stats[key] ?? 0), 0);
    return { ...group, value, share: total ? (value / total) * 100 : 0 };
  });

  useEffect(() => {
    setBarsReady(false);
    const frame = requestAnimationFrame(() => setBarsReady(true));
    return () => cancelAnimationFrame(frame);
  }, [total, loading]);

  return (
    <div className="dash">
      <section className="dash-hero">
        <div>
          <div className="dash-kicker">
            <span className="dash-pulse" />
            Live overview
          </div>
          <Typography.Title level={3} className="dash-hero-title">
            Dashboard
          </Typography.Title>
          <p className="dash-hero-copy">
            Catalog, content, and wallet activity in one view. Charts update from the current resource counts.
          </p>
        </div>
        <div className="dash-hero-side">
          <div className="dash-hero-metric">
            <span>Total token amount</span>
            <strong>
              <CountUp value={tokenAmount.total} digits={4} />
            </strong>
          </div>
          <div className="dash-hero-metric">
            <span>Total records</span>
            <strong>
              <CountUp value={total} />
            </strong>
          </div>
          <div className="dash-hero-metric">
            <span>Largest catalog</span>
            <strong>{leader ? leader.title : '—'}</strong>
          </div>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            Refresh
          </Button>
        </div>
      </section>

      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

      <Spin spinning={loading && total === 0}>
        <Card className="dash-panel dash-token" bordered={false}>
          <div className="dash-token-head">
            <div>
              <div className="dash-stat-label">Total token amount</div>
              <div className="dash-token-total">
                <CountUp value={tokenAmount.total} digits={4} />
              </div>
              <p>Sum of native balances held by synced wallets, charted daily for the last 30 days.</p>
            </div>
            <div className="dash-token-chips">
              {tokenAmount.holdings.length === 0 && <span>No balances yet</span>}
              {tokenAmount.holdings.slice(0, 6).map((holding) => (
                <span key={holding.symbol}>
                  {holding.symbol}
                  <b>{formatAmount(holding.amount)}</b>
                </span>
              ))}
            </div>
          </div>
          {tokenAmount.daily.length > 0 && <DailyTokenChart points={tokenAmount.daily} />}
        </Card>

        <Row gutter={[16, 16]}>
          {rows.map((metric, index) => (
            <Col xs={24} sm={12} xl={8} key={metric.key}>
              <StatCard
                metric={metric}
                value={metric.value}
                share={total ? (metric.value / total) * 100 : 0}
                delay={index * 50}
              />
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]} className="dash-charts">
          <Col xs={24} lg={10}>
            <Card className="dash-panel" title="Record mix" bordered={false}>
              <DonutChart segments={rows} />
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card className="dash-panel" title="Catalog size" bordered={false}>
              <div className="dash-bars" role="img" aria-label="Catalog size chart">
                {ranked.map((row, index) => (
                  <div className="dash-bar-row" key={row.key}>
                    <span className="dash-bar-label">{row.title}</span>
                    <div className="dash-bar-track">
                      <span
                        className="dash-bar-fill"
                        style={{
                          width: barsReady ? `${(row.value / peak) * 100}%` : '0%',
                          background: row.color,
                          transitionDelay: `${index * 55}ms`,
                        }}
                      />
                    </div>
                    <strong className="dash-bar-value">{row.value.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="dash-panel dash-groups" title="Coverage by area" bordered={false}>
          <Row gutter={[16, 16]}>
            {groups.map((group, index) => (
              <Col xs={24} sm={12} lg={6} key={group.name}>
                <div className="dash-group" style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="dash-group-head">
                    <span>{group.name}</span>
                    <strong style={{ color: group.color }}>
                      <CountUp value={group.value} />
                    </strong>
                  </div>
                  <p>{group.hint}</p>
                  <div className="dash-stat-track" aria-hidden>
                    <span
                      style={{
                        width: barsReady ? `${group.share}%` : '0%',
                        background: group.color,
                        transitionDelay: `${index * 80}ms`,
                      }}
                    />
                  </div>
                  <small>{group.share.toFixed(0)}% of all records</small>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      </Spin>
    </div>
  );
}
