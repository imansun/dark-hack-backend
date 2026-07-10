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

const DEFAULT_BOT_TOKEN = '8748578827:AAHT3_orB5Uu75oxDoTZ9wnOeYIVsW2xUWg';
const DEFAULT_API_ID = '39425611';
const DEFAULT_API_HASH = '67aa1f84b5fc8a00967059c783dae27e';
const DEFAULT_MTProto_HOST = '149.154.167.50';
const DEFAULT_MTProto_PORT = 443;
const DEFAULT_MTProto_DC_ID = 2;
const DEFAULT_MTProto_TEST_HOST = '149.154.167.40';
const DEFAULT_MTProto_PUBLIC_KEY_TEST = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAyMEdY1aR+sCR3ZSJrtztKTKqigvO/vBfqACJLZtS7QMgCGXJ6XIR
yy7mx66W0/sOFa7/1mAZtEoIokDP3ShoqF4fVNb6XeqgQfaUHd8wJpDWHcR2OFwv
plUUI1PLTktZ9uW2WE23b+ixNwJjJGwBDJPQEQFBE+vfmH0JP503wr5INS1poWg/
j25sIWeYPHYeOrFp/eXaqhISP6G+q2IeTaWTXpwZj4LzXq5YOpk4bYEQ6mvRq7D1
aHWfYmlEGepfaYR8Q0YqvvhYtMte3ITnuSJs171+GDqpdKcSwHnd6FudwGO4pcCO
j4WcDuXc2CTHgH8gFTNhp/Y8/SpDOhvn9QIDAQAB
-----END RSA PUBLIC KEY-----`;
const DEFAULT_MTProto_PUBLIC_KEY_PROD = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEA6LszBcC1LGzyr992NzE0ieY+BSaOW622Aa9Bd4ZHLl+TuFQ4lo4g
5nKaMBwK/BIb9xUfg0Q29/2mgIR6Zr9krM7HjuIcCzFvDtr+L0GQjae9H0pRB2OO
62cECs5HKhT5DZ98K33vmWiLowc621dQuwKWSQKjWf50XYFw42h21P2KXUGyp2y/
+aEyZ+uVgLLQbRA1dEjSDZ2iGRy12Mk5gpYc397aYp438fsJoHIgJ2lgMv5h7WY9
t6N/byY9Nw9p21Og3AoXSL2q/2IJ1WRUhebgAdGVMlV1fkuOQoEzR7EdpqtQD9Cs
5+bfo3Nhmcyvk5ftB0WkJ9z6bNZ7yxrP8wIDAQAB
-----END RSA PUBLIC KEY-----`;

function createDefaultConfig(): TelegramConfig {
  const config = new TelegramConfig();
  config.botToken = process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
  config.apiId = process.env.TELEGRAM_API_ID || DEFAULT_API_ID;
  config.apiHash = process.env.TELEGRAM_API_HASH || DEFAULT_API_HASH;
  config.appTitle = '';
  config.shortName = '';
  config.fcmCredentials = '';
  config.mtprotoTestDcId = DEFAULT_MTProto_DC_ID;
  config.mtprotoTestHost = DEFAULT_MTProto_TEST_HOST;
  config.mtprotoTestPort = DEFAULT_MTProto_PORT;
  config.publicKeyTest = DEFAULT_MTProto_PUBLIC_KEY_TEST;
  config.mtprotoProdDcId = DEFAULT_MTProto_DC_ID;
  config.mtprotoProdHost = DEFAULT_MTProto_HOST;
  config.mtprotoProdPort = DEFAULT_MTProto_PORT;
  config.publicKeyProd = DEFAULT_MTProto_PUBLIC_KEY_PROD;
  config.isActive = false;
  return config;
}

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
    const config = await this.configRepo.findOne({ where: { isActive: true } });
    if (!config) {
      return createDefaultConfig();
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
    return createDefaultConfig();
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
