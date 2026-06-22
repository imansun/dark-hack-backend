import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Post title (Persian)', maxLength: 200, example: 'معماری نرم‌افزار مدرن' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Post title (English)', maxLength: 200, required: false, example: 'Modern Software Architecture' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title_en?: string;

  @ApiProperty({ description: 'Post title (Arabic)', maxLength: 200, required: false, example: 'هندسة البرمجيات الحديثة' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title_ar?: string;

  @ApiProperty({ description: 'Post content (Persian)', example: 'محتوای کامل مقاله...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Post content (English)', required: false })
  @IsString()
  @IsOptional()
  content_en?: string;

  @ApiProperty({ description: 'Post content (Arabic)', required: false })
  @IsString()
  @IsOptional()
  content_ar?: string;

  @ApiProperty({ description: 'Short excerpt (Persian)', maxLength: 500, required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ description: 'Short excerpt (English)', maxLength: 500, required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt_en?: string;

  @ApiProperty({ description: 'Short excerpt (Arabic)', maxLength: 500, required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  excerpt_ar?: string;

  @ApiProperty({ description: 'Cover image URL', maxLength: 500, required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({ description: 'URL-friendly slug', maxLength: 200, example: 'modern-software-architecture' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  slug: string;

  @ApiProperty({ description: 'Comma-separated tags', required: false, example: 'AI, Security, Architecture' })
  @IsString()
  @IsOptional()
  tags?: string;

  @ApiProperty({ description: 'Category ID', required: false })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ description: 'Whether the post is published', default: true, required: false })
  @IsOptional()
  published?: boolean;
}
