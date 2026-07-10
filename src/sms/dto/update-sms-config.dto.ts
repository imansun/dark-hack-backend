import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateSmsConfigDto {
  @ApiPropertyOptional({ description: 'SMS panel access hash (کد دسترسی)' })
  @IsOptional()
  @IsString()
  accessHash?: string;

  @ApiPropertyOptional({ description: 'Sender phone number (شماره فرستنده)' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Pattern ID (شناسه الگو)' })
  @IsOptional()
  @IsString()
  patternId?: string;

  @ApiPropertyOptional({ description: 'Panel username for Basic Auth' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Panel password for Basic Auth' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: 'SMS panel base URL' })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ description: 'Support phone number' })
  @IsOptional()
  @IsString()
  supportPhone?: string;

  @ApiPropertyOptional({ description: 'Documentation version' })
  @IsOptional()
  @IsString()
  docVersion?: string;

  @ApiPropertyOptional({ description: 'Notification destination number' })
  @IsOptional()
  @IsString()
  destNumber?: string;

  @ApiPropertyOptional({ description: 'Activate this config' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
