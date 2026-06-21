import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Work } from './works.entity';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
  ) {}

  async findAll(): Promise<Work[]> {
    return this.workRepository.find({
      relations: { badges: true },
      order: { createdAt: 'DESC' },
    });
  }
}
