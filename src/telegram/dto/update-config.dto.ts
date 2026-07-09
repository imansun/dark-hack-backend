import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfigDto {
  // Bot API
  @ApiProperty({ description: 'Bot token from BotFather', required: false })
  @IsString()
  @IsOptional()
  botToken?: string;

  @ApiProperty({ description: 'Webhook URL', required: false })
  @IsString()
  @IsOptional()
  webhookUrl?: string;

  // App configuration
  @ApiProperty({ description: 'Telegram App API ID', required: false })
  @IsString()
  @IsOptional()
  apiId?: string;

  @ApiProperty({ description: 'Telegram App API Hash', required: false })
  @IsString()
  @IsOptional()
  apiHash?: string;

  @ApiProperty({
    description: 'App title from my.telegram.org',
    required: false,
  })
  @IsString()
  @IsOptional()
  appTitle?: string;

  @ApiProperty({ description: 'Short app name (5-32 chars)', required: false })
  @IsString()
  @IsOptional()
  shortName?: string;

  @ApiProperty({ description: 'FCM credentials JSON', required: false })
  @IsString()
  @IsOptional()
  fcmCredentials?: string;

  // Test MTProto server
  @ApiProperty({ description: 'Test DC ID', required: false })
  @IsNumber()
  @IsOptional()
  mtprotoTestDcId?: number;

  @ApiProperty({ description: 'Test MTProto host', required: false })
  @IsString()
  @IsOptional()
  mtprotoTestHost?: string;

  @ApiProperty({ description: 'Test MTProto port', required: false })
  @IsNumber()
  @IsOptional()
  mtprotoTestPort?: number;

  @ApiProperty({ description: 'Test DC public key', required: false })
  @IsString()
  @IsOptional()
  publicKeyTest?: string;

  // Production MTProto server
  @ApiProperty({ description: 'Production DC ID', required: false })
  @IsNumber()
  @IsOptional()
  mtprotoProdDcId?: number;

  @ApiProperty({ description: 'Production MTProto host', required: false })
  @IsString()
  @IsOptional()
  mtprotoProdHost?: string;

  @ApiProperty({ description: 'Production MTProto port', required: false })
  @IsNumber()
  @IsOptional()
  mtprotoProdPort?: number;

  @ApiProperty({ description: 'Production DC public key', required: false })
  @IsString()
  @IsOptional()
  publicKeyProd?: string;

  // Flags
  @ApiProperty({ description: 'Activate this configuration', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
