import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

const SUFFIX_MAP = { en: '_en' as const, ar: '_ar' as const };

function mapLang(post: Post, lang?: string): Post {
  if (!lang || lang === 'fa') return post;
  const suffix = SUFFIX_MAP[lang as keyof typeof SUFFIX_MAP];
  if (!suffix) return post;
  return {
    ...post,
    title: (post as any)[`title${suffix}`] || post.title,
    content: (post as any)[`content${suffix}`] || post.content,
    excerpt: (post as any)[`excerpt${suffix}`] || post.excerpt,
  };
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(lang?: string): Promise<Post[]> {
    const posts = await this.postRepository.find({
      where: { published: true },
      order: { createdAt: 'DESC' },
    });
    return lang ? posts.map((p) => mapLang(p, lang)) : posts;
  }

  async findAllAdmin(): Promise<Post[]> {
    return this.postRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findBySlug(slug: string, lang?: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { slug } });
    if (!post) throw new NotFoundException('Post not found');
    return lang ? mapLang(post, lang) : post;
  }

  async findOne(id: number, lang?: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return lang ? mapLang(post, lang) : post;
  }

  async create(dto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      title: dto.title,
      title_en: dto.title_en,
      title_ar: dto.title_ar,
      content: dto.content,
      content_en: dto.content_en,
      content_ar: dto.content_ar,
      excerpt: dto.excerpt,
      excerpt_en: dto.excerpt_en,
      excerpt_ar: dto.excerpt_ar,
      imageUrl: dto.imageUrl,
      slug: dto.slug,
      tags: dto.tags,
      published: dto.published ?? true,
    });
    return this.postRepository.save(post);
  }

  async update(id: number, dto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.title_en !== undefined) post.title_en = dto.title_en;
    if (dto.title_ar !== undefined) post.title_ar = dto.title_ar;
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.content_en !== undefined) post.content_en = dto.content_en;
    if (dto.content_ar !== undefined) post.content_ar = dto.content_ar;
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
    if (dto.excerpt_en !== undefined) post.excerpt_en = dto.excerpt_en;
    if (dto.excerpt_ar !== undefined) post.excerpt_ar = dto.excerpt_ar;
    if (dto.imageUrl !== undefined) post.imageUrl = dto.imageUrl;
    if (dto.slug !== undefined) post.slug = dto.slug;
    if (dto.tags !== undefined) post.tags = dto.tags;
    if (dto.published !== undefined) post.published = dto.published;

    return this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }
}
