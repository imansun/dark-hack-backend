import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sms_config')
export class SmsConfig {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'SMS panel access hash (کد دسترسی)' })
  @Column({ length: 500 })
  accessHash: string;

  @ApiProperty({ description: 'Sender phone number (شماره فرستنده)' })
  @Column({ length: 50 })
  phoneNumber: string;

  @ApiProperty({ description: 'Pattern ID for SMS template (شناسه الگو)' })
  @Column({ length: 500 })
  patternId: string;

  @ApiProperty({ description: 'Panel username for Basic Auth', nullable: true })
  @Column({ length: 200, nullable: true })
  username: string;

  @ApiProperty({ description: 'Panel password for Basic Auth', nullable: true })
  @Column({ length: 500, nullable: true })
  password: string;

  @ApiProperty({ description: 'SMS panel base URL', default: 'https://smspanel.trez.ir' })
  @Column({ length: 500, default: 'https://smspanel.trez.ir' })
  baseUrl: string;

  @ApiProperty({ description: 'Support phone number', nullable: true })
  @Column({ length: 50, nullable: true })
  supportPhone: string;

  @ApiProperty({ description: 'API documentation version', nullable: true })
  @Column({ length: 20, nullable: true })
  docVersion: string;

  @ApiProperty({ description: 'Notification destination number for contact form', nullable: true })
  @Column({ length: 50, nullable: true })
  destNumber: string;

  @ApiProperty({ description: 'Whether this config is active', default: false })
  @Column({ default: false })
  isActive: boolean;

  @ApiProperty({ description: 'Config creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Config last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
