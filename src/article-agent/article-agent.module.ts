import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleSource } from './article-source.entity';
import { ArticleAgentService } from './article-agent.service';
import { ArticleAgentController } from './article-agent.controller';
import { PostsModule } from '../posts/posts.module';
import { CategoriesModule } from '../categories/categories.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleSource]),
    PostsModule,
    CategoriesModule,
    AiModule,
  ],
  controllers: [ArticleAgentController],
  providers: [ArticleAgentService],
  exports: [ArticleAgentService],
})
export class ArticleAgentModule {}
