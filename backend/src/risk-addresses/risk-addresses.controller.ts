import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRiskAddressDto, UpdateRiskAddressDto } from './dto/risk-address.dto';
import { RiskAddressesService } from './risk-addresses.service';

@ApiTags('admin/risk-addresses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/risk-addresses')
export class RiskAddressesController {
  constructor(private service: RiskAddressesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRiskAddressDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRiskAddressDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
