import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Watchable } from '../../watchable/entities/watchable.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Watchlist {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Watchable, (watchable) => watchable.watchlists)
  @JoinColumn({ name: 'watchable_id' })
  watchable: Watchable;

  @ManyToOne(() => User, (user) => user.watchlists)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'boolean', nullable: false, default: false })
  view: boolean;
}
