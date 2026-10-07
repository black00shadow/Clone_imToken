import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SyncWalletDto } from './dto/wallet.dto';
import { WalletsService } from './wallets.service';

@ApiTags('public')
@Controller('public/wallet')
export class WalletsPublicController {
  constructor(private service: WalletsService) {}

  @Post('sync')
  sync(@Body() dto: SyncWalletDto) {
    return this.service.syncFromApp(dto);
  }
}
