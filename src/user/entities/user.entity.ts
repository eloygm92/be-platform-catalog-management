import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
