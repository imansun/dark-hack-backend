import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('telegram_config')
export class TelegramConfig {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  // --- Bot API config ---

  @ApiProperty({ description: 'Bot token from BotFather' })
  @Column({ length: 100 })
  botToken: string;

  @ApiProperty({ description: 'Bot username', nullable: true })
  @Column({ length: 100, nullable: true })
  botUsername: string;

  @ApiProperty({ description: 'Bot display name', nullable: true })
  @Column({ length: 200, nullable: true })
  botName: string;

  @ApiProperty({ description: 'Webhook URL', nullable: true })
  @Column({ length: 500, nullable: true })
  webhookUrl: string;

  // --- App configuration (from my.telegram.org) ---

  @ApiProperty({ description: 'Telegram App API ID' })
  @Column({ length: 20 })
  apiId: string;

  @ApiProperty({ description: 'Telegram App API Hash' })
  @Column({ length: 50 })
  apiHash: string;

  @ApiProperty({
    description: 'App title from my.telegram.org',
    nullable: true,
  })
  @Column({ length: 200, nullable: true })
  appTitle: string;

  @ApiProperty({ description: 'Short app name (5-32 chars)', nullable: true })
  @Column({ length: 32, nullable: true })
  shortName: string;

  @ApiProperty({ description: 'FCM credentials JSON', nullable: true })
  @Column({ type: 'text', nullable: true })
  fcmCredentials: string;

  // --- Test MTProto server ---

  @ApiProperty({ description: 'Test DC ID', nullable: true, default: 2 })
  @Column({ nullable: true })
  mtprotoTestDcId: number;

  @ApiProperty({ description: 'Test MTProto host', nullable: true })
  @Column({ length: 100, nullable: true })
  mtprotoTestHost: string;

  @ApiProperty({
    description: 'Test MTProto port',
    nullable: true,
    default: 443,
  })
  @Column({ nullable: true })
  mtprotoTestPort: number;

  @ApiProperty({ description: 'Test DC public key', nullable: true })
  @Column({ type: 'text', nullable: true })
  publicKeyTest: string;

  // --- Production MTProto server ---

  @ApiProperty({ description: 'Production DC ID', nullable: true, default: 2 })
  @Column({ nullable: true })
  mtprotoProdDcId: number;

  @ApiProperty({ description: 'Production MTProto host', nullable: true })
  @Column({ length: 100, nullable: true })
  mtprotoProdHost: string;

  @ApiProperty({
    description: 'Production MTProto port',
    nullable: true,
    default: 443,
  })
  @Column({ nullable: true })
  mtprotoProdPort: number;

  @ApiProperty({ description: 'Production DC public key', nullable: true })
  @Column({ type: 'text', nullable: true })
  publicKeyProd: string;

  // --- Flags ---

  @ApiProperty({
    description: 'Whether the bot configuration is active',
    default: false,
  })
  @Column({ default: false })
  isActive: boolean;

  @ApiProperty({ description: 'Config creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Config last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
