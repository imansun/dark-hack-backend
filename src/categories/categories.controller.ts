import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'List all categories', description: 'Returns all categories with optional language filtering.' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fa', 'en', 'ar'], description: 'Filter fields by language' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [Category] })
  async findAll(@Query('lang') lang?: string): Promise<Category[]> {
    return this.service.findAll(lang);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get category by slug', description: 'Returns a single category by its URL slug.' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  @ApiResponse({ status: 200, description: 'Category found', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.service.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category', description: 'Create a new category (admin only).' })
  @ApiBody({ schema: { type: 'object', required: ['name', 'slug'], properties: { name: { type: 'string', description: 'Category name (Persian)' }, name_en: { type: 'string', description: 'Category name (English)' }, name_ar: { type: 'string', description: 'Category name (Arabic)' }, slug: { type: 'string', description: 'URL slug' } } } })
  @ApiResponse({ status: 201, description: 'Category created', type: Category })
  async create(@Body() dto: { name: string; name_en?: string; name_ar?: string; slug: string }): Promise<Category> {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category', description: 'Update an existing category (admin only).' })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', description: 'Category name (Persian)' }, name_en: { type: 'string', description: 'Category name (English)' }, name_ar: { type: 'string', description: 'Category name (Arabic)' }, slug: { type: 'string', description: 'URL slug' } } } })
  @ApiResponse({ status: 200, description: 'Category updated', type: Category })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<{ name: string; name_en: string; name_ar: string; slug: string }>): Promise<Category> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category', description: 'Delete a category (admin only).' })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
