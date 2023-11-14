import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Watchlist } from '../../watchlist/entities/watchlist.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  username: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  deactivate_at: Date;

  @OneToMany(() => Watchlist, (watchlist) => watchlist.user)
  watchlists: Watchlist[];
}
