import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CreateAppVersionDto, UpdateAppVersionDto } from './dto/app-version.dto';

@Injectable()
export class AppVersionsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.appVersion.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.appVersion.findUnique({ where: { id } });
  }

  create(dto: CreateAppVersionDto) {
    return this.prisma.appVersion.create({ data: dto });
  }

  async update(id: string, dto: UpdateAppVersionDto) {
    await this.ensureExists(id);
    return this.prisma.appVersion.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.appVersion.delete({ where: { id } });
  }

  getLatest(platform: string) {
    return this.prisma.appVersion.findFirst({
      where: { platform, isEnabled: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.appVersion.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('App version not found');
  }
}
