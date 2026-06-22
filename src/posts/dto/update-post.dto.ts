import { PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;
}
