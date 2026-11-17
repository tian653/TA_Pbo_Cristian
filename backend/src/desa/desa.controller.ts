import { Controller, Get, Param } from '@nestjs/common';
import { DesaService } from './desa.service';

@Controller('desa')
export class DesaController {
  constructor(private readonly desaService: DesaService) {}

  @Get()
  findAll() {
    return this.desaService.findAll();
  }

  // PENTING: rute spesifik /desa/:id/cuaca harus didaftarkan SEBELUM /desa/:id
  // agar NestJS tidak salah memetakan "cuaca" sebagai nilai :id
  @Get(':id/cuaca')
  getCuacaDesa(@Param('id') id: string) {
    return this.desaService.getCuacaDesa(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.desaService.findOne(id);
  }
}
