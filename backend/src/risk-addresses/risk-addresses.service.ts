import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.module';
import { CreateRiskAddressDto, UpdateRiskAddressDto } from './dto/risk-address.dto';

@Injectable()
export class RiskAddressesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.riskAddress.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.riskAddress.findUnique({ where: { id } });
  }

  create(dto: CreateRiskAddressDto) {
    return this.prisma.riskAddress.create({ data: dto });
  }

  async update(id: string, dto: UpdateRiskAddressDto) {
    await this.ensureExists(id);
    return this.prisma.riskAddress.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.riskAddress.delete({ where: { id } });
  }

  checkAddress(address: string, chain?: string) {
    return this.prisma.riskAddress.findFirst({
      where: {
        address: { equals: address, mode: 'insensitive' },
        isEnabled: true,
        ...(chain ? { chain } : {}),
      },
    });
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.riskAddress.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Risk address not found');
  }
}
