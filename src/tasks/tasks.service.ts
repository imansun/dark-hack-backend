import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticleAgentService } from '../article-agent/article-agent.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly articleAgent: ArticleAgentService) {}

  @Cron(CronExpression.EVERY_6_HOURS, {
    name: 'ai-news-agent',
    timeZone: 'Asia/Tehran',
  })
  async runAiNewsAgent() {
    this.logger.log('⏰ Scheduled AI News Agent started');
    try {
      const result = await this.articleAgent.runAINewsAgent();
      this.logger.log(
        `✅ Scheduled AI News Agent completed: ${result.published} published, ${result.errors.length} errors`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`❌ Scheduled AI News Agent failed: ${message}`);
    }
  }
}
