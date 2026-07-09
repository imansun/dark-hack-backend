import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import { computeCheck as computeSrpCheck } from 'telegram/Password';
import { TelegramAccount } from './telegram-account.entity';
import { TelegramConfig } from '../telegram/telegram-config.entity';
import { SendCodeDto } from './dto/send-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';

const FALLBACK_API_ID = 39425611;
const FALLBACK_API_HASH = '67aa1f84b5fc8a00967059c783dae27e';

interface ActiveSession {
  client: TelegramClient;
  stringSession: StringSession;
}

@Injectable()
export class TelegramAccountService {
  private activeSessions = new Map<string, ActiveSession>();

  constructor(
    @InjectRepository(TelegramAccount)
    private readonly accountRepo: Repository<TelegramAccount>,
    @InjectRepository(TelegramConfig)
    private readonly configRepo: Repository<TelegramConfig>,
  ) {}

  private async getApiConfig() {
    const config = await this.configRepo.findOne({ where: { isActive: true } });
    return {
      apiId: config?.apiId ? Number(config.apiId) : FALLBACK_API_ID,
      apiHash: config?.apiHash || FALLBACK_API_HASH,
      dcId: config?.mtprotoProdDcId || 2,
      host: config?.mtprotoProdHost || '149.154.167.50',
      port: config?.mtprotoProdPort || 443,
      testDcId: config?.mtprotoTestDcId || 2,
      testHost: config?.mtprotoTestHost || '149.154.167.40',
      testPort: config?.mtprotoTestPort || 443,
    };
  }

  async sendCode(dto: SendCodeDto) {
    const appConfig = await this.getApiConfig();
    const apiId = Number(dto.apiId || appConfig.apiId);
    const apiHash = dto.apiHash || appConfig.apiHash;
    const testMode = dto.testMode || false;
    const dcId = dto.dcId || (testMode ? appConfig.testDcId : appConfig.dcId);

    const stringSession = new StringSession('');
    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      useWSS: false,
      testServers: testMode,
    });

    await client.connect();

    const result = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber: dto.phoneNumber,
        apiId,
        apiHash,
        settings: new Api.CodeSettings({
          allowFlashcall: true,
          currentNumber: true,
          allowAppHash: true,
        }),
      }),
    );

    const phoneCodeHash = (result as any).phoneCodeHash as string;

    let account = await this.accountRepo.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (!account) {
      account = this.accountRepo.create({
        phoneNumber: dto.phoneNumber,
        apiId: String(apiId),
        apiHash,
        phoneCodeHash,
        dcId,
        testMode,
      });
    } else {
      account.phoneCodeHash = phoneCodeHash;
      account.apiId = String(apiId);
      account.apiHash = apiHash;
      account.dcId = dcId;
      account.testMode = testMode;
    }
    await this.accountRepo.save(account);

    this.activeSessions.set(dto.phoneNumber, { client, stringSession });

    const sentCode = result as any;
    const type = sentCode.type
      ? sentCode.type.className || 'unknown'
      : 'unknown';

    return {
      ok: true,
      phoneCodeHash,
      type,
      timeout: sentCode.timeout || 60,
    };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const account = await this.accountRepo.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (!account) {
      throw new NotFoundException('Account not found. Send code first.');
    }

    const session = this.activeSessions.get(dto.phoneNumber);
    if (!session) {
      throw new BadRequestException('No active session. Send code again.');
    }

    const { client } = session;

    try {
      const signInResult = await client.invoke(
        new Api.auth.SignIn({
          phoneNumber: dto.phoneNumber,
          phoneCodeHash: account.phoneCodeHash,
          phoneCode: dto.code,
        }),
      );

      const user = (signInResult as any).user as Api.User;

      account.isAuthorized = true;
      account.firstName = user.firstName || '';
      account.lastName = user.lastName || '';
      account.username = user.username || '';
      account.telegramId = String(user.id);
      account.sessionString = session.stringSession.save();
      account.hasPassword = false;
      await this.accountRepo.save(account);

      this.activeSessions.delete(dto.phoneNumber);

      return {
        ok: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phone: user.phone,
        },
      };
    } catch (error: any) {
      if (
        error.errorMessage === 'SESSION_PASSWORD_NEEDED' ||
        error.message?.includes('SESSION_PASSWORD_NEEDED')
      ) {
        account.hasPassword = true;
        await this.accountRepo.save(account);
        return {
          ok: true,
          passwordNeeded: true,
          message: '2FA password required',
        };
      }
      throw new BadRequestException(
        error.errorMessage || error.message || 'Verification failed',
      );
    }
  }

  async verifyPassword(dto: VerifyPasswordDto) {
    const account = await this.accountRepo.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (!account) {
      throw new NotFoundException('Account not found.');
    }

    const session = this.activeSessions.get(dto.phoneNumber);
    if (!session) {
      throw new BadRequestException('No active session. Send code again.');
    }

    const { client } = session;

    try {
      const passwordData = await client.invoke(new Api.account.GetPassword());
      const srpCheck = await computeSrpCheck(passwordData, dto.password);
      const checkResult = await client.invoke(
        new Api.auth.CheckPassword({ password: srpCheck }),
      );

      const user = (checkResult as any).user as Api.User;

      account.isAuthorized = true;
      account.firstName = user.firstName || '';
      account.lastName = user.lastName || '';
      account.username = user.username || '';
      account.telegramId = String(user.id);
      account.sessionString = session.stringSession.save();
      account.hasPassword = false;
      await this.accountRepo.save(account);

      this.activeSessions.delete(dto.phoneNumber);

      return {
        ok: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          phone: user.phone,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        error.errorMessage || error.message || 'Password verification failed',
      );
    }
  }

  async getStatus(phoneNumber?: string) {
    if (phoneNumber) {
      const account = await this.accountRepo.findOne({
        where: { phoneNumber },
      });
      if (!account) {
        return { ok: true, authorized: false };
      }
      return {
        ok: true,
        authorized: account.isAuthorized,
        account: account.isAuthorized
          ? {
              id: account.id,
              phoneNumber: account.phoneNumber,
              firstName: account.firstName,
              lastName: account.lastName,
              username: account.username,
              telegramId: account.telegramId,
              isAuthorized: account.isAuthorized,
            }
          : null,
      };
    }

    const accounts = await this.accountRepo.find({
      where: { isAuthorized: true },
      order: { updatedAt: 'DESC' },
    });

    return {
      ok: true,
      accounts: accounts.map((a) => ({
        id: a.id,
        phoneNumber: a.phoneNumber,
        firstName: a.firstName,
        lastName: a.lastName,
        username: a.username,
        telegramId: a.telegramId,
        isAuthorized: a.isAuthorized,
      })),
    };
  }

  async logout(phoneNumber: string) {
    const account = await this.accountRepo.findOne({
      where: { phoneNumber },
    });
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.sessionString) {
      try {
        const stringSession = new StringSession(account.sessionString);
        const client = new TelegramClient(
          stringSession,
          Number(account.apiId),
          account.apiHash,
          {
            connectionRetries: 1,
            useWSS: false,
            testServers: account.testMode,
          },
        );
        await client.connect();
        await client.invoke(new Api.auth.LogOut());
        await client.destroy();
      } catch {
        // ignore destroy errors
      }
    }

    account.isAuthorized = false;
    account.sessionString = '';
    account.firstName = '';
    account.lastName = '';
    account.username = '';
    account.telegramId = '';
    account.phoneCodeHash = '';
    account.hasPassword = false;
    await this.accountRepo.save(account);

    this.activeSessions.delete(phoneNumber);

    return { ok: true, message: 'Logged out successfully' };
  }

  async deleteAccount(phoneNumber: string) {
    await this.logout(phoneNumber);
    await this.accountRepo.delete({ phoneNumber });
    return { ok: true, message: 'Account deleted' };
  }
}
