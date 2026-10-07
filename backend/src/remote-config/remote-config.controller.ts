import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRemoteConfigDto, UpdateRemoteConfigDto } from './dto/remote-config.dto';
import { RemoteConfigService } from './remote-config.service';

@ApiTags('admin/remote-config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/remote-config')
export class RemoteConfigController {
  constructor(private service: RemoteConfigService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRemoteConfigDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRemoteConfigDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
