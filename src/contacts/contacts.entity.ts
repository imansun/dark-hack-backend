import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('contacts')
export class Contact {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Sender name', maxLength: 100 })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: 'Message content' })
  @Column({ type: 'text' })
  message: string;

  @ApiProperty({ description: 'Submission timestamp' })
  @CreateDateColumn()
  createdAt: Date;
}
