import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type UserRole = 'admin';

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Username', maxLength: 50 })
  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 255, select: false })
  password: string;

  @ApiProperty({ description: 'User role', enum: ['admin'] })
  @Column({ length: 20, default: 'admin' })
  role: UserRole;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
