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

  @ManyToOne(() => Season, (season) => season.episodes)
  @JoinColumn({ name: 'season_id' })
  season: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: true, name: 'number' })
  episode_number: number;

  @Column({ type: 'text', nullable: true })
  overview: string;

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
