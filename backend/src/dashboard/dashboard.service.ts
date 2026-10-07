import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [chains, tokens, dapps, announcements, banners, riskAddresses, configs, versions, walletUsers] =
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
    };
  }
}
