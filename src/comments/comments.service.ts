import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly repo: Repository<Comment>,
  ) {}

  async findByPost(postId: number): Promise<Comment[]> {
    return this.repo.find({
      where: { postId, approved: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(): Promise<Comment[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
      relations: { post: true },
    });
  }

  async create(dto: {
    author: string;
    content: string;
    postId: number;
  }): Promise<Comment> {
    const comment = this.repo.create({ ...dto, approved: false });
    return this.repo.save(comment);
  }

  async approve(id: number): Promise<Comment> {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    comment.approved = true;
    return this.repo.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.repo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    await this.repo.remove(comment);
  }
}
