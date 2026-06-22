import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

@ApiTags('Categories')
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  async findAll(@Query('lang') lang?: string): Promise<Category[]> {
    return this.service.findAll(lang);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug' })
  async findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.service.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category' })
  async create(@Body() dto: { name: string; name_en?: string; name_ar?: string; slug: string }): Promise<Category> {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<{ name: string; name_en: string; name_ar: string; slug: string }>): Promise<Category> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
