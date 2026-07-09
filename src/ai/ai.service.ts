import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl = 'http://127.0.0.1:4097';
  private lastRequestTime: Date | null = null;
  private lastRequestStatus: 'success' | 'failed' | null = null;

  private readonly systemPrompts = {
    consult: `شما یک مشاور هوش مصنوعی برای کسب‌وکارها هستید. وظیفه شما این است که به صاحبان کسب‌وکار توضیح دهید چگونه AI Agent می‌تواند به آنها کمک کند.

قوانین پاسخ‌دهی:
1. ابتدا کسب‌وکار طرف مقابل را شناسایی کنید (اگر مشخص نبود بپرسید)
2. توضیح دهید که AI Agent چیست و چه تفاوتی با چت‌بات ساده دارد
3. یک جدول مقایسه نشان دهید (چت‌بات ساده vs AI Agent)
4. مثال‌های مشخص و ملموس برای کسب‌وکار آنها بزنید
5. توضیح دهید دقیقاً چه کارهایی می‌تواند انجام دهد (بررسی موجودی، ثبت سفارش، صدور فاکتور، و...)
6. لحن شما باید گرم، حرفه‌ای و قانع‌کننده باشد
7. از کلمه "کارمند دیجیتالی" استفاده کنید
8. تأکید کنید که ۲۴ ساعته و ۷ روز هفته فعال است
9. اگر کسب‌وکار مشخص نکرد، ازش بخواهید بگوید چه نوع کسب‌وکاری دارد

زبان پاسخ: اگر کاربر فارسی صحبت کرد، به فارسی کامل پاسخ دهید. اگر انگلیسی، به انگلیسی.`,
  };

  async status(): Promise<{
    connected: boolean;
    version?: string;
    lastRequestTime: Date | null;
    lastRequestStatus: 'success' | 'failed' | null;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/global/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data: any = await res.json();
        return {
          connected: true,
          version: data?.version,
          lastRequestTime: this.lastRequestTime,
          lastRequestStatus: this.lastRequestStatus,
        };
      }
    } catch {}
    return {
      connected: false,
      lastRequestTime: this.lastRequestTime,
      lastRequestStatus: this.lastRequestStatus,
    };
  }

  async ask(prompt: string): Promise<string> {
    this.logger.log(
      `Sending prompt to OpenCode: ${(prompt || '').slice(0, 50)}...`,
    );

    try {
      const sessionRes = await fetch(`${this.baseUrl}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!sessionRes.ok) {
        const text = await sessionRes.text().catch(() => '');
        this.logger.error(
          `Session creation failed: ${sessionRes.status} ${text}`,
        );
        this.lastRequestTime = new Date();
        this.lastRequestStatus = 'failed';
        throw new Error('Failed to create session');
      }
      const session: any = await sessionRes.json();
      this.logger.log(`Session created: ${session.id}`);

      const msgRes = await fetch(
        `${this.baseUrl}/session/${session.id}/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parts: [{ type: 'text', text: prompt }] }),
          signal: AbortSignal.timeout(300000),
        },
      );
      if (!msgRes.ok) {
        const text = await msgRes.text().catch(() => '');
        this.logger.error(`Message failed: ${msgRes.status} ${text}`);
        this.lastRequestTime = new Date();
        this.lastRequestStatus = 'failed';
        throw new Error(`AI request failed: ${msgRes.status}`);
      }

      const data: any = await msgRes.json();
      const parts: any[] = data?.parts || [];
      const answer =
        parts
          .filter((p) => p.type === 'text')
          .map((p) => p.text)
          .join('') || 'پاسخی دریافت نشد.';
      this.logger.log(`AI response received (${answer.length} chars)`);
      this.lastRequestTime = new Date();
      this.lastRequestStatus = 'success';
      return answer;
    } catch (err) {
      this.lastRequestTime = new Date();
      this.lastRequestStatus = 'failed';
      throw err;
    }
  }

  async consult(prompt: string): Promise<string> {
    const wrapped = `${this.systemPrompts.consult}\n\nسوال/درخواست کاربر:\n${prompt}`;
    return this.ask(wrapped);
  }
}
