import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SmsService } from './sms.service';
import { SmsConfig } from './sms-config.entity';
import { UpdateSmsConfigDto } from './dto/update-sms-config.dto';

@ApiTags('SMS')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Get('config')
  @Roles('admin')
  @ApiOperation({ summary: 'Get SMS panel configuration' })
  getConfig(): Promise<SmsConfig> {
    return this.smsService.getConfig();
  }

  @Put('config')
  @Roles('admin')
  @ApiOperation({ summary: 'Update SMS panel configuration' })
  updateConfig(@Body() dto: UpdateSmsConfigDto): Promise<SmsConfig> {
    return this.smsService.updateConfig(dto);
  }
}
