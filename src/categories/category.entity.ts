import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../posts/post.entity';

@Entity('categories')
export class Category {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Category name (Persian)', maxLength: 100 })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: 'Category name (English)', maxLength: 100, nullable: true })
  @Column({ length: 100, nullable: true })
  name_en: string;

  @ApiProperty({ description: 'Category name (Arabic)', maxLength: 100, nullable: true })
  @Column({ length: 100, nullable: true })
  name_ar: string;

  @ApiProperty({ description: 'URL-friendly slug', maxLength: 100, unique: true })
  @Column({ length: 100, unique: true })
  slug: string;

  @OneToMany(() => Post, (p) => p.category)
  posts: Post[];
}
