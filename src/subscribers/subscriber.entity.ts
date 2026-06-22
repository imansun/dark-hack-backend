import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('subscribers')
export class Subscriber {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Email address', maxLength: 200 })
  @Column({ length: 200, unique: true })
  email: string;

  @ApiProperty({ description: 'Whether subscription is active', default: true })
  @Column({ default: true })
  active: boolean;

  @ApiProperty({ description: 'Subscription timestamp' })
  @CreateDateColumn()
  createdAt: Date;
}
