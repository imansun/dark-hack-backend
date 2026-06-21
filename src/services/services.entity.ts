import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('services')
export class Service {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Service title (Persian)', maxLength: 100 })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    description: 'Service title (English)',
    maxLength: 100,
    nullable: true,
  })
  @Column({ length: 100, nullable: true })
  title_en: string;

  @ApiProperty({
    description: 'Service title (Arabic)',
    maxLength: 100,
    nullable: true,
  })
  @Column({ length: 100, nullable: true })
  title_ar: string;

  @ApiProperty({ description: 'Service description (Persian)', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Service description (English)', nullable: true })
  @Column({ type: 'text', nullable: true })
  description_en: string;

  @ApiProperty({ description: 'Service description (Arabic)', nullable: true })
  @Column({ type: 'text', nullable: true })
  description_ar: string;

  @ApiProperty({
    description: 'Illustration image URL',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  imageUrl: string;

  @ApiProperty({ description: 'Display order (ascending)' })
  @Column({ default: 0 })
  order: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
