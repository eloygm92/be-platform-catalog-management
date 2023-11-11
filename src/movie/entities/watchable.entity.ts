import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Provider } from "../../provider/entities/provider.entity";

@Entity()
export class Watchable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  original_name: string;

  @Column()
  external_id: number;

  @Column()
  overview: string;

  @Column()
  vote_average: number;

  @Column()
  vote_count: number;

  @Column({ type: 'enum', enum: ['movie', 'serie'] })
  type: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP(6)' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updated_at: Date;

  @ManyToMany(() => Provider, (provider) => provider.watchables)
  provider: Provider[];
}
