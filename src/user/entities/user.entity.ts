import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Watchlist } from '../../watchlist/entities/watchlist.entity';
import { Role } from './role.entity';

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

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  deactivate_at: Date;

  @OneToMany(() => Watchlist, (watchlist) => watchlist.user)
  watchlists: Watchlist[];
}
