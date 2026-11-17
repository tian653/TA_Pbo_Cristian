import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusLaporan } from '../laporan.entity';

export class UpdateLaporanStatusDto {
  @IsEnum(StatusLaporan)
  @IsNotEmpty()
  status: StatusLaporan;
}
