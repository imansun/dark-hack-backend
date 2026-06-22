import { Controller, Get, Post, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';

@ApiTags('Comments')
@Controller('api/comments')
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Get('post/:postId')
  @ApiOperation({ summary: 'Get approved comments for a post' })
  async findByPost(@Param('postId', ParseIntPipe) postId: number): Promise<Comment[]> {
    return this.service.findByPost(postId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all comments (admin)' })
  async findAll(): Promise<Comment[]> {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Submit a comment (requires approval)' })
  async create(@Body() dto: { author: string; content: string; postId: number }): Promise<Comment> {
    return this.service.create(dto);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a comment' })
  async approve(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.service.approve(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
