import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LaporanService } from './laporan.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanStatusDto } from './dto/update-laporan-status.dto';
import { AdminKeyGuard } from './guards/admin-key.guard';
import { StatusLaporan } from './laporan.entity';

@Controller('laporan')
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Get()
  findAll(@Query() query: { jenis?: string; desaId?: string; showSelesai?: string }) {
    return this.laporanService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.laporanService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('foto'))
  create(
    @Body() dto: CreateLaporanDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    return this.laporanService.create(dto, foto);
  }

  @Patch(':id/status')
  @UseGuards(AdminKeyGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLaporanStatusDto,
  ) {
    // Validasi transisi status: BARU -> DIVERIFIKASI -> DITANGANI -> SELESAI
    const laporan = await this.laporanService.findOne(id);
    const currentStatus = laporan.status;
    const newStatus = dto.status;

    // Definisi urutan status yang valid
    const statusOrder = [
      StatusLaporan.BARU,
      StatusLaporan.DIVERIFIKASI,
      StatusLaporan.DITANGANI,
      StatusLaporan.SELESAI,
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    // Tolak jika status baru tidak ditemukan dalam enum
    if (newIndex === -1) {
      throw new BadRequestException(
        `Status ${newStatus} tidak valid. Status yang valid: ${statusOrder.join(', ')}`,
      );
    }

    // Tolak jika mundur atau sama
    if (newIndex <= currentIndex) {
      throw new BadRequestException(
        `Transisi status dari ${currentStatus} ke ${newStatus} tidak diperbolehkan. Status hanya bisa maju: ${statusOrder.join(' → ')}`,
      );
    }

    // Tolak jika lompat (harus berurutan)
    if (newIndex > currentIndex + 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      throw new BadRequestException(
        `Tidak bisa lompat dari ${currentStatus} ke ${newStatus}. Status berikutnya harus ${nextStatus}`,
      );
    }

    return this.laporanService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminKeyGuard)
  async delete(@Param('id') id: string) {
    await this.laporanService.delete(id);
    return { message: 'Laporan berhasil dihapus' };
  }
}
