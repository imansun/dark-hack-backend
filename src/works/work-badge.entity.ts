import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Work } from './works.entity';

@Entity('work_badges')
export class WorkBadge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workId: number;

  @Column({ length: 50 })
  name: string;

  @ManyToOne(() => Work, (work) => work.badges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workId' })
  work: Work;
}
