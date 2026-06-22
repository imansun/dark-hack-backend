import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SubscribersService } from './subscribers.service';
import { Subscriber } from './subscriber.entity';
import { TurnstileService } from '../common/turnstile.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';

@ApiTags('Subscribers')
@Controller('api/subscribers')
export class SubscribersController {
  constructor(
    private readonly service: SubscribersService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Subscribe to newsletter', description: 'Subscribe an email to the newsletter. Requires Turnstile captcha verification.' })
  @ApiBody({ type: CreateSubscriberDto })
  @ApiResponse({ status: 201, description: 'Successfully subscribed', type: Subscriber })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Captcha verification failed' })
  @ApiResponse({ status: 409, description: 'Email already subscribed' })
  async subscribe(@Body() dto: CreateSubscriberDto): Promise<Subscriber> {
    await this.turnstile.verify(dto.turnstileToken);
    return this.service.subscribe(dto.email);
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from newsletter', description: 'Unsubscribe an email from the newsletter. Requires Turnstile captcha verification.' })
  @ApiBody({ type: CreateSubscriberDto })
  @ApiResponse({ status: 200, description: 'Successfully unsubscribed' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Captcha verification failed' })
  async unsubscribe(@Body() dto: CreateSubscriberDto): Promise<{ message: string }> {
    await this.turnstile.verify(dto.turnstileToken);
    await this.service.unsubscribe(dto.email);
    return { message: 'Successfully unsubscribed' };
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

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subscriber (admin)', description: 'Permanently remove a subscriber (admin only).' })
  @ApiParam({ name: 'id', type: Number, description: 'Subscriber ID' })
  @ApiResponse({ status: 204, description: 'Subscriber deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
