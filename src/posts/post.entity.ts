import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../categories/category.entity';

@Entity('posts')
export class Post {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Post title (Persian)', maxLength: 200 })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({
    description: 'Post title (English)',
    maxLength: 200,
    nullable: true,
  })
  @Column({ length: 200, nullable: true })
  title_en: string;

  @ApiProperty({
    description: 'Post title (Arabic)',
    maxLength: 200,
    nullable: true,
  })
  @Column({ length: 200, nullable: true })
  title_ar: string;

  @ApiProperty({ description: 'Post content (Persian)' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: 'Post content (English)', nullable: true })
  @Column({ type: 'text', nullable: true })
  content_en: string;

  @ApiProperty({ description: 'Post content (Arabic)', nullable: true })
  @Column({ type: 'text', nullable: true })
  content_ar: string;

  @ApiProperty({
    description: 'Short excerpt (Persian)',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  excerpt: string;

  @ApiProperty({
    description: 'Short excerpt (English)',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  excerpt_en: string;

  @ApiProperty({
    description: 'Short excerpt (Arabic)',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  excerpt_ar: string;

  @ApiProperty({
    description: 'Cover image URL',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'URL-friendly slug', maxLength: 200 })
  @Column({ length: 200, unique: true })
  slug: string;

  @ApiProperty({ description: 'Comma-separated tags', nullable: true })
  @Column({ nullable: true })
  tags: string;

  @ApiProperty({ description: 'Whether the post is published', default: true })
  @Column({ default: true })
  published: boolean;

  @ApiProperty({ description: 'View count', default: 0 })
  @Column({ default: 0 })
  views: number;

  @ApiProperty({ description: 'Category ID', nullable: true })
  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (c) => c.posts, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
