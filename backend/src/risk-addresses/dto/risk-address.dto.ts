import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateRiskAddressDto {
  @IsString()
  address: string;

  @IsString()
  chain: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateRiskAddressDto extends PartialType(CreateRiskAddressDto) {}
