import { Module } from '@nestjs/common';
import { CuacaService } from './cuaca.service';

@Module({
  providers: [CuacaService],
  exports: [CuacaService],
})
export class CuacaModule {}

