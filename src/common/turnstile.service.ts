import { Injectable } from '@nestjs/common';

@Injectable()
export class TurnstileService {
  async verify(_token: string): Promise<void> {
    return;
  }
}
