import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GithubService } from './github.service';

@ApiTags('GitHub')
@Controller('api/github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('contributions')
  @Header('Content-Type', 'image/svg+xml')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({
    summary: 'GitHub contributions SVG',
    description: 'Returns the contribution graph SVG from GitHub profile.',
  })
  @ApiResponse({ status: 200, description: 'SVG contribution graph' })
  async getContributions(): Promise<string> {
    return this.githubService.getContributions();
  }
}
