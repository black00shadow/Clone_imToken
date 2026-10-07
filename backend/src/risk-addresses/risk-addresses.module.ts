import { Module } from '@nestjs/common';
import { RiskAddressesController } from './risk-addresses.controller';
import { RiskAddressesService } from './risk-addresses.service';

@Module({
  controllers: [RiskAddressesController],
  providers: [RiskAddressesService],
  exports: [RiskAddressesService],
})
export class RiskAddressesModule {}
