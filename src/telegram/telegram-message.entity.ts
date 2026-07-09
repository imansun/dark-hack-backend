import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('telegram_messages')
export class TelegramMessage {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Chat ID (recipient)' })
  @Column({ length: 100 })
  chatId: string;

  @ApiProperty({ description: 'Chat username or title', nullable: true })
  @Column({ length: 200, nullable: true })
  chatUsername: string;

  @ApiProperty({ description: 'Sent message text' })
  @Column({ type: 'text' })
  messageText: string;

  @ApiProperty({ description: 'Response from Telegram API', nullable: true })
  @Column({ type: 'text', nullable: true })
  responseText: string;

  @ApiProperty({ description: 'Delivery status', default: 'sent' })
  @Column({ length: 20, default: 'sent' })
  status: string;

  @ApiProperty({ description: 'When the message was sent' })
  @CreateDateColumn()
  sentAt: Date;
}
