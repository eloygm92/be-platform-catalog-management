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

  @Column({ type: 'number', nullable: false, name: 'user_id' })
  user_id: number;

  @Column({ type: 'number', nullable: false, name: 'watchable_id' })
  watchable_id: number;

  @Column({ type: 'boolean', nullable: false, default: false })
  view: boolean;
}
