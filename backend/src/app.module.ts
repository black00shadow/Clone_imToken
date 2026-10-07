import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ChainsModule } from './chains/chains.module';
import { TokensModule } from './tokens/tokens.module';
import { DappsModule } from './dapps/dapps.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { BannersModule } from './banners/banners.module';
import { RemoteConfigModule } from './remote-config/remote-config.module';
import { RiskAddressesModule } from './risk-addresses/risk-addresses.module';
import { AppVersionsModule } from './app-versions/app-versions.module';
import { PublicModule } from './public/public.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WalletsModule } from './wallets/wallets.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ChainsModule,
    TokensModule,
    DappsModule,
    AnnouncementsModule,
    BannersModule,
    RemoteConfigModule,
    RiskAddressesModule,
    AppVersionsModule,
    PublicModule,
    DashboardModule,
    WalletsModule,
  ],
})
export class AppModule {}
