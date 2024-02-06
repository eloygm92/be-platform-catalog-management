import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Season } from '../../season/entities/season.entity';

@Entity()
export class Episode {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Season, (season) => season.episodes, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'season_id' })
  season: number;

  @Column({ type: 'varchar', length: 250, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: true, name: 'number' })
  episode_number: number;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'date', nullable: true })
  air_date: Date;

  @Column({ type: 'int', nullable: false })
  external_id: number;

  @Column({ type: 'int', nullable: true })
  vote_average: number;

  @Column({ type: 'int', nullable: true })
  vote_count: number;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;
}
