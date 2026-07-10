import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './contacts.entity';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contact]), SmsModule],
  providers: [ContactsService],
  controllers: [ContactsController],
})
export class ContactsModule {}
