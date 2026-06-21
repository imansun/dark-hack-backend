import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('profiles')
export class Profile {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Full name (Persian)', maxLength: 100 })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    description: 'Full name (English)',
    maxLength: 100,
    nullable: true,
  })
  @Column({ length: 100, nullable: true })
  name_en: string;

  @ApiProperty({
    description: 'Full name (Arabic)',
    maxLength: 100,
    nullable: true,
  })
  @Column({ length: 100, nullable: true })
  name_ar: string;

  @ApiProperty({ description: 'Job title (Persian)', maxLength: 100 })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    description: 'Job title (English)',
    maxLength: 100,
    nullable: true,
  })
  @Column({ length: 100, nullable: true })
  title_en: string;

  @ApiProperty({
    description: 'Job title (Arabic)',
    maxLength: 100,
    nullable: true,
  })
  @Column({ length: 100, nullable: true })
  title_ar: string;

  @ApiProperty({
    description: 'Subtitle / greeting text (Persian)',
    maxLength: 200,
    nullable: true,
  })
  @Column({ length: 200, nullable: true })
  subtitle: string;

  @ApiProperty({
    description: 'Subtitle / greeting text (English)',
    maxLength: 200,
    nullable: true,
  })
  @Column({ length: 200, nullable: true })
  subtitle_en: string;

  @ApiProperty({
    description: 'Subtitle / greeting text (Arabic)',
    maxLength: 200,
    nullable: true,
  })
  @Column({ length: 200, nullable: true })
  subtitle_ar: string;

  @ApiProperty({
    description: 'Short bio / description (Persian)',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    description: 'Short bio / description (English)',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description_en: string;

  @ApiProperty({
    description: 'Short bio / description (Arabic)',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description_ar: string;

  @ApiProperty({
    description: 'Resume file URL',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  resumeUrl: string;

  @ApiProperty({
    description: 'Avatar image URL',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  avatarUrl: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
