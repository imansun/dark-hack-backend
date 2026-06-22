import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SubscribersService } from './subscribers.service';
import { Subscriber } from './subscriber.entity';
import { TurnstileService } from '../common/turnstile.service';

@ApiTags('Subscribers')
@Controller('api/subscribers')
export class SubscribersController {
  constructor(
    private readonly service: SubscribersService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Subscribe to newsletter', description: 'Subscribe an email to the newsletter. Requires Turnstile captcha verification.' })
  @ApiBody({ schema: { type: 'object', required: ['email', 'turnstileToken'], properties: { email: { type: 'string', format: 'email', description: 'Subscriber email address' }, turnstileToken: { type: 'string', description: 'Cloudflare Turnstile token' } } } })
  @ApiResponse({ status: 201, description: 'Successfully subscribed', type: Subscriber })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Captcha verification failed' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(@Body() dto: { email: string; turnstileToken: string }): Promise<Subscriber> {
    await this.turnstile.verify(dto.turnstileToken);
    return this.service.subscribe(dto.email);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all subscribers (admin)', description: 'Returns all newsletter subscribers (admin only).' })
  @ApiResponse({ status: 200, description: 'List of subscribers', type: [Subscriber] })
  async findAll(): Promise<Subscriber[]> {
    return this.service.findAll();
  }
}
