import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Watchable } from '../../watchable/entities/watchable.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Provider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  /*@Column({ length: 50 })
  type: string;*/

  @Column()
  external_id: number;

  @Column({ length: 50 })
  logo_path: string;

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

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at: Date;

  @ManyToMany(() => Watchable, (watchable) => watchable.provider)
  @JoinTable({
    name: 'provider_watchable',
    joinColumn: { name: 'provider_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'watchable_id', referencedColumnName: 'id' },
  })
  watchables: Watchable[];

  @ManyToMany(() => User, (user) => user.providers, {
    orphanedRowAction: 'delete',
  })
  users: User[];
}
