import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SubscribersService } from './subscribers.service';
import { Subscriber } from './subscriber.entity';

@ApiTags('Subscribers')
@Controller('api/subscribers')
export class SubscribersController {
  constructor(private readonly service: SubscribersService) {}

  @Post()
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  async subscribe(@Body() dto: { email: string }): Promise<Subscriber> {
    return this.service.subscribe(dto.email);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all subscribers (admin)' })
  async findAll(): Promise<Subscriber[]> {
    return this.service.findAll();
  }
}
