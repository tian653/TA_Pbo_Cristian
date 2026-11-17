import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Desa } from './desa.entity';
import { DesaService } from './desa.service';
import { DesaController } from './desa.controller';
import { CuacaModule } from '../cuaca/cuaca.module';

@Module({
  imports: [TypeOrmModule.forFeature([Desa]), CuacaModule],
  providers: [DesaService],
  controllers: [DesaController],
  exports: [DesaService],
})
export class DesaModule {}
