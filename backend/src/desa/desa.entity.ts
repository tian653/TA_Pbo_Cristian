import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Laporan } from '../laporan/laporan.entity';

export enum StatusDesa {
  AMAN = 'AMAN',
  WASPADA = 'WASPADA',
  SIAGA = 'SIAGA',
  AWAS = 'AWAS',
}

@Entity()
export class Desa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nama: string;

  @Column()
  kecamatan: string;

  @Column({
    type: 'enum',
    enum: StatusDesa,
    default: StatusDesa.AMAN,
  })
  status: StatusDesa;

  @Column({ type: 'int', default: 0 })
  skor: number;

  // Kode wilayah BMKG tingkat desa (adm4), contoh: "12.11.01.2001"
  // Null bila kode belum diketahui; endpoint /desa/:id/cuaca tetap merespons tanpa error
  @Column({ nullable: true, type: 'varchar', length: 20 })
  adm4: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Laporan, (laporan) => laporan.desa)
  laporan: Laporan[];
}
