import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class TurnstileService {
  async verify(token: string): Promise<void> {
    if (!token) {
      throw new HttpException('Turnstile token is required', HttpStatus.BAD_REQUEST);
    }

    const secret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const data: any = await res.json();

    if (!data.success) {
      throw new HttpException('Captcha verification failed', HttpStatus.FORBIDDEN);
    }
  }
}
