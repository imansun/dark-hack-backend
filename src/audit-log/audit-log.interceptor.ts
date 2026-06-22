import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from './audit-log.service';

const ENTITY_TYPES: Record<string, string> = {
  posts: 'Post',
  categories: 'Category',
  comments: 'Comment',
  contacts: 'Contact',
  services: 'Service',
  works: 'Work',
  profile: 'Profile',
  subscribers: 'Subscriber',
};

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    this.captureOldData(request);

    return next.handle().pipe(
      tap((responseBody) => {
        try {
          if (!request.user || request.user.role !== 'admin') return;

          const method = request.method;
          const routePath: string = request.route?.path || '';
          if (!routePath || method === 'GET') return;

          const adminUsername = request.user.username || 'unknown';

          let action: string;
          if (routePath.includes('/approve')) {
            action = 'APPROVE';
          } else if (routePath.includes('/unsubscribe')) {
            return;
          } else {
            switch (method) {
              case 'POST': action = 'CREATE'; break;
              case 'PUT': case 'PATCH': action = 'UPDATE'; break;
              case 'DELETE': action = 'DELETE'; break;
              default: return;
            }
          }

          const urlParts = routePath.replace('/api/', '').split('/');
          const rawType = urlParts[0];
          const entityType = ENTITY_TYPES[rawType] || rawType;

          let entityId: number | undefined;
          if (request.params?.id) {
            entityId = parseInt(request.params.id, 10) || undefined;
          } else if (responseBody?.id) {
            entityId = responseBody.id;
          }

          const sanitizedBody = request.body
            ? { ...request.body }
            : undefined;
          if (sanitizedBody) {
            delete sanitizedBody.turnstileToken;
            delete sanitizedBody.password;
          }

          const detailsObj: any = {
            body: sanitizedBody,
            params: request.params,
          };

          if (action === 'UPDATE' && request.__oldData && responseBody) {
            detailsObj.old = request.__oldData;
            detailsObj.new = responseBody;
            detailsObj.diff = this.computeDiff(request.__oldData, responseBody);
          }

          const details = JSON.stringify(detailsObj);

          this.auditLogService.create({
            action,
            entityType,
            entityId,
            details,
            adminUsername,
          }).catch(() => {});
        } catch {
          // Never let logging failures affect the main request
        }
      }),
    );
  }

  private async captureOldData(request: any): Promise<void> {
    try {
      if (!request.user || request.user.role !== 'admin') return;
      if (!['PUT', 'PATCH', 'DELETE'].includes(request.method)) return;
      if (!request.params?.id) return;

      const routePath: string = request.route?.path || '';
      const urlParts = routePath.replace('/api/', '').split('/');
      const rawType = urlParts[0];
      const entityType = ENTITY_TYPES[rawType];
      if (!entityType) return;

      const entityId = parseInt(request.params.id, 10);
      if (isNaN(entityId)) return;

      const repo = this.dataSource.getRepository(entityType);
      const old = await repo.findOne({ where: { id: entityId } as any });
      if (old) {
        request.__oldData = old;
      }
    } catch {
      // Silently fail if we can't fetch old data
    }
  }

  private computeDiff(oldData: any, newData: any): Record<string, { old: any; new: any }> {
    const skipKeys = new Set(['id', 'createdAt', 'updatedAt']);
    const diff: Record<string, { old: any; new: any }> = {};

    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);

    for (const key of allKeys) {
      if (skipKeys.has(key)) continue;
      const oldVal = oldData?.[key];
      const newVal = newData?.[key];

      if (key === 'imageUrl' || key === 'fileUrl') continue;

      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diff[key] = { old: oldVal, new: newVal };
      }
    }

    return diff;
  }
}
