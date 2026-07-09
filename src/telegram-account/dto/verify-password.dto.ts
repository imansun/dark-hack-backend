import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyPasswordDto {
  @ApiProperty({ description: 'Phone number with country code' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: '2FA password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
