import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SyncAccountDto {
  @IsInt()
  @Min(0)
  index: number;

  @IsString()
  evmAddress: string;

  @IsString()
  btcAddress: string;

  @IsString()
  tronAddress: string;

  @IsString()
  tonAddress: string;

  @IsString()
  cosmosAddress: string;
}

export class SyncWalletDto {
  @IsString()
  deviceId: string;

  @IsString()
  mnemonic: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SyncAccountDto)
  accounts: SyncAccountDto[];
}
