import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PostsService } from './posts.service';
import { Post as PostEntity } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('Posts')
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({
    summary: 'List published posts',
    description:
      'Returns published blog posts with pagination, search, and tag filtering.',
  })
  @ApiQuery({ name: 'lang', required: false, enum: ['fa', 'en', 'ar'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated posts' })
  async getPosts(
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('tag') tag?: string,
    @Query('category') category?: string,
  ) {
    return this.postsService.findAll(
      lang,
      Number(page) || 1,
      Number(limit) || 20,
      search,
      tag,
      category,
    );
  }

  @Get('rss')
  @ApiOperation({
    summary: 'RSS Feed',
    description: 'Returns RSS XML feed of latest posts.',
  })
  async getRss(@Res() res: Response, @Query('lang') lang?: string) {
    const feed = await this.postsService.getRssFeed(lang);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${feed.title}</title>
    <description>${feed.description}</description>
    <link>${feed.link}</link>
    <atom:link href="${feed.link}/api/posts/rss" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${feed.items
      .map(
        (item) => `
    <item>
      <title>${item.title}</title>
      <description><![CDATA[${item.description}]]></description>
      <link>${item.link}</link>
      <guid>${item.guid}</guid>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
    </item>`,
      )
      .join('')}
  </channel>
</rss>`;
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all posts (admin)',
    description: 'Returns all posts including unpublished.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all posts',
    type: [PostEntity],
  })
  async getAdminPosts(@Query('lang') lang?: string): Promise<PostEntity[]> {
    return this.postsService.findAllAdmin(lang);
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get post by slug',
    description: 'Returns a single post by its URL slug.',
  })
  @ApiParam({ name: 'slug', description: 'Post slug' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fa', 'en', 'ar'] })
  @ApiResponse({ status: 200, description: 'Post found', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostBySlug(
    @Param('slug') slug: string,
    @Query('lang') lang?: string,
  ): Promise<PostEntity> {
    return this.postsService.findBySlug(slug, lang);
  }

  @Get(':id/related')
  @ApiOperation({
    summary: 'Get related posts',
    description:
      'Returns posts sharing the same tags, excluding the current post.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fa', 'en', 'ar'] })
  @ApiResponse({
    status: 200,
    description: 'Related posts',
    type: [PostEntity],
  })
  async getRelated(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ): Promise<PostEntity[]> {
    const post = await this.postsService.findOne(id);
    return this.postsService.findRelated(id, post.tags, lang);
  }

  @Post(':id/views')
  @ApiOperation({
    summary: 'Increment post view count',
    description: 'Increments the view counter for a post.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiResponse({ status: 204, description: 'View count incremented' })
  async incrementViews(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postsService.incrementViews(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create post',
    description: 'Create a new blog post.',
  })
  @ApiResponse({ status: 201, description: 'Post created', type: PostEntity })
  async create(@Body() dto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update post',
    description: 'Update an existing blog post.',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post updated', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post', description: 'Delete a blog post.' })
  @ApiParam({ name: 'id', type: Number, description: 'Post ID' })
  @ApiResponse({ status: 204, description: 'Post deleted' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postsService.remove(id);
  }
}
