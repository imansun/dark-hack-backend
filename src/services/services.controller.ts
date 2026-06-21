import { Controller, Get } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './services.entity';

@Controller('api/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async getServices(): Promise<Service[]> {
    return this.servicesService.findAll();
  }
}
