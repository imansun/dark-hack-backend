import {
  Controller,
  Post,
  Get,
  Query,
  UseGuards,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ArticleAgentService } from './article-agent.service';

@ApiTags('Article Agent')
@Controller('api/article-agent')
export class ArticleAgentController {
  constructor(private readonly agent: ArticleAgentService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get article agent status' })
  async getStatus() {
    return this.agent.getStatus();
  }

  @Post('run')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Run the article agent',
    description:
      'Fetches RSS feeds, analyzes with AI, and publishes new articles.',
  })
  async run() {
    try {
      const result = await this.agent.runAgent();
      return result;
    } catch (err: unknown) {
      throw new HttpException(
        err instanceof Error ? err.message : 'Unknown error',
        500,
      );
    }
  }

  @Post('run-ai-news')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Run the AI news agent',
    description:
      'Fetches AI-specific RSS feeds, analyzes with AI, and publishes bilingual (FA/EN) articles.',
  })
  async runAiNews() {
    try {
      const result = await this.agent.runAINewsAgent();
      return result;
    } catch (err: unknown) {
      throw new HttpException(
        err instanceof Error ? err.message : 'Unknown error',
        500,
      );
    }
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get agent run history',
    description: 'Returns list of processed articles.',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async history(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.agent.getHistory(Number(limit) || 20, Number(offset) || 0);
  }
}
