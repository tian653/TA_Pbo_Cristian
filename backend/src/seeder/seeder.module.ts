
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Desa } from '../desa/desa.entity';
import { Laporan } from '../laporan/laporan.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [TypeOrmModule.forFeature([Desa, Laporan])],
  providers: [SeederService],
})
export class SeederModule { }
