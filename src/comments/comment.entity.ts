import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../posts/post.entity';

@Entity('comments')
export class Comment {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Commenter name', maxLength: 100 })
  @Column({ length: 100 })
  author: string;

  @ApiProperty({ description: 'Comment content' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: 'Whether approved', default: false })
  @Column({ default: false })
  approved: boolean;

  @ApiProperty({ description: 'Post ID' })
  @Column()
  postId: number;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;
}
