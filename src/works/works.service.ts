import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Work } from './works.entity';
import { WorkBadge } from './work-badge.entity';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import * as fs from 'fs';
import * as path from 'path';

const SUFFIX_MAP = { en: '_en' as const, ar: '_ar' as const };

function mapLang(work: Work, lang?: string): Work {
  if (!lang || lang === 'fa') return work;
  const suffix = SUFFIX_MAP[lang as keyof typeof SUFFIX_MAP];
  if (!suffix) return work;
  return {
    ...work,
    title: (work as any)[`title${suffix}`] || work.title,
    description: (work as any)[`description${suffix}`] || work.description,
  };
}

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly workRepository: Repository<Work>,
    @InjectRepository(WorkBadge)
    private readonly badgeRepository: Repository<WorkBadge>,
  ) {}

  async findAll(lang?: string): Promise<Work[]> {
    const works = await this.workRepository.find({
      relations: { badges: true },
      order: { createdAt: 'DESC' },
    });
    return lang ? works.map((w) => mapLang(w, lang)) : works;
  }

  async findOne(id: number, lang?: string): Promise<Work> {
    const work = await this.workRepository.findOne({
      where: { id },
      relations: { badges: true },
    });
    if (!work) throw new NotFoundException('Work not found');
    return lang ? mapLang(work, lang) : work;
  }

  async create(dto: CreateWorkDto, imagePath?: string): Promise<Work> {
    const work = this.workRepository.create({
      title: dto.title,
      title_en: dto.title_en,
      title_ar: dto.title_ar,
      description: dto.description,
      description_en: dto.description_en,
      description_ar: dto.description_ar,
      projectUrl: dto.projectUrl,
      imageFit: dto.imageFit,
      imagePosition: dto.imagePosition,
      imageUrl: imagePath ?? undefined,
    });
    const saved = await this.workRepository.save(work);

    if (dto.badges?.length) {
      const badges = dto.badges.map((name) =>
        this.badgeRepository.create({ workId: saved.id, name }),
      );
      await this.badgeRepository.save(badges);
    }

    return this.findOne(saved.id);
  }

  async update(
    id: number,
    dto: UpdateWorkDto,
    imagePath?: string,
  ): Promise<Work> {
    const work = await this.findOne(id);

    if (dto.title !== undefined) work.title = dto.title;
    if (dto.title_en !== undefined) work.title_en = dto.title_en;
    if (dto.title_ar !== undefined) work.title_ar = dto.title_ar;
    if (dto.description !== undefined) work.description = dto.description;
    if (dto.description_en !== undefined)
      work.description_en = dto.description_en;
    if (dto.description_ar !== undefined)
      work.description_ar = dto.description_ar;
    if (dto.projectUrl !== undefined) work.projectUrl = dto.projectUrl;
    if (dto.imageFit !== undefined) work.imageFit = dto.imageFit;
    if (dto.imagePosition !== undefined) work.imagePosition = dto.imagePosition;

    if (imagePath) {
      if (work.imageUrl) {
        const oldPath = path.resolve(work.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      work.imageUrl = imagePath;
    }

    await this.workRepository.save(work);

    if (dto.badges !== undefined) {
      await this.badgeRepository.delete({ workId: id });
      if (dto.badges.length) {
        const badges = dto.badges.map((name) =>
          this.badgeRepository.create({ workId: id, name }),
        );
        await this.badgeRepository.save(badges);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const work = await this.findOne(id);
    if (work.imageUrl) {
      const filePath = path.resolve(work.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await this.workRepository.remove(work);
  }
}
