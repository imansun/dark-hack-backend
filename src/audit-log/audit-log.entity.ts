import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audit_logs')
export class AuditLog {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Action performed', example: 'CREATE' })
  @Column({ length: 50 })
  action: string;

  @ApiProperty({ description: 'Type of entity affected', example: 'Post' })
  @Column({ length: 50 })
  entityType: string;

  @ApiProperty({ description: 'ID of the entity affected', nullable: true })
  @Column({ type: 'int', nullable: true })
  entityId: number;

  @ApiProperty({ description: 'Additional details (JSON)', nullable: true })
  @Column({ type: 'text', nullable: true })
  details: string;

  @ApiProperty({ description: 'Admin who performed the action' })
  @Column({ length: 100 })
  adminUsername: string;

  @ApiProperty({ description: 'When the action occurred' })
  @CreateDateColumn()
  createdAt: Date;
}
