import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuditLogService } from './audit-log.service';
import { AuditLog } from './audit-log.entity';

@ApiTags('Audit Logs')
@Controller('api/audit-logs')
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List audit logs (admin)', description: 'Returns paginated audit logs of all admin actions.' })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 50 })
  @ApiResponse({ status: 200, description: 'Paginated audit logs' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 50,
  ): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    return this.service.findAll(Number(page), Number(limit));
  }
}
