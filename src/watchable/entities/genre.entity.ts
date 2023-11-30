import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Watchable } from "./watchable.entity";

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 30, nullable: true })
  name: string;

  @Column({ type: "int", nullable: true })
  external_id: number;

  @ManyToMany(() => Watchable, (watchable) => watchable.genres)
  @JoinTable({
    name: 'watchable_genre',
    joinColumn: { name: 'genre_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'watchable_id', referencedColumnName: 'id' },
  })
  watchables: Watchable[];

}