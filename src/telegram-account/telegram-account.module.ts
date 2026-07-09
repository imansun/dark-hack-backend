import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramAccount } from './telegram-account.entity';
import { TelegramAccountService } from './telegram-account.service';
import { TelegramAccountController } from './telegram-account.controller';
import { TelegramConfig } from '../telegram/telegram-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TelegramAccount, TelegramConfig])],
  providers: [TelegramAccountService],
  controllers: [TelegramAccountController],
})
export class TelegramAccountModule {}
