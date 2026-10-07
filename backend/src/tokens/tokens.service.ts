import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CreateTokenDto, UpdateTokenDto } from './dto/token.dto';

@Injectable()
export class TokensService {
  constructor(private prisma: PrismaService) {}

  findAll(chainId?: string) {
    return this.prisma.token.findMany({
      where: {
        ...(chainId ? { chainId } : {}),
      },
      orderBy: { sortOrder: 'asc' },
      include: { chain: true },
    });
  }

  findOne(id: string) {
    return this.prisma.token.findUnique({ where: { id }, include: { chain: true } });
  }

  create(dto: CreateTokenDto) {
    return this.prisma.token.create({ data: dto, include: { chain: true } });
  }

  async update(id: string, dto: UpdateTokenDto) {
    await this.ensureExists(id);
    return this.prisma.token.update({ where: { id }, data: dto, include: { chain: true } });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.token.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const token = await this.prisma.token.findUnique({ where: { id } });
    if (!token) throw new NotFoundException('Token not found');
  }
}
