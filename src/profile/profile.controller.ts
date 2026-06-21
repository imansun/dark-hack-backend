import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProfileService } from './profile.service';
import { Profile } from './profile.entity';

@ApiTags('Profile')
@Controller('api/profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({
    summary: 'Get profile',
    description: 'Returns the owner profile (first record).',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['fa', 'en', 'ar'],
    description: 'Filter fields by language',
  })
  @ApiResponse({ status: 200, description: 'Profile data', type: Profile })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Query('lang') lang?: string): Promise<Profile> {
    return this.profileService.findOne(lang);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update profile',
    description: 'Update the owner profile (admin only).',
  })
  @ApiResponse({ status: 200, description: 'Profile updated', type: Profile })
  async updateProfile(@Body() dto: Partial<Profile>): Promise<Profile> {
    return this.profileService.update(dto);
  }
}
