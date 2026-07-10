import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsConfig } from './sms-config.entity';
import { UpdateSmsConfigDto } from './dto/update-sms-config.dto';

const DEFAULT_CONFIG: Partial<SmsConfig> = {
  accessHash: '1c738e0e-4f10-4299-bdaa-1cff6eb84908',
  phoneNumber: '50002487',
  patternId: 'af3ff03c-619c-49c8-a11f-f7e9625f0c5f',
  baseUrl: 'https://smspanel.trez.ir',
  supportPhone: '011-35157000',
  docVersion: '1.0.22',
  destNumber: '09021689007',
  isActive: false,
};

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @InjectRepository(SmsConfig)
    private smsConfigRepo: Repository<SmsConfig>,
  ) {}

  private createDefaultConfig(): SmsConfig {
    const config = new SmsConfig();
    Object.assign(config, DEFAULT_CONFIG);
    return config;
  }

  async getConfig(): Promise<SmsConfig> {
    let config = await this.smsConfigRepo.findOne({ where: { id: 1 } });
    if (!config) {
      config = this.createDefaultConfig();
      config = await this.smsConfigRepo.save(config);
    }
    return config;
  }

  async updateConfig(dto: UpdateSmsConfigDto): Promise<SmsConfig> {
    let config = await this.smsConfigRepo.findOne({ where: { id: 1 } });
    if (!config) {
      const defaults = this.createDefaultConfig();
      config = this.smsConfigRepo.merge(defaults, dto);
    } else {
      this.smsConfigRepo.merge(config, dto);
    }
    return this.smsConfigRepo.save(config);
  }

  async sendContactNotification(name: string, message: string): Promise<void> {
    const config = await this.getConfig();

    if (!config.isActive) {
      this.logger.warn('SMS is inactive, skipping notification');
      return;
    }

    const destNumber = config.destNumber;
    if (!destNumber) {
      this.logger.warn('No destination number configured');
      return;
    }

    const authStr = Buffer.from(
      `${config.username}:${config.password}`,
    ).toString('base64');

    const body = {
      AccessHash: config.accessHash,
      PhoneNumber: config.phoneNumber,
      PatternId: config.patternId,
      token1: name,
      token2: message.substring(0, 50),
      Mobiles: [destNumber],
      SendDateInTimeStamp: 0,
    };

    try {
      const res = await fetch(
        `${config.baseUrl}/api/smsApiWithPattern/SendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${authStr}`,
          },
          body: JSON.stringify(body),
        },
      );

      const text = await res.text();
      this.logger.log(`SMS API response (${res.status}): ${text}`);
    } catch (err) {
      this.logger.error(`Failed to send SMS: ${err.message}`);
    }
  }
}
