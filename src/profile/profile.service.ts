import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';

function mapLang(profile: Profile, lang?: string): Profile {
  if (!lang || lang === 'fa') return profile;
  const suffix = `_${lang}` as 'en' | 'ar';
  return {
    ...profile,
    name: (profile as any)[`name${suffix}`] || profile.name,
    title: (profile as any)[`title${suffix}`] || profile.title,
    subtitle: (profile as any)[`subtitle${suffix}`] || profile.subtitle,
    description:
      (profile as any)[`description${suffix}`] || profile.description,
  };
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async findOne(lang?: string): Promise<Profile> {
    const profiles = await this.profileRepository.find({ take: 1 });
    if (profiles.length === 0) {
      throw new NotFoundException('Profile not found');
    }
    return mapLang(profiles[0], lang);
  }

  async update(dto: Partial<Profile>): Promise<Profile> {
    const profiles = await this.profileRepository.find({ take: 1 });
    if (profiles.length === 0) {
      throw new NotFoundException('Profile not found');
    }
    const profile = profiles[0];
    Object.assign(profile, dto);
    return this.profileRepository.save(profile);
  }
}
