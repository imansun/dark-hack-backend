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
import { PostsService } from './posts.service';
import { Post as PostEntity } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('Posts')
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'List published posts', description: 'Returns all published blog posts ordered by newest first.' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fa', 'en', 'ar'], description: 'Filter fields by language' })
  @ApiResponse({ status: 200, description: 'List of posts', type: [PostEntity] })
  async getPosts(@Query('lang') lang?: string): Promise<PostEntity[]> {
    return this.postsService.findAll(lang);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all posts (admin)', description: 'Returns all posts including unpublished.' })
  @ApiResponse({ status: 200, description: 'List of all posts', type: [PostEntity] })
  async getAdminPosts(): Promise<PostEntity[]> {
    return this.postsService.findAllAdmin();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get post by slug', description: 'Returns a single post by its URL slug.' })
  @ApiQuery({ name: 'lang', required: false, enum: ['fa', 'en', 'ar'], description: 'Filter fields by language' })
  @ApiResponse({ status: 200, description: 'Post found', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPostBySlug(@Param('slug') slug: string, @Query('lang') lang?: string): Promise<PostEntity> {
    return this.postsService.findBySlug(slug, lang);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create post', description: 'Create a new blog post.' })
  @ApiResponse({ status: 201, description: 'Post created', type: PostEntity })
  async create(@Body() dto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post', description: 'Update an existing blog post.' })
  @ApiResponse({ status: 200, description: 'Post updated', type: PostEntity })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto): Promise<PostEntity> {
    return this.postsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post', description: 'Delete a blog post.' })
  @ApiResponse({ status: 204, description: 'Post deleted' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postsService.remove(id);
  }
}
