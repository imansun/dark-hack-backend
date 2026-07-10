import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contacts.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly smsService: SmsService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create(createContactDto);
    const saved = await this.contactRepository.save(contact);
    await this.smsService.sendContactNotification(
      saved.name,
      saved.message,
    );
    return saved;
  }

  async findAll(): Promise<Contact[]> {
    return this.contactRepository.find({ order: { createdAt: 'DESC' } });
  }

  async remove(id: number): Promise<void> {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');
    await this.contactRepository.remove(contact);
  }
}
