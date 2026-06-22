import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscriber } from './subscriber.entity';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectRepository(Subscriber)
    private readonly repo: Repository<Subscriber>,
  ) {}

  async subscribe(email: string): Promise<Subscriber> {
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      if (!existing.active) {
        existing.active = true;
        return this.repo.save(existing);
      }
      throw new ConflictException('Email already subscribed');
    }
    const sub = this.repo.create({ email, active: true });
    return this.repo.save(sub);
  }

  async findAll(): Promise<Subscriber[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async unsubscribe(email: string): Promise<void> {
    const sub = await this.repo.findOne({ where: { email } });
    if (sub) {
      sub.active = false;
      await this.repo.save(sub);
    }
  }
}
