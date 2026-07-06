import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl = 'http://127.0.0.1:4097';

  async ask(prompt: string): Promise<string> {
    this.logger.log(`Sending prompt to OpenCode: ${(prompt || '').slice(0, 50)}...`);

    const sessionRes = await fetch(`${this.baseUrl}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!sessionRes.ok) {
      const text = await sessionRes.text().catch(() => '');
      this.logger.error(`Session creation failed: ${sessionRes.status} ${text}`);
      throw new Error('Failed to create session');
    }
    const session: any = await sessionRes.json();
    this.logger.log(`Session created: ${session.id}`);

    const msgRes = await fetch(`${this.baseUrl}/session/${session.id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parts: [{ type: 'text', text: prompt }] }),
      signal: AbortSignal.timeout(180000),
    });
    if (!msgRes.ok) {
      const text = await msgRes.text().catch(() => '');
      this.logger.error(`Message failed: ${msgRes.status} ${text}`);
      throw new Error(`AI request failed: ${msgRes.status}`);
    }

    const data: any = await msgRes.json();
    const parts: any[] = data?.parts || [];
    const answer = parts.filter((p) => p.type === 'text').map((p) => p.text).join('') || 'پاسخی دریافت نشد.';
    this.logger.log(`AI response received (${answer.length} chars)`);
    return answer;
  }
}
