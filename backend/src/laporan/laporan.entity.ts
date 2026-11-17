import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { Desa } from '../desa/desa.entity';

export enum JenisLaporan {
  LONGSOR = 'LONGSOR',
  BANJIR = 'BANJIR',
  RETAKAN_TANAH = 'RETAKAN_TANAH',
  JALAN_RUSAK = 'JALAN_RUSAK',
}

export enum StatusLaporan {
  BARU = 'BARU',
  DIVERIFIKASI = 'DIVERIFIKASI',
  DITANGANI = 'DITANGANI',
  SELESAI = 'SELESAI',
}

@Entity()
export class Laporan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: JenisLaporan,
  })
  jenis: JenisLaporan;

  @Column({ type: 'text' })
  deskripsi: string;

  @Column({ type: 'float', nullable: true })
  lat: number;

  @Column({ type: 'float', nullable: true })
  lng: number;

  @Column({
    type: 'enum',
    enum: StatusLaporan,
    default: StatusLaporan.BARU,
  })
  status: StatusLaporan;

  @ManyToOne(() => Desa, (desa) => desa.laporan, { eager: false })
  @JoinColumn({ name: 'desaId' })
  desa: Desa;

  @Column({ type: 'uuid' })
  desaId: string;

  // Kode wilayah BMKG tingkat desa (adm4), format: "xx.xx.xx.xxxx" (misal: "12.11.01.1010")
  @Index()
  @Check(`"adm4" IS NULL OR "adm4" ~ '^\\d{2}\\.\\d{2}\\.\\d{2}\\.\\d{4}$'`)
  @Column({ type: 'varchar', length: 16, nullable: true })
  adm4: string | null;

  // URL foto laporan dari Supabase Storage
  @Column({ type: 'text', nullable: true })
  fotoUrl: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
