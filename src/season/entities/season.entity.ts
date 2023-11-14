import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Watchable } from '../../movie/entities/watchable.entity';
import { Episode } from '../../episode/entities/episode.entity';

@Entity()
export class Season {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Watchable, (watchable) => watchable.seasons)
  @JoinColumn({ name: 'watchable_id' })
  watchable: Watchable;

  @Column({ type: 'int', nullable: false })
  season_number: number;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ type: 'date', nullable: true })
  air_date: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  poster_path: string;

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

  @OneToMany(() => Episode, (episode) => episode.season, { cascade: true })
  episodes: Episode[];
}