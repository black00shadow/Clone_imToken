import { Module } from '@nestjs/common';
import { ChainsModule } from '../chains/chains.module';
import { TokensModule } from '../tokens/tokens.module';
import { DappsModule } from '../dapps/dapps.module';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { BannersModule } from '../banners/banners.module';
import { RemoteConfigModule } from '../remote-config/remote-config.module';
import { RiskAddressesModule } from '../risk-addresses/risk-addresses.module';
import { AppVersionsModule } from '../app-versions/app-versions.module';
import { PublicController } from './public.controller';

@Module({
  imports: [
    ChainsModule,
    TokensModule,
    DappsModule,
    AnnouncementsModule,
    BannersModule,
    RemoteConfigModule,
    RiskAddressesModule,
    AppVersionsModule,
  ],
  controllers: [PublicController],
})
export class PublicModule {}
