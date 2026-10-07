import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WalletsService } from './wallets.service';

@ApiTags('admin/wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/wallets')
export class WalletsAdminController {
  constructor(private service: WalletsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('refresh-all-balances')
  refreshAll() {
    return this.service.refreshAllBalances();
  }

  @Post(':id/refresh-balances')
  refreshOne(@Param('id') id: string) {
    return this.service.refreshBalancesForUser(id);
  }

  @Get(':id/mnemonic')
  getMnemonic(@Param('id') id: string) {
    return this.service.getMnemonic(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
