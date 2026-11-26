import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Desa, StatusDesa } from './desa.entity';
import { StatusLaporan } from '../laporan/laporan.entity';
import { CuacaService, HasilCuaca } from '../cuaca/cuaca.service';

@Injectable()
export class DesaService {
  constructor(
    @InjectRepository(Desa)
    private readonly desaRepository: Repository<Desa>,
    private readonly cuacaService: CuacaService,
  ) {}

  /**
   * Hitung skor laporan berdasarkan status dan umur laporan.
   * BARU dalam 24 jam: +1, DIVERIFIKASI: +3, DITANGANI: +2, selain itu: 0.
   */
  private calculateSkorLaporan(laporan: Array<{ status: StatusLaporan; createdAt: Date }>): number {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    let skor = 0;
    for (const l of laporan) {
      if (l.status === StatusLaporan.BARU && new Date(l.createdAt) >= yesterday) {
        skor += 1;
      } else if (l.status === StatusLaporan.DIVERIFIKASI) {
        skor += 3;
      } else if (l.status === StatusLaporan.DITANGANI) {
        skor += 2;
      }
    }
    return skor;
  }

  /**
   * Petakan skor total ke StatusDesa.
   * <=2: AMAN, <=5: WASPADA, <=8: SIAGA, >8: AWAS.
   */
  private mapSkorToStatus(skor: number): StatusDesa {
    if (skor <= 2) return StatusDesa.AMAN;
    if (skor <= 5) return StatusDesa.WASPADA;
    if (skor <= 8) return StatusDesa.SIAGA;
    return StatusDesa.AWAS;
  }

  /**
   * Hitung status gabungan (skorLaporan + skorCuaca) untuk satu desa.
   * Dipanggil dari findAll dan findOne agar konsisten.
   */
  private async calculateCombinedStatus(desa: Desa): Promise<{
    skorLaporan: number;
    skorCuaca: number;
    skor: number;
    status: StatusDesa;
  }> {
    const skorLaporan = this.calculateSkorLaporan(desa.laporan || []);
    
    // Ambil cuaca dari cache (null jika gagal, pakai skorCuaca 0)
    const cuaca = desa.adm4 ? await this.cuacaService.getCuaca(desa.adm4) : null;
    const skorCuaca = cuaca?.skorCuaca ?? 0;

    const skor = skorLaporan + skorCuaca;
    const status = this.mapSkorToStatus(skor);

    return { skorLaporan, skorCuaca, skor, status };
  }

  
  async findAll(): Promise<Desa[]> {
    const desaList = await this.desaRepository.find({
      relations: ['laporan'],
      order: { nama: 'ASC' },
    });

   
    const results = await Promise.all(
      desaList.map(async (desa) => {
        try {
          const combined = await this.calculateCombinedStatus(desa);
          // Override field status dan skor dengan hasil gabungan
          desa.status = combined.status;
          desa.skor = combined.skor;
          return desa;
        } catch (err) {
          // Jika gagal, pakai skor laporan saja dengan skorCuaca 0
          const skorLaporan = this.calculateSkorLaporan(desa.laporan || []);
          desa.status = this.mapSkorToStatus(skorLaporan);
          desa.skor = skorLaporan;
          return desa;
        }
      })
    );

    return results;
  }

  /**
   * GET /desa/:id
   * Mengembalikan detail desa dengan status GABUNGAN.
   */
  async findOne(id: string): Promise<Desa> {
    const desa = await this.desaRepository.findOne({
      where: { id },
      relations: ['laporan'],
    });
    if (!desa) {
      throw new NotFoundException(`Desa dengan id ${id} tidak ditemukan`);
    }

    // Hitung status gabungan
    const combined = await this.calculateCombinedStatus(desa);
    desa.status = combined.status;
    desa.skor = combined.skor;

    return desa;
  }

  /**
   * Hitung ulang skor laporan dan simpan ke database.
   * Dipanggil setelah create/update laporan (laporan.service.ts baris 49, 57).
   * Kolom desa.skor dan desa.status tetap diisi, tapi bukan lagi sumber yang dibaca frontend.
   */
  async recalculateScore(desaId: string): Promise<Desa> {
    const desa = await this.desaRepository.findOne({
      where: { id: desaId },
      relations: ['laporan'],
    });
    if (!desa) {
      throw new NotFoundException(`Desa dengan id ${desaId} tidak ditemukan`);
    }

    const skorLaporan = this.calculateSkorLaporan(desa.laporan);
    const status = this.mapSkorToStatus(skorLaporan);

    desa.skor = skorLaporan;
    desa.status = status;

    return this.desaRepository.save(desa);
  }

  /**
   * GET /desa/:id/cuaca
   * Gabungkan skor laporan + skor cuaca BMKG, kembalikan detail beserta prakiraan.
   * Alasan desain: kalkulasi skor gabungan di backend agar frontend tetap hanya
   * memanggil API NestJS sendiri (syarat tugas).
   */
  async getCuacaDesa(id: string): Promise<{
    desa: { id: string; nama: string; kecamatan: string };
    skorLaporan: number;
    skorCuaca: number;
    skor: number;
    status: StatusDesa;
    prakiraan: HasilCuaca['prakiraan'] | null;
    sumber: 'BMKG';
    pesan?: string;
  }> {
    const desa = await this.desaRepository.findOne({
      where: { id },
      relations: ['laporan'],
    });
    if (!desa) {
      throw new NotFoundException(`Desa dengan id ${id} tidak ditemukan`);
    }

    // Gunakan fungsi terpusat
    const skorLaporan = this.calculateSkorLaporan(desa.laporan);

    // Ambil cuaca BMKG (null bila adm4 kosong atau gagal)
    const cuaca = desa.adm4 ? await this.cuacaService.getCuaca(desa.adm4) : null;
    const skorCuaca = cuaca?.skorCuaca ?? 0;

    const skor = skorLaporan + skorCuaca;
    const status = this.mapSkorToStatus(skor);

    const pesan = !desa.adm4
      ? 'Kode wilayah BMKG (adm4) belum dikonfigurasi untuk desa ini.'
      : cuaca === null
        ? 'Data cuaca sementara tidak tersedia. Coba beberapa saat lagi.'
        : undefined;

    return {
      desa: { id: desa.id, nama: desa.nama, kecamatan: desa.kecamatan },
      skorLaporan,
      skorCuaca,
      skor,
      status,
      prakiraan: cuaca?.prakiraan ?? null,
      sumber: 'BMKG',
      ...(pesan ? { pesan } : {}),
    };
  }
}
