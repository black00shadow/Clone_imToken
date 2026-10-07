import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CreateDappDto, UpdateDappDto } from './dto/dapp.dto';

@Injectable()
export class DappsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.dapp.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.dapp.findUnique({ where: { id } });
  }

  create(dto: CreateDappDto) {
    return this.prisma.dapp.create({ data: dto });
  }

  async update(id: string, dto: UpdateDappDto) {
    await this.ensureExists(id);
    return this.prisma.dapp.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.dapp.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.dapp.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('DApp not found');
  }
}
