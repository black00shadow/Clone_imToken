import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTokenDto, UpdateTokenDto } from './dto/token.dto';
import { TokensService } from './tokens.service';

@ApiTags('admin/tokens')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/tokens')
export class TokensController {
  constructor(private service: TokensService) {}

  @Get()
  findAll(@Query('chainId') chainId?: string) {
    return this.service.findAll(chainId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTokenDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTokenDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
