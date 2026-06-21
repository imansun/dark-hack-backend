import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Work } from './works.entity';

@Entity('work_badges')
export class WorkBadge {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Parent work ID' })
  @Column()
  workId: number;

  @ApiProperty({
    description: 'Badge label (e.g. HTML, CSS, React)',
    maxLength: 50,
  })
  @Column({ length: 50 })
  name: string;

  @ManyToOne(() => Work, (work) => work.badges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;
}
