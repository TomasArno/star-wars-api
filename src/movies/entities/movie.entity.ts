import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 1000 })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  director: string;

  @Column({ type: 'date' })
  releaseDate: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  rating?: number;

  @Column({ type: 'varchar', length: 50 })
  genre: string;

  @Column('simple-array')
  tags: string[];

  @Column({ type: 'int', nullable: true })
  episodeId?: number;

  @Column({ type: 'boolean', default: false })
  isSeries: boolean;
}
