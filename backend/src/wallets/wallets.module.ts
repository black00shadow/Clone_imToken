import { Module } from '@nestjs/common';
import { BalanceFetcherService } from '../balance/balance-fetcher.service';
import { WalletsAdminController } from './wallets.controller';
import { WalletsPublicController } from './wallets-public.controller';
import { WalletsService } from './wallets.service';

@Module({
  controllers: [WalletsAdminController, WalletsPublicController],
  providers: [WalletsService, BalanceFetcherService],
  exports: [WalletsService],
})
export class WalletsModule {}
