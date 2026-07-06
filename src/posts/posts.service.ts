import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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

  async findAll(lang?: string, page = 1, limit = 20, search?: string, tag?: string, categorySlug?: string): Promise<{ posts: Post[]; total: number; page: number; totalPages: number }> {
    const where: any = { published: true };

    if (tag) {
      where.tags = Like(`%${tag}%`);
    }
    if (search) {
      where.title = Like(`%${search}%`);
    }
    if (categorySlug) {
      const cat = await this.postRepository.manager
        .getRepository('categories')
        .findOne({ where: { slug: categorySlug } });
      if (cat) where.categoryId = cat.id;
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { category: true },
    });

    return {
      posts: lang ? posts.map((p) => mapLang(p, lang)) : posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllAdmin(lang?: string): Promise<Post[]> {
    const posts = await this.postRepository.find({
      order: { createdAt: 'DESC' },
      relations: { category: true },
    });
    return lang ? posts.map((p) => mapLang(p, lang)) : posts;
  }

  async findBySlug(slug: string, lang?: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: { category: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return lang ? mapLang(post, lang) : post;
  }

  async findOne(id: number, lang?: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!post) throw new NotFoundException('Post not found');
    return lang ? mapLang(post, lang) : post;
  }

  async incrementViews(id: number): Promise<void> {
    await this.postRepository.increment({ id }, 'views', 1);
  }

  async findRelated(postId: number, tags: string, lang?: string, limit = 3): Promise<Post[]> {
    if (!tags) return [];
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (tagList.length === 0) return [];

    const conditions = tagList.map((t) => ({
      published: true,
      id: postId,
      tags: Like(`%${t}%`),
    }));

    const posts = await this.postRepository
      .createQueryBuilder('post')
      .where('post.published = :pub', { pub: true })
      .andWhere('post.id != :id', { id: postId })
      .andWhere(
        conditions.map((_, i) => `post.tags LIKE :tag${i}`).join(' OR '),
        conditions.reduce((acc, c, i) => ({ ...acc, [`tag${i}`]: c.tags.value }), {}),
      )
      .orderBy('post.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return lang ? posts.map((p) => mapLang(p, lang)) : posts;
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
      categoryId: dto.categoryId,
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
    if (dto.categoryId !== undefined) post.categoryId = dto.categoryId;
    if (dto.published !== undefined) post.published = dto.published;

    return this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  async getRssFeed(lang?: string): Promise<{ title: string; description: string; link: string; items: any[] }> {
    const { posts } = await this.findAll(lang, 1, 50);
    return {
      title: 'Iman Norouzi Asfajir - Blog',
      description: 'Latest blog posts from Iman Norouzi Asfajir',
      link: 'https://marmaryshop.com',
      items: posts.map((p) => ({
        title: p.title,
        description: p.excerpt || p.content?.slice(0, 300),
        link: `https://marmaryshop.com/#blog/post/${p.slug}`,
        pubDate: p.createdAt,
        guid: p.slug,
      })),
    };
  }
}
