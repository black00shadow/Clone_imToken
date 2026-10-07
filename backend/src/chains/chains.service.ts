import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CreateChainDto, UpdateChainDto } from './dto/chain.dto';

@Injectable()
export class ChainsService {
  constructor(private prisma: PrismaService) {}

  findAll(includeDisabled = true) {
    return this.prisma.chain.findMany({
      where: includeDisabled ? undefined : { isEnabled: true },
      orderBy: { sortOrder: 'asc' },
      include: { tokens: true },
    });
  }

  findOne(id: string) {
    return this.prisma.chain.findUnique({ where: { id }, include: { tokens: true } });
  }

  create(dto: CreateChainDto) {
    return this.prisma.chain.create({ data: dto });
  }

  async update(id: string, dto: UpdateChainDto) {
    await this.ensureExists(id);
    return this.prisma.chain.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.chain.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const chain = await this.prisma.chain.findUnique({ where: { id } });
    if (!chain) throw new NotFoundException('Chain not found');
  }
}
