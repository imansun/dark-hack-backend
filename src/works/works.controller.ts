import { Controller, Get } from '@nestjs/common';
import { WorksService } from './works.service';
import { Work } from './works.entity';

@Controller('api/works')
export class WorksController {
  constructor(private readonly worksService: WorksService) {}

  @Get()
  async getWorks(): Promise<Work[]> {
    return this.worksService.findAll();
  }
}
