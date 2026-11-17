import { Module } from '@nestjs/common';
import { BmkgService } from './bmkg.service';
import { GempaService } from './gempa.service';
import { BmkgController } from './bmkg.controller';

@Module({
  providers: [BmkgService, GempaService],
  controllers: [BmkgController],
  exports: [BmkgService, GempaService],
})
export class BmkgModule {}

