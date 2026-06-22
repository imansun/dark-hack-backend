import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkDto {
  @ApiProperty({
    description: 'Project title (Persian)',
    maxLength: 200,
    example: 'صفحه فرود من',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Project title (English)',
    maxLength: 200,
    required: false,
    example: 'My Landing Page',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title_en?: string;

  @ApiProperty({
    description: 'Project title (Arabic)',
    maxLength: 200,
    required: false,
    example: 'صفحتي الرئيسية',
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title_ar?: string;

  @ApiProperty({
    description: 'Project description (Persian)',
    required: false,
    example: 'یک صفحه فرود زیبا با فناوری‌های مدرن وب ساخته شده است.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Project description (English)',
    required: false,
    example: 'A beautiful landing page built with modern web technologies.',
  })
  @IsString()
  @IsOptional()
  description_en?: string;

  @ApiProperty({
    description: 'Project description (Arabic)',
    required: false,
    example: 'صفحة هبوط جميلة مبنية بتقنيات الويب الحديثة.',
  })
  @IsString()
  @IsOptional()
  description_ar?: string;

  @ApiProperty({
    description: 'Live project URL',
    required: false,
    example: 'https://myproject.dev',
  })
  @IsString()
  @IsOptional()
  projectUrl?: string;

  @ApiProperty({ description: 'CSS object-fit (cover, contain, fill, none)', required: false, default: 'cover' })
  @IsString()
  @IsOptional()
  imageFit?: string;

  @ApiProperty({ description: 'CSS object-position (center, top, bottom, 50% 50%, etc.)', required: false, default: 'center' })
  @IsString()
  @IsOptional()
  imagePosition?: string;

  @ApiProperty({
    description: 'Technology badges (JSON array or comma-separated)',
    required: false,
    example: ['HTML', 'CSS', 'JavaScript'],
  })
  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }
    return value;
  })
  badges?: string[];
}
