import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ArticleAgentModule } from '../article-agent/article-agent.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [ScheduleModule.forRoot(), ArticleAgentModule],
  providers: [TasksService],
})
export class TasksModule {}
