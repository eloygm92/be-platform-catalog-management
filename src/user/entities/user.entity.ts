import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Watchlist } from '../../watchlist/entities/watchlist.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'varchar', length: 80 })
  password: string;

  @Column({ type: 'varchar', length: 80 })
  refresh_token: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  deactivate_at: Date;

  @OneToMany(() => Watchlist, (watchlist) => watchlist.user)
  watchlists: Watchlist[];
}
