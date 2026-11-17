import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Laporan } from './laporan.entity';
import { DesaService } from '../desa/desa.service';
import { StorageService } from '../storage/storage.service';
import { CreateLaporanDto } from './dto/create-laporan.dto';
import { UpdateLaporanStatusDto } from './dto/update-laporan-status.dto';

@Injectable()
export class LaporanService {
  constructor(
    @InjectRepository(Laporan)
    private readonly laporanRepository: Repository<Laporan>,
    private readonly desaService: DesaService,
    private readonly storageService: StorageService,
  ) {}

  findAll(query: { jenis?: string; desaId?: string; showSelesai?: string }): Promise<Laporan[]> {
    const qb = this.laporanRepository
      .createQueryBuilder('laporan')
      .leftJoinAndSelect('laporan.desa', 'desa')
      .orderBy('laporan.createdAt', 'DESC');

    if (query.jenis) {
      qb.andWhere('laporan.jenis = :jenis', { jenis: query.jenis });
    }
    if (query.desaId) {
      qb.andWhere('laporan.desaId = :desaId', { desaId: query.desaId });
    }

    // Default: hide laporan dengan status SELESAI (kecuali explicit request showSelesai=true)
    if (query.showSelesai !== 'true') {
      qb.andWhere('laporan.status != :statusSelesai', { statusSelesai: 'SELESAI' });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Laporan> {
    const laporan = await this.laporanRepository.findOne({
      where: { id },
      relations: ['desa'],
    });
    if (!laporan) {
      throw new NotFoundException(`Laporan dengan id ${id} tidak ditemukan`);
    }
    return laporan;
  }

  async create(dto: CreateLaporanDto, foto?: Express.Multer.File): Promise<Laporan> {
    const desa = await this.desaService.findOne(dto.desaId);
    const adm4 = dto.adm4 || desa?.adm4 || null;
    
    let fotoUrl: string | null = null;
    if (foto) {
      fotoUrl = await this.storageService.uploadFoto(foto);
    }
    
    const laporan = this.laporanRepository.create({ ...dto, adm4, fotoUrl });
    const saved = await this.laporanRepository.save(laporan);
    await this.desaService.recalculateScore(dto.desaId);
    return this.findOne(saved.id);
  }

  async updateStatus(id: string, dto: UpdateLaporanStatusDto): Promise<Laporan> {
    const laporan = await this.findOne(id);
    laporan.status = dto.status;
    const updated = await this.laporanRepository.save(laporan);
    await this.desaService.recalculateScore(updated.desaId);
    return this.findOne(updated.id);
  }

  async delete(id: string): Promise<void> {
    const laporan = await this.findOne(id);
    
    // Hapus foto dari storage jika ada
    if (laporan.fotoUrl) {
      await this.storageService.deleteFoto(laporan.fotoUrl);
    }
    
    // Hapus laporan dari database
    await this.laporanRepository.remove(laporan);
    
    // Recalculate skor desa setelah laporan dihapus
    await this.desaService.recalculateScore(laporan.desaId);
  }
}
