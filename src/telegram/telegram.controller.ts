import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TelegramService } from './telegram.service';
import { TelegramConfig } from './telegram-config.entity';
import { TelegramMessage } from './telegram-message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { SetWebhookDto } from './dto/set-webhook.dto';

@ApiTags('Telegram')
@Controller('api/telegram')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class TelegramController {
  constructor(private readonly service: TelegramService) {}

  @Get('bot-info')
  @ApiOperation({ summary: 'Get bot information from Telegram API' })
  @ApiResponse({ status: 200, description: 'Bot info retrieved' })
  async getBotInfo() {
    return this.service.getBotInfo();
  }

  @Post('send-message')
  @ApiOperation({ summary: 'Send a message via bot' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.service.sendMessage(dto.chatId, dto.text);
  }

  @Get('updates')
  @ApiOperation({ summary: 'Get recent updates from Telegram API' })
  @ApiResponse({ status: 200, description: 'Updates retrieved' })
  async getUpdates() {
    return this.service.getUpdates();
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get sent message history from database' })
  @ApiResponse({
    status: 200,
    description: 'Message log retrieved',
    type: [TelegramMessage],
  })
  async getMessageLog() {
    return this.service.getMessageLog();
  }

  @Get('config')
  @ApiOperation({ summary: 'Get current bot configuration' })
  @ApiResponse({
    status: 200,
    description: 'Config retrieved',
    type: TelegramConfig,
  })
  async getConfig() {
    return this.service.getConfig();
  }

  @Put('config')
  @ApiOperation({ summary: 'Update bot configuration' })
  @ApiResponse({
    status: 200,
    description: 'Config updated',
    type: TelegramConfig,
  })
  async updateConfig(@Body() dto: UpdateConfigDto) {
    return this.service.updateConfig(dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Set webhook URL' })
  @ApiResponse({ status: 201, description: 'Webhook set' })
  async setWebhook(@Body() dto: SetWebhookDto) {
    return this.service.setWebhook(dto.url);
  }

  @Delete('webhook')
  @ApiOperation({ summary: 'Delete webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted' })
  async deleteWebhook() {
    return this.service.deleteWebhook();
  }
}
