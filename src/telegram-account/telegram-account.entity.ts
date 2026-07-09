import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('telegram_account')
export class TelegramAccount {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Phone number' })
  @Column({ length: 20, unique: true })
  phoneNumber: string;

  @ApiProperty({ description: 'Encrypted session string' })
  @Column({ type: 'text', nullable: true })
  sessionString: string;

  @ApiProperty({ description: 'Telegram App API ID' })
  @Column({ length: 20 })
  apiId: string;

  @ApiProperty({ description: 'Telegram App API Hash' })
  @Column({ length: 50 })
  apiHash: string;

  @ApiProperty({ description: 'Whether the account is authorized' })
  @Column({ default: false })
  isAuthorized: boolean;

  @ApiProperty({ description: 'User first name from Telegram', nullable: true })
  @Column({ length: 100, nullable: true })
  firstName: string;

  @ApiProperty({ description: 'User last name from Telegram', nullable: true })
  @Column({ length: 100, nullable: true })
  lastName: string;

  @ApiProperty({ description: 'Telegram username', nullable: true })
  @Column({ length: 100, nullable: true })
  username: string;

  @ApiProperty({ description: 'User ID from Telegram', nullable: true })
  @Column({ length: 50, nullable: true })
  telegramId: string;

  @ApiProperty({ description: 'Phone code hash for verification' })
  @Column({ length: 100, nullable: true })
  phoneCodeHash: string;

  @ApiProperty({ description: 'Whether 2FA password is needed' })
  @Column({ default: false })
  hasPassword: boolean;

  @ApiProperty({ description: 'DC ID for connection', default: 2 })
  @Column({ default: 2 })
  dcId: number;

  @ApiProperty({ description: 'Test mode or production', default: false })
  @Column({ default: false })
  testMode: boolean;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Account last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
