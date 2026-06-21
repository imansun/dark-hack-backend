import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Work } from './works.entity';
import { WorkBadge } from './work-badge.entity';
import { WorksService } from './works.service';
import { WorksController } from './works.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Work, WorkBadge])],
  providers: [WorksService],
  controllers: [WorksController],
})
export class WorksModule {}
