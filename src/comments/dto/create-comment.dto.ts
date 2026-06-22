import { IsString, IsNotEmpty, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Commenter name', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  author: string;

  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Post ID' })
  @IsNumber()
  @IsNotEmpty()
  postId: number;

  @ApiProperty({ description: 'Cloudflare Turnstile token' })
  @IsString()
  @IsNotEmpty()
  turnstileToken: string;
}
