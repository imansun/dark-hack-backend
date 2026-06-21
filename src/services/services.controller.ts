import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ServicesService } from './services.service';
import { Service } from './services.entity';

@ApiTags('Services')
@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary: 'List services',
    description: 'Returns all services ordered by their display order.',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    enum: ['fa', 'en', 'ar'],
    description: 'Filter fields by language',
  })
  @ApiResponse({
    status: 200,
    description: 'List of services',
    type: [Service],
  })
  async getServices(@Query('lang') lang?: string): Promise<Service[]> {
    return this.servicesService.findAll(lang);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create service',
    description: 'Create a new service (admin only).',
  })
  @ApiResponse({ status: 201, description: 'Service created', type: Service })
  async create(@Body() dto: Partial<Service>): Promise<Service> {
    return this.servicesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update service',
    description: 'Update a service (admin only).',
  })
  @ApiResponse({ status: 200, description: 'Service updated', type: Service })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<Service>,
  ): Promise<Service> {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete service',
    description: 'Delete a service (admin only).',
  })
  @ApiResponse({ status: 204, description: 'Service deleted' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.servicesService.remove(id);
  }
}
