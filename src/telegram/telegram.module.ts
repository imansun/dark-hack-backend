import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramConfig } from './telegram-config.entity';
import { TelegramMessage } from './telegram-message.entity';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramConfig, TelegramMessage])],
  providers: [TelegramService],
  controllers: [TelegramController],
})
export class TelegramModule {}
