import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';
import { JenisLaporan } from '../laporan.entity';

export class CreateLaporanDto {
  @IsEnum(JenisLaporan)
  @IsNotEmpty()
  jenis: JenisLaporan;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  deskripsi: string;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;

  @IsUUID()
  @IsNotEmpty()
  desaId: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/, {
    message: 'adm4 harus berformat xx.xx.xx.xxxx (contoh: 12.11.01.1010)',
  })
  adm4?: string;
}
