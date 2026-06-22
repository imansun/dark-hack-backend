import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WorkBadge } from './work-badge.entity';

@Entity('works')
export class Work {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Project title (Persian)', maxLength: 200 })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({
    description: 'Project title (English)',
    maxLength: 200,
    nullable: true,
  })
  @Column({ length: 200, nullable: true })
  title_en: string;

  @ApiProperty({
    description: 'Project title (Arabic)',
    maxLength: 200,
    nullable: true,
  })
  @Column({ length: 200, nullable: true })
  title_ar: string;

  @ApiProperty({ description: 'Project description (Persian)', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Project description (English)', nullable: true })
  @Column({ type: 'text', nullable: true })
  description_en: string;

  @ApiProperty({ description: 'Project description (Arabic)', nullable: true })
  @Column({ type: 'text', nullable: true })
  description_ar: string;

  @ApiProperty({
    description: 'Project screenshot URL',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  imageUrl: string;

  @ApiProperty({
    description: 'Live project URL',
    maxLength: 500,
    nullable: true,
  })
  @Column({ length: 500, nullable: true })
  projectUrl: string;

  @ApiProperty({ description: 'CSS object-fit value', default: 'cover', nullable: true })
  @Column({ length: 20, nullable: true, default: 'cover' })
  imageFit: string;

  @ApiProperty({ description: 'CSS object-position value', default: 'center', nullable: true })
  @Column({ length: 50, nullable: true, default: 'center' })
  imagePosition: string;

  @ApiProperty({ description: 'Technology badges', type: () => [WorkBadge] })
  @OneToMany(() => WorkBadge, (badge) => badge.work, { cascade: true })
  badges: WorkBadge[];

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
