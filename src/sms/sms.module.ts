import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { SmsConfig } from './sms-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmsConfig])],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
