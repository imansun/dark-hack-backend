import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Chat ID or username',
    example: '@username or 123456789',
  })
  @IsString()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({
    description: 'Message text to send',
    example: 'Hello from bot!',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
