import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laporan } from './laporan.entity';
import { LaporanService } from './laporan.service';
import { LaporanController } from './laporan.controller';
import { DesaModule } from '../desa/desa.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Laporan]), DesaModule, StorageModule],
  providers: [LaporanService],
  controllers: [LaporanController],
  exports: [LaporanService],
})
export class LaporanModule {}
