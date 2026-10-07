import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';

const HISTORY_DAYS = 30;

type BalanceRow = {
  chainId: string;
  chainSymbol: string;
  chainName: string;
  address: string;
  balance: string;
};

type SnapshotRow = BalanceRow & { day: Date };

export type TokenAmountPoint = {
  date: string;
  total: number;
  bySymbol: Record<string, number>;
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [chains, tokens, dapps, announcements, banners, riskAddresses, configs, versions, walletUsers, tokenAmount] =
      await Promise.all([
        this.prisma.chain.count(),
        this.prisma.token.count(),
        this.prisma.dapp.count(),
        this.prisma.announcement.count(),
        this.prisma.banner.count(),
        this.prisma.riskAddress.count(),
        this.prisma.remoteConfig.count(),
        this.prisma.appVersion.count(),
        this.prisma.walletUser.count(),
        this.getTokenAmount(),
      ]);

    return {
      chains,
      tokens,
      dapps,
      announcements,
      banners,
      riskAddresses,
      configs,
      versions,
      walletUsers,
      tokenAmount,
    };
  }

  private async getTokenAmount() {
    const balances = await this.prisma.walletBalance.findMany({
      select: {
        chainId: true,
        chainSymbol: true,
        chainName: true,
        address: true,
        balance: true,
      },
    });

    const today = startOfUtcDay(new Date());
    const from = new Date(today);
    from.setUTCDate(from.getUTCDate() - (HISTORY_DAYS - 1));

    const snapshots = await this.prisma.tokenBalanceSnapshot.findMany({
      where: { day: { gte: from, lte: today } },
      orderBy: { day: 'asc' },
      select: {
        day: true,
        chainId: true,
        chainSymbol: true,
        chainName: true,
        address: true,
        balance: true,
      },
    });

    const current = sumBalances(balances);
    const daily = buildDailySeries(snapshots, balances, today);

    return {
      total: current.total,
      holdings: current.holdings,
      daily,
    };
  }
}

export function buildDailySeries(snapshots: SnapshotRow[], current: BalanceRow[], today: Date): TokenAmountPoint[] {
  const byDay = new Map<string, Map<string, BalanceRow>>();
  for (const snapshot of snapshots) {
    const key = formatDay(snapshot.day);
    const holdings = byDay.get(key) ?? new Map<string, BalanceRow>();
    holdings.set(holdingKey(snapshot), snapshot);
    byDay.set(key, holdings);
  }

  const todayKey = formatDay(today);
  const todayHoldings = byDay.get(todayKey) ?? new Map<string, BalanceRow>();
  for (const row of current) {
    todayHoldings.set(holdingKey(row), row);
  }
  byDay.set(todayKey, todayHoldings);

  const points: TokenAmountPoint[] = [];
  let carried = new Map<string, BalanceRow>();
  for (let offset = HISTORY_DAYS - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setUTCDate(today.getUTCDate() - offset);
    const key = formatDay(day);
    const recorded = byDay.get(key);
    if (recorded) {
      carried = new Map(carried);
      for (const [id, row] of recorded) carried.set(id, row);
    }
    points.push(toPoint(key, carried));
  }
  return points;
}

function toPoint(date: string, holdings: Map<string, BalanceRow>): TokenAmountPoint {
  const bySymbol: Record<string, number> = {};
  let total = 0;
  for (const row of holdings.values()) {
    const amount = parseBalance(row.balance);
    if (!amount) continue;
    const symbol = row.chainSymbol || 'Unknown';
    bySymbol[symbol] = (bySymbol[symbol] ?? 0) + amount;
    total += amount;
  }
  return { date, total: roundAmount(total), bySymbol: roundMap(bySymbol) };
}

export function sumBalances(rows: BalanceRow[]) {
  const bySymbol = new Map<string, { symbol: string; name: string; amount: number }>();
  let total = 0;
  for (const row of rows) {
    const amount = parseBalance(row.balance);
    if (!amount) continue;
    total += amount;
    const symbol = row.chainSymbol || 'Unknown';
    const existing = bySymbol.get(symbol) ?? { symbol, name: row.chainName || symbol, amount: 0 };
    existing.amount += amount;
    bySymbol.set(symbol, existing);
  }

  const holdings = [...bySymbol.values()]
    .map((item) => ({ ...item, amount: roundAmount(item.amount) }))
    .sort((a, b) => b.amount - a.amount);

  return { total: roundAmount(total), holdings };
}

function holdingKey(row: { chainId: string; address: string }) {
  return `${row.chainId}:${row.address}`;
}

function parseBalance(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function roundAmount(value: number) {
  return Number(value.toFixed(8));
}

function roundMap(values: Record<string, number>) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, roundAmount(value)]));
}

function startOfUtcDay(date: Date) {
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);
  return day;
}

function formatDay(date: Date) {
  return date.toISOString().slice(0, 10);
}
