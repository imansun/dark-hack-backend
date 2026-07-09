import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async create(data: {
    action: string;
    entityType: string;
    entityId?: number;
    details?: string;
    adminUsername: string;
  }): Promise<AuditLog> {
    const log = this.repo.create(data);
    return this.repo.save(log);
  }

  async findAll(
    page = 1,
    limit = 50,
  ): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
