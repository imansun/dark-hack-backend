import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetWebhookDto {
  @ApiProperty({
    description: 'Webhook URL',
    example: 'https://example.com/webhook',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
