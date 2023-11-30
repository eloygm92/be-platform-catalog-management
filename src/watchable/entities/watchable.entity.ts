import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany, ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Provider } from '../../provider/entities/provider.entity';
import { Season } from '../../season/entities/season.entity';
import { Watchlist } from '../../watchlist/entities/watchlist.entity';
import { Genre } from "./genre.entity";

@Entity()
export class Watchable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 200, nullable: true })
  name: string;

  @Column({ type: "varchar", length: 250, nullable: true })
  original_name: string;

  @Column()
  external_id: number;

  @Column({ type: "text" })
  overview: string;

  @Column({ type: 'float', nullable: true })
  vote_average: number;

  @Column({ type: 'float', nullable: true})
  vote_count: number;

  @Column({ type: 'float', nullable: true})
  popularity: number;

  @Column({ type: 'enum', enum: ['movie', 'tv'] })
  type: string;

  @Column({ type: 'date', nullable: true })
  release_date: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  poster_path: string;

  @ManyToMany(() => Genre, (genre) => genre.watchables)
  genres: Genre[];

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

  @ManyToMany(() => Provider, (provider) => provider.watchables)
  provider: Provider[];

  @OneToMany(() => Season, (season) => season.watchable, { cascade: true })
  seasons: Season[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.watchable, {
    cascade: true,
  })
  watchlists: Watchlist[];
}
