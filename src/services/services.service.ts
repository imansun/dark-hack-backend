import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './services.entity';

function mapLang(svc: Service, lang?: string): Service {
  if (!lang || lang === 'fa') return svc;
  const suffix = `_${lang}` as 'en' | 'ar';
  return {
    ...svc,
    title: (svc as any)[`title${suffix}`] || svc.title,
    description: (svc as any)[`description${suffix}`] || svc.description,
  };
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async findAll(lang?: string): Promise<Service[]> {
    const services = await this.serviceRepository.find({
      order: { order: 'ASC' },
    });
    return services.map((s) => mapLang(s, lang));
  }

  async create(dto: Partial<Service>): Promise<Service> {
    const service = this.serviceRepository.create(dto);
    return this.serviceRepository.save(service);
  }

  async update(id: number, dto: Partial<Service>): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    Object.assign(service, dto);
    return this.serviceRepository.save(service);
  }

  async remove(id: number): Promise<void> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    await this.serviceRepository.remove(service);
  }
}
