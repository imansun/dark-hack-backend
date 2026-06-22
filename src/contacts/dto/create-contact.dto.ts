import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'Your name',
    maxLength: 100,
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Your message',
    example: 'Hi, I would love to work with you!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'Cloudflare Turnstile token' })
  @IsString()
  @IsNotEmpty()
  turnstileToken: string;
}
