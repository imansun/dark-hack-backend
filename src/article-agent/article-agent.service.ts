import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as crypto from 'crypto';
import Parser from 'rss-parser';
import { ArticleSource } from './article-source.entity';
import { PostsService } from '../posts/posts.service';
import { CategoriesService } from '../categories/categories.service';
import { AiService } from '../ai/ai.service';

interface FeedSource {
  url: string;
  name: string;
}

interface AiArticleResult {
  title_fa: string;
  title_en: string;
  content_fa: string;
  excerpt_fa: string;
  tags: string;
}

interface AiNewsResult {
  title_fa: string;
  title_en: string;
  title_ar: string;
  content_fa: string;
  content_en: string;
  content_ar: string;
  excerpt_fa: string;
  excerpt_en: string;
  excerpt_ar: string;
  tags: string;
  imageUrl?: string;
  sourceUrl?: string;
}

@Injectable()
export class ArticleAgentService {
  private readonly logger = new Logger(ArticleAgentService.name);
  private readonly parser = new Parser();
  private readonly maxArticlesPerRun = 5;

  private readonly defaultSources: FeedSource[] = [
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
    { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
    { url: 'https://www.wired.com/feed/rss', name: 'Wired' },
    { url: 'https://www.zdnet.com/news/rss.xml', name: 'ZDNet' },
    {
      url: 'https://feeds.feedburner.com/TheHackersNews',
      name: 'The Hacker News',
    },
  ];

  private readonly aiNewsSources: FeedSource[] = [
    {
      url: 'https://techcrunch.com/tag/artificial-intelligence/feed/',
      name: 'TechCrunch AI',
    },
    {
      url: 'https://venturebeat.com/category/ai/feed/',
      name: 'VentureBeat AI',
    },
    {
      url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed/',
      name: 'MIT Tech Review AI',
    },
    {
      url: 'https://arstechnica.com/tag/artificial-intelligence/feed/',
      name: 'Ars Technica AI',
    },
    {
      url: 'https://blog.google/innovation-and-ai/technology/ai/rss/',
      name: 'Google AI Blog',
    },
    {
      url: 'https://openai.com/news/rss.xml',
      name: 'OpenAI Blog',
    },
    {
      url: 'https://engineering.fb.com/feed/',
      name: 'Meta Engineering',
    },
    {
      url: 'https://deepmind.google/blog/rss.xml',
      name: 'DeepMind Blog',
    },
  ];

  private readonly systemPrompt = `شما یک نویسنده و تحلیلگر حرفه‌ای مقاله‌های فناوری هستید.
وظیفه شما این است که یک مقاله خبری معتبر از یک منبع خارجی را مطالعه کرده و یک مقاله تحلیلی جدید و کامل به زبان فارسی تولید کنید.

دستورالعمل‌ها:
1. مقاله اصلی را به دقت مطالعه کنید
2. یک عنوان جذاب و سئو-فرندلی به فارسی تولید کنید
3. یک مقدمه کوتاه و جذاب (excerpt) حداکثر ۲۰۰ کاراکتر بنویسید
4. محتوای کامل مقاله را به فارسی تولید کنید (حداقل ۵۰۰ کلمه)
5. محتوای مقاله باید شامل: مقدمه، تحلیل اصلی، نتیجه‌گیری باشد
6. ۳ تا ۵ تگ مرتبط به انگلیسی وارد کنید (مثلاً: AI, Cybersecurity, Technology)
7. یک عنوان انگلیسی مناسب نیز تولید کنید
8. منبع اصلی را در انتهای مقاله ذکر کنید

خروجی را دقیقاً به این فرمت JSON برگردانید (بدون هیچ متن دیگری):
{
  "title_fa": "عنوان فارسی",
  "title_en": "English Title",
  "content_fa": "محتوای کامل مقاله به فارسی",
  "excerpt_fa": "خلاصه کوتاه",
  "tags": "Tag1, Tag2, Tag3"
}`;

  private readonly aiNewsSystemPrompt = `شما یک تحلیلگر و نویسنده حرفه‌ای در حوزه هوش مصنوعی هستید.
وظیفه شما این است که آخرین اخبار و مقالات حوزه هوش مصنوعی را از منابع معتبر جهانی مطالعه کرده و یک مقاله تحلیلی عمیق به سه زبان فارسی، انگلیسی و عربی تولید کنید.

دستورالعمل‌ها:
1. مقاله اصلی را به دقت مطالعه و تحلیل کنید
2. یک عنوان جذاب و سئو-فرندلی به فارسی تولید کنید (title_fa)
3. یک عنوان انگلیسی دقیق و جذاب تولید کنید (title_en)
4. یک عنوان عربی دقیق تولید کنید (title_ar)
5. یک مقدمه کوتاه فارسی (excerpt_fa) حداکثر ۲۰۰ کاراکتر بنویسید
6. یک مقدمه کوتاه انگلیسی (excerpt_en) حداکثر ۲۰۰ کاراکتر بنویسید
7. یک مقدمه کوتاه عربی (excerpt_ar) حداکثر ۲۰۰ کاراکتر بنویسید
8. محتوای کامل مقاله به فارسی (content_fa) - حداقل ۸۰۰ کلمه شامل: مقدمه، تحلیل فنی عمیق، پیامدها و کاربردها، نتیجه‌گیری و چشم‌انداز آینده
9. محتوای کامل مقاله به انگلیسی (content_en) - حداقل ۵۰۰ کلمه با همان ساختار
10. محتوای کامل مقاله به عربی (content_ar) - حداقل ۵۰۰ کلمه با همان ساختار
11. ۴ تا ۶ تگ مرتبط به انگلیسی وارد کنید
12. در تحلیل خود حتماً به این موارد بپردازید:
    - نوآوری فنی و علمی مقاله
    - تأثیر بالقوه بر صنعت و جامعه
    - مقایسه با کارهای مشابه
    - چالش‌ها و محدودیت‌ها
    - چشم‌انداز آینده
13. منبع اصلی را در انتهای مقاله ذکر کنید
14. لحن حرفه‌ای، تحلیلی و بی‌طرفانه باشد
15. محتوای عربی و فارسی را با خط راست‌به‌چپ (RTL) و نشانه‌های مناسب بنویسید

خروجی را دقیقاً به این فرمت JSON برگردانید (بدون هیچ متن دیگری):
{
  "title_fa": "عنوان فارسی جذاب و سئو-فرندلی",
  "title_en": "English SEO-friendly Title",
  "title_ar": "عنوان عربي جذاب ومتوافق مع SEO",
  "content_fa": "محتوای کامل و عمیق مقاله به فارسی با فرمت Markdown",
  "content_en": "Full English article content in Markdown format",
  "content_ar": "المحتوى الكامل والمتعمق للمقال بالعربية بصيغة Markdown",
  "excerpt_fa": "خلاصه کوتاه و جذاب به فارسی",
  "excerpt_en": "Short engaging excerpt in English",
  "excerpt_ar": "ملخص قصير وجذاب بالعربية",
  "tags": "AI, Deep Learning, LLM, Technology",
  "imageUrl": "پیشنهاد تصویر شاخص یا خالی بگذارید",
  "sourceUrl": ""
}`;

  constructor(
    @InjectRepository(ArticleSource)
    private readonly sourceRepo: Repository<ArticleSource>,
    private readonly postsService: PostsService,
    private readonly categoriesService: CategoriesService,
    private readonly aiService: AiService,
  ) {}

  async runAgent(): Promise<{
    processed: number;
    published: number;
    errors: string[];
  }> {
    this.logger.log('Article agent started');
    const errors: string[] = [];
    let published = 0;
    let processed = 0;

    const sources = this.getSources();

    for (const source of sources) {
      try {
        const feed = await this.parser.parseURL(source.url);
        this.logger.log(
          `Fetched ${feed.items.length} items from ${source.name}`,
        );

        for (const item of feed.items.slice(0, this.maxArticlesPerRun)) {
          if (!item.link || !item.title) continue;

          const exists = await this.sourceRepo.findOne({
            where: { originalUrl: item.link },
          });
          if (exists) continue;

          processed++;
          try {
            const originalContent =
              item.contentSnippet?.slice(0, 2000) ||
              item.content?.slice(0, 2000) ||
              '';
            const result = await this.generateArticle(
              item.title,
              originalContent,
              item.link,
            );

            const slug = this.generateSlug(result.title_en || result.title_fa);

            const category = await this.ensureCategory();

            const post = await this.postsService.create({
              title: result.title_fa,
              title_en: result.title_en || undefined,
              content: result.content_fa,
              excerpt: result.excerpt_fa || undefined,
              tags: result.tags || undefined,
              slug,
              categoryId: category.id,
              published: true,
            });

            await this.sourceRepo.save({
              sourceUrl: source.url,
              sourceName: source.name,
              originalUrl: item.link,
              originalTitle: item.title,
              originalContent,
              postId: post.id,
              status: 'published',
            });

            published++;
            this.logger.log(`Published post: ${post.title} (${post.slug})`);
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : 'Unknown error';
            this.logger.error(
              `Failed to process article: ${item.title} - ${message}`,
            );
            errors.push(`${item.title}: ${message}`);
            try {
              await this.sourceRepo.save({
                sourceUrl: source.url,
                sourceName: source.name,
                originalUrl: item.link,
                originalTitle: item.title,
                status: 'failed',
                error: message,
              });
            } catch (saveErr: unknown) {
              if (saveErr instanceof QueryFailedError) {
                this.logger.warn(`Duplicate article skipped: ${item.title}`);
              } else {
                throw saveErr;
              }
            }
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(`Failed to fetch source ${source.name}: ${message}`);
        errors.push(`Source ${source.name}: ${message}`);
      }
    }

    this.logger.log(
      `Article agent finished: ${processed} processed, ${published} published, ${errors.length} errors`,
    );
    return { processed, published, errors };
  }

  async runAINewsAgent(): Promise<{
    processed: number;
    published: number;
    errors: string[];
  }> {
    this.logger.log('AI News agent started');
    const errors: string[] = [];
    let published = 0;
    let processed = 0;

    for (const source of this.aiNewsSources) {
      try {
        const feed = await this.parser.parseURL(source.url);
        this.logger.log(
          `Fetched ${feed.items.length} items from ${source.name}`,
        );

        for (const item of feed.items.slice(0, this.maxArticlesPerRun)) {
          if (!item.link || !item.title) continue;

          const exists = await this.sourceRepo.findOne({
            where: { originalUrl: item.link },
          });
          if (exists) continue;

          processed++;
          try {
            const originalContent =
              item.contentSnippet?.slice(0, 2500) ||
              item.content?.slice(0, 2500) ||
              '';
            const result = await this.generateAiNewsArticle(
              item.title,
              originalContent,
              item.link,
            );

            const slug = this.generateSlug(result.title_en || result.title_fa);
            const category = await this.ensureAiCategory();

            const post = await this.postsService.create({
              title: result.title_fa,
              title_en: result.title_en || undefined,
              title_ar: result.title_ar || undefined,
              content: result.content_fa,
              content_en: result.content_en || undefined,
              content_ar: result.content_ar || undefined,
              excerpt: result.excerpt_fa || undefined,
              excerpt_en: result.excerpt_en || undefined,
              excerpt_ar: result.excerpt_ar || undefined,
              tags: result.tags || undefined,
              imageUrl: result.imageUrl || undefined,
              slug,
              categoryId: category.id,
              published: true,
            });

            await this.sourceRepo.save({
              sourceUrl: source.url,
              sourceName: source.name,
              originalUrl: item.link,
              originalTitle: item.title,
              originalContent,
              postId: post.id,
              status: 'published',
            });

            published++;
            this.logger.log(
              `Published AI news post: ${post.title} (${post.slug})`,
            );
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : 'Unknown error';
            this.logger.error(
              `Failed to process AI article: ${item.title} - ${message}`,
            );
            errors.push(`${item.title}: ${message}`);
            try {
              await this.sourceRepo.save({
                sourceUrl: source.url,
                sourceName: source.name,
                originalUrl: item.link,
                originalTitle: item.title,
                status: 'failed',
                error: message,
              });
            } catch (saveErr: unknown) {
              if (saveErr instanceof QueryFailedError) {
                this.logger.warn(`Duplicate AI article skipped: ${item.title}`);
              } else {
                throw saveErr;
              }
            }
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Failed to fetch AI source ${source.name}: ${message}`,
        );
        errors.push(`Source ${source.name}: ${message}`);
      }
    }

    this.logger.log(
      `AI News agent finished: ${processed} processed, ${published} published, ${errors.length} errors`,
    );
    return { processed, published, errors };
  }

  async getStatus() {
    const total = await this.sourceRepo.count();
    const published = await this.sourceRepo.count({
      where: { status: 'published' },
    });
    const failed = await this.sourceRepo.count({ where: { status: 'failed' } });
    const pending = await this.sourceRepo.count({
      where: { status: 'pending' },
    });

    const lastRun = await this.sourceRepo.findOne({
      where: {},
      order: { createdAt: 'DESC' },
    });

    const recentHistory = await this.sourceRepo.find({
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      totalSources: total,
      totalPublished: published,
      totalFailed: failed,
      totalPending: pending,
      lastRunAt: lastRun?.createdAt || null,
      recentHistory,
    };
  }

  async getHistory(
    limit = 20,
    offset = 0,
  ): Promise<{ items: ArticleSource[]; total: number }> {
    const [items, total] = await this.sourceRepo.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { items, total };
  }

  private getSources(): FeedSource[] {
    const envSources = process.env.AI_AGENT_SOURCES;
    if (envSources) {
      return envSources.split(',').map((s) => {
        const [url, name] = s.split('|');
        return { url: url.trim(), name: (name || url.trim()).trim() };
      });
    }
    return this.defaultSources;
  }

  private async ensureCategory() {
    let cat = await this.categoriesService
      .findBySlug('ai-agents')
      .catch(() => null);
    if (!cat) {
      cat = await this.categoriesService.create({
        name: 'هوش مصنوعی و تکنولوژی',
        name_en: 'AI & Technology',
        name_ar: 'الذكاء الاصطناعي والتكنولوجيا',
        slug: 'ai-agents',
      });
    }
    return cat;
  }

  private generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80);
    const hash = crypto.randomBytes(3).toString('hex');
    return `${slug}-${hash}`;
  }

  private async ensureAiCategory() {
    let cat = await this.categoriesService
      .findBySlug('ai-news')
      .catch(() => null);
    if (!cat) {
      cat = await this.categoriesService.create({
        name: 'هوش مصنوعی',
        name_en: 'Artificial Intelligence',
        name_ar: 'الذكاء الاصطناعي',
        slug: 'ai-news',
      });
    }
    return cat;
  }

  private async generateAiNewsArticle(
    originalTitle: string,
    originalContent: string,
    originalUrl: string,
  ): Promise<AiNewsResult> {
    const prompt = `لطفاً این مقاله را تحلیل کرده و مقاله سه‌زبانه (فارسی، انگلیسی، عربی) تولید کنید.

عنوان اصلی: ${originalTitle}
لینک منبع: ${originalUrl}

محتوای اصلی:
${originalContent.slice(0, 3500)}

لطفاً خروجی JSON دقیقاً مطابق فرمت مشخص شده تولید کنید.`;

    const response = await this.aiService.ask(
      `${this.aiNewsSystemPrompt}\n\n${prompt}`,
    );
    return this.parseAiNewsResponse(response);
  }

  private parseAiNewsResponse(response: string): AiNewsResult {
    const codeBlockMatch = response.match(
      /```(?:json)?\s*(\{[\s\S]*?\})\s*```/,
    );
    const jsonStr = codeBlockMatch ? codeBlockMatch[1] : response;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }
    const raw = JSON.parse(jsonMatch[0]) as Record<string, string>;
    return {
      title_fa: raw.title_fa || 'مقاله جدید هوش مصنوعی',
      title_en: raw.title_en || '',
      title_ar: raw.title_ar || '',
      content_fa: raw.content_fa || raw.content || '',
      content_en: raw.content_en || '',
      content_ar: raw.content_ar || '',
      excerpt_fa: raw.excerpt_fa || raw.excerpt || '',
      excerpt_en: raw.excerpt_en || '',
      excerpt_ar: raw.excerpt_ar || '',
      tags: raw.tags || 'AI, Artificial Intelligence',
      imageUrl: raw.imageUrl || undefined,
      sourceUrl: raw.sourceUrl || undefined,
    };
  }

  private async generateArticle(
    originalTitle: string,
    originalContent: string,
    originalUrl: string,
  ): Promise<AiArticleResult> {
    const prompt = `لطفاً این مقاله را تحلیل کرده و یک مقاله فارسی جدید تولید کنید.

عنوان اصلی: ${originalTitle}
لینک منبع: ${originalUrl}

محتوای اصلی:
${originalContent.slice(0, 3000)}

لطفاً خروجی JSON دقیقاً مطابق فرمت مشخص شده تولید کنید.`;

    const response = await this.aiService.ask(
      `${this.systemPrompt}\n\n${prompt}`,
    );
    return this.parseAiResponse(response);
  }

  private parseAiResponse(response: string): AiArticleResult {
    const codeBlockMatch = response.match(
      /```(?:json)?\s*(\{[\s\S]*?\})\s*```/,
    );
    const jsonStr = codeBlockMatch ? codeBlockMatch[1] : response;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }
    const raw = JSON.parse(jsonMatch[0]) as Record<string, string>;
    return {
      title_fa: raw.title_fa || 'مقاله جدید',
      title_en: raw.title_en || '',
      content_fa: raw.content_fa || raw.content || '',
      excerpt_fa: raw.excerpt_fa || raw.excerpt || '',
      tags: raw.tags || '',
    };
  }
}
