import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramConfig } from './telegram-config.entity';
import { TelegramMessage } from './telegram-message.entity';
import { UpdateConfigDto } from './dto/update-config.dto';

interface TelegramResponse {
  ok: boolean;
  result?: Record<string, unknown>;
  description?: string;
}

interface BotInfoResult {
  username?: string;
  first_name?: string;
}

const TELEGRAM_API = 'https://api.telegram.org/bot';

@Injectable()
export class TelegramService {
  constructor(
    @InjectRepository(TelegramConfig)
    private readonly configRepo: Repository<TelegramConfig>,
    @InjectRepository(TelegramMessage)
    private readonly messageRepo: Repository<TelegramMessage>,
  ) {}

  private getBotToken(config?: TelegramConfig): string {
    const token = config?.botToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new NotFoundException('Bot token not configured');
    return token;
  }

  private async getActiveConfig(): Promise<TelegramConfig> {
    let config = await this.configRepo.findOne({ where: { isActive: true } });
    if (!config) {
      config = new TelegramConfig();
      config.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
      config.apiId = process.env.TELEGRAM_API_ID || '';
      config.apiHash = process.env.TELEGRAM_API_HASH || '';
    }
    return config;
  }

  private async fetchBot(
    method: string,
    body?: Record<string, unknown>,
  ): Promise<TelegramResponse> {
    const config = await this.getActiveConfig();
    const token = this.getBotToken(config);
    const opts: RequestInit = {};
    if (body) {
      opts.method = 'POST';
      opts.headers = { 'Content-Type': 'application/json' };
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${TELEGRAM_API}${token}/${method}`, opts);
    return res.json() as Promise<TelegramResponse>;
  }

  async getBotInfo(): Promise<{ ok: boolean; bot: Record<string, unknown> }> {
    const data = await this.fetchBot('getMe');
    if (data.ok && data.result) {
      const botInfo = data.result as BotInfoResult;
      const config = await this.getActiveConfig();
      config.botUsername = botInfo.username || config.botUsername;
      config.botName = botInfo.first_name || config.botName;
      config.isActive = true;
      await this.configRepo.save(config);
    }
    return { ok: data.ok, bot: data.result || {} };
  }

  async sendMessage(
    chatId: string,
    text: string,
  ): Promise<{ ok: boolean; result: Record<string, unknown> }> {
    const data = await this.fetchBot('sendMessage', { chat_id: chatId, text });

    const log = this.messageRepo.create({
      chatId,
      messageText: text,
      responseText: JSON.stringify(data),
      status: data.ok ? 'sent' : 'failed',
    });
    await this.messageRepo.save(log);

    return { ok: data.ok, result: data.result || {} };
  }

  async getUpdates(): Promise<{
    ok: boolean;
    updates: Record<string, unknown>[];
  }> {
    const data = await this.fetchBot('getUpdates');
    return {
      ok: data.ok,
      updates: (data.result as unknown as Record<string, unknown>[]) || [],
    };
  }

  async getMessageLog(): Promise<TelegramMessage[]> {
    return this.messageRepo.find({ order: { sentAt: 'DESC' }, take: 50 });
  }

  async getConfig(): Promise<TelegramConfig> {
    const config = await this.configRepo.findOne({ where: { isActive: true } });
    if (config) return config;
    const fallback = new TelegramConfig();
    fallback.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    fallback.apiId = process.env.TELEGRAM_API_ID || '';
    fallback.apiHash = process.env.TELEGRAM_API_HASH || '';
    fallback.isActive = false;
    return fallback;
  }

  async updateConfig(dto: UpdateConfigDto): Promise<TelegramConfig> {
    let config = await this.configRepo.findOne({ where: { isActive: true } });
    if (!config) {
      config = new TelegramConfig();
    }
    if (dto.botToken !== undefined) config.botToken = dto.botToken;
    if (dto.webhookUrl !== undefined) config.webhookUrl = dto.webhookUrl;
    if (dto.apiId !== undefined) config.apiId = dto.apiId;
    if (dto.apiHash !== undefined) config.apiHash = dto.apiHash;
    if (dto.appTitle !== undefined) config.appTitle = dto.appTitle;
    if (dto.shortName !== undefined) config.shortName = dto.shortName;
    if (dto.fcmCredentials !== undefined)
      config.fcmCredentials = dto.fcmCredentials;
    if (dto.mtprotoTestDcId !== undefined)
      config.mtprotoTestDcId = dto.mtprotoTestDcId;
    if (dto.mtprotoTestHost !== undefined)
      config.mtprotoTestHost = dto.mtprotoTestHost;
    if (dto.mtprotoTestPort !== undefined)
      config.mtprotoTestPort = dto.mtprotoTestPort;
    if (dto.publicKeyTest !== undefined)
      config.publicKeyTest = dto.publicKeyTest;
    if (dto.mtprotoProdDcId !== undefined)
      config.mtprotoProdDcId = dto.mtprotoProdDcId;
    if (dto.mtprotoProdHost !== undefined)
      config.mtprotoProdHost = dto.mtprotoProdHost;
    if (dto.mtprotoProdPort !== undefined)
      config.mtprotoProdPort = dto.mtprotoProdPort;
    if (dto.publicKeyProd !== undefined)
      config.publicKeyProd = dto.publicKeyProd;
    if (dto.isActive !== undefined) config.isActive = dto.isActive;
    return this.configRepo.save(config);
  }

  async setWebhook(url: string): Promise<{ ok: boolean; description: string }> {
    const data = await this.fetchBot('setWebhook', { url });
    if (data.ok) {
      const config = await this.getActiveConfig();
      config.webhookUrl = url;
      await this.configRepo.save(config);
    }
    return { ok: data.ok, description: data.description || '' };
  }

  async deleteWebhook(): Promise<{ ok: boolean; description: string }> {
    const data = await this.fetchBot('deleteWebhook');
    if (data.ok) {
      const config = await this.getActiveConfig();
      config.webhookUrl = '';
      await this.configRepo.save(config);
    }
    return { ok: data.ok, description: data.description || '' };
  }
}
