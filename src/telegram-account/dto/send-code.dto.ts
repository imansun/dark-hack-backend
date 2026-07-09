import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class SendCodeDto {
  @ApiProperty({ description: 'Phone number with country code' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'Telegram App API ID', required: false })
  @IsString()
  @IsOptional()
  apiId?: string;

  @ApiProperty({ description: 'Telegram App API Hash', required: false })
  @IsString()
  @IsOptional()
  apiHash?: string;

  @ApiProperty({ description: 'Use test server', default: false })
  @IsBoolean()
  @IsOptional()
  testMode?: boolean;

  @ApiProperty({ description: 'DC ID', default: 2 })
  @IsOptional()
  dcId?: number;
}
