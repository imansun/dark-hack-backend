import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TelegramAccountService } from './telegram-account.service';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';

@ApiTags('Telegram Account')
@Controller('api/telegram-account')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class TelegramAccountController {
  constructor(private readonly service: TelegramAccountService) {}

  @Post('send-code')
  @ApiOperation({ summary: 'Send verification code to phone number' })
  @ApiResponse({ status: 201, description: 'Code sent' })
  async sendCode(@Body() dto: SendCodeDto) {
    return this.service.sendCode(dto);
  }

  @Post('verify-code')
  @ApiOperation({ summary: 'Verify code received from Telegram' })
  @ApiResponse({ status: 200, description: 'Code verified' })
  async verifyCode(@Body() dto: VerifyCodeDto) {
    return this.service.verifyCode(dto);
  }

  @Post('verify-password')
  @ApiOperation({ summary: 'Verify 2FA password' })
  @ApiResponse({ status: 200, description: 'Password verified' })
  async verifyPassword(@Body() dto: VerifyPasswordDto) {
    return this.service.verifyPassword(dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get authorization status' })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'Filter by phone number',
  })
  @ApiResponse({ status: 200, description: 'Status retrieved' })
  async getStatus(@Query('phone') phone?: string) {
    return this.service.getStatus(phone);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout from Telegram account' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  async logout(@Body('phoneNumber') phoneNumber: string) {
    return this.service.logout(phoneNumber);
  }

  @Delete(':phoneNumber')
  @ApiOperation({ summary: 'Delete Telegram account record' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  async deleteAccount(@Param('phoneNumber') phoneNumber: string) {
    return this.service.deleteAccount(phoneNumber);
  }
}
