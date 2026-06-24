import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class GithubService {
  private cache: { data: string; timestamp: number } | null = null;
  private readonly CACHE_TTL = 60 * 60 * 1000;

  async getContributions(): Promise<string> {
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data;
    }

    const username = process.env.GITHUB_USERNAME || 'maryamvatanpour';
    const response = await fetch(
      `https://github.com/users/${username}/contributions`,
      {
        headers: {
          'User-Agent': 'portfolio-backend',
          Accept: 'text/html',
        },
      },
    );

    if (!response.ok) {
      throw new HttpException(
        'Failed to fetch GitHub contributions',
        HttpStatus.BAD_GATEWAY,
      );
    }

    const svg = await response.text();
    this.cache = { data: svg, timestamp: Date.now() };
    return svg;
  }
}
