import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('article_sources')
@Index(['originalUrl'], { unique: true })
export class ArticleSource {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Source RSS feed URL' })
  @Column({ length: 500 })
  sourceUrl: string;

  @ApiProperty({ description: 'Source website name' })
  @Column({ length: 200 })
  sourceName: string;

  @ApiProperty({ description: 'Original article URL' })
  @Column({ length: 1000 })
  originalUrl: string;

  @ApiProperty({ description: 'Original article title' })
  @Column({ length: 500 })
  originalTitle: string;

  @ApiProperty({ description: 'Original article content (first 2000 chars)' })
  @Column({ type: 'text', nullable: true })
  originalContent: string;

  @ApiProperty({ description: 'Generated post ID', nullable: true })
  @Column({ nullable: true })
  postId: number;

  @ApiProperty({ description: 'Processing status' })
  @Column({ default: 'pending' })
  status: string;

  @ApiProperty({ description: 'Error message if failed', nullable: true })
  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
}
