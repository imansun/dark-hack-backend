import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CommentsService } from './comments.service';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TurnstileService } from '../common/turnstile.service';

@ApiTags('Comments')
@Controller('api/comments')
export class CommentsController {
  constructor(
    private readonly service: CommentsService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Get('post/:postId')
  @ApiOperation({
    summary: 'Get approved comments for a post',
    description:
      'Returns only approved comments for the given post, ordered by newest first.',
  })
  @ApiParam({ name: 'postId', type: Number, description: 'Post ID' })
  @ApiResponse({
    status: 200,
    description: 'List of approved comments',
    type: [Comment],
  })
  async findByPost(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Comment[]> {
    return this.service.findByPost(postId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all comments (admin)',
    description:
      'Returns all comments including unapproved, with post relation.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all comments',
    type: [Comment],
  })
  async findAll(): Promise<Comment[]> {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Submit a comment',
    description:
      'Submit a comment on a post. Requires Turnstile captcha verification. Must be approved by admin before appearing.',
  })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment created (pending approval)',
    type: Comment,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Captcha verification failed' })
  async create(@Body() dto: CreateCommentDto): Promise<Comment> {
    await this.turnstile.verify(dto.turnstileToken);
    return this.service.create(dto);
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve a comment',
    description:
      'Mark a comment as approved so it appears on the post page (admin only).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment approved', type: Comment })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async approve(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.service.approve(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Delete a comment permanently (admin only).',
  })
  @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
