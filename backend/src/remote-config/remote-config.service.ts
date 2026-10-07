import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CreateRemoteConfigDto, UpdateRemoteConfigDto } from './dto/remote-config.dto';

@Injectable()
export class RemoteConfigService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.remoteConfig.findMany({ orderBy: { key: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.remoteConfig.findUnique({ where: { id } });
  }

  create(dto: CreateRemoteConfigDto) {
    return this.prisma.remoteConfig.create({ data: dto });
  }

  async update(id: string, dto: UpdateRemoteConfigDto) {
    await this.ensureExists(id);
    return this.prisma.remoteConfig.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.remoteConfig.delete({ where: { id } });
  }

  getPublicConfig() {
    return this.prisma.remoteConfig.findMany();
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.remoteConfig.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Config not found');
  }
}
