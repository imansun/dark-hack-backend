import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findOne(): Promise<Profile> {
    const profiles = await this.profileRepository.find({ take: 1 });
    if (profiles.length === 0) {
      throw new NotFoundException('Profile not found');
    }
    return profiles[0];
  }
}
