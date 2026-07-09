import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async findAll(lang?: string): Promise<Category[]> {
    const cats = await this.repo.find({ order: { id: 'ASC' } });
    if (!lang || lang === 'fa') return cats;
    return cats.map((c) => ({
      ...c,
      name:
        lang === 'en'
          ? c.name_en || c.name
          : lang === 'ar'
            ? c.name_ar || c.name
            : c.name,
    }));
  }

  async findOne(id: number): Promise<Category> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async findBySlug(slug: string): Promise<Category> {
    const cat = await this.repo.findOne({ where: { slug } });
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async create(dto: {
    name: string;
    name_en?: string;
    name_ar?: string;
    slug: string;
  }): Promise<Category> {
    const cat = this.repo.create(dto);
    return this.repo.save(cat);
  }

  async update(
    id: number,
    dto: Partial<{
      name: string;
      name_en: string;
      name_ar: string;
      slug: string;
    }>,
  ): Promise<Category> {
    const cat = await this.findOne(id);
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  async remove(id: number): Promise<void> {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
  }
}
