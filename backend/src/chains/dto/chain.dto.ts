import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateChainDto {
  @IsString()
  name: string;

  @IsString()
  symbol: string;

  @IsOptional()
  @IsInt()
  chainId?: number;

  @IsString()
  rpcUrl: string;

  @IsOptional()
  @IsString()
  explorerUrl?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsString()
  family?: string;

  @IsOptional()
  @IsInt()
  coinType?: number;

  @IsOptional()
  @IsString()
  bech32Prefix?: string;

  @IsOptional()
  @IsBoolean()
  isEvm?: boolean;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateChainDto extends PartialType(CreateChainDto) {}
