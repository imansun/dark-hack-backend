import { Controller, Get } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';

@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(): Promise<Profile> {
    return this.profileService.findOne();
  }
}
