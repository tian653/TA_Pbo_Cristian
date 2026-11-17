import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Desa, StatusDesa } from '../desa/desa.entity';
import { Laporan } from '../laporan/laporan.entity';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Desa)
    private readonly desaRepository: Repository<Desa>,
    @InjectRepository(Laporan)
    private readonly laporanRepository: Repository<Laporan>,
  ) {}

  async onModuleInit() {
    const count = await this.desaRepository.count();

    // Jika sudah ada 15 desa master di database, tidak perlu seed ulang
    if (count === 15) {
      this.logger.log('Master data 15 kecamatan Kabupaten Dairi sudah siap. Data laporan bersih (tanpa dummy).');
      return;
    }

    this.logger.log('Menginisialisasi master 15 kecamatan resmi Kabupaten Dairi...');
    await this.laporanRepository.createQueryBuilder().delete().from(Laporan).execute();
    await this.desaRepository.createQueryBuilder().delete().from(Desa).execute();

    // 15 Desa / Kelurahan resmi mewakili 15 Kecamatan di Kabupaten Dairi
    // Kode adm4 dari repo resmi cahyadsn/wilayah & terverifikasi aktif pada API BMKG
    const desaData = [
      { nama: 'Sidikalang', kecamatan: 'Sidikalang', lat: 2.74997, lng: 98.31191, adm4: '12.11.01.1010' },
      { nama: 'Pegagan Julu I', kecamatan: 'Sumbul', lat: 2.74177, lng: 98.40870, adm4: '12.11.02.1007' },
      { nama: 'Sumbul Tengah', kecamatan: 'Tigalingga', lat: 2.86463, lng: 98.27397, adm4: '12.11.03.2001' },
      { nama: 'Sihorbo', kecamatan: 'Siempat Nempu', lat: 2.83576, lng: 98.16720, adm4: '12.11.04.2002' },
      { nama: 'Parongil', kecamatan: 'Silima Pungga Pungga', lat: 2.83316, lng: 98.14505, adm4: '12.11.05.1014' },
      { nama: 'Sukadame', kecamatan: 'Tanah Pinem', lat: 2.94155, lng: 98.31283, adm4: '12.11.06.2001' },
      { nama: 'Kuta Tengah', kecamatan: 'Siempat Nempu Hulu', lat: 2.79165, lng: 98.27513, adm4: '12.11.07.2002' },
      { nama: 'Lae Itam', kecamatan: 'Siempat Nempu Hilir', lat: 2.92299, lng: 97.98014, adm4: '12.11.08.2001' },
      { nama: 'Simanduma', kecamatan: 'Pegagan Hilir', lat: 2.80535, lng: 98.33404, adm4: '12.11.09.2001' },
      { nama: 'Lae Hole', kecamatan: 'Parbuluan', lat: 2.67026, lng: 98.41116, adm4: '12.11.10.2002' },
      { nama: 'Lae Parira', kecamatan: 'Lae Parira', lat: 2.79371, lng: 98.20520, adm4: '12.11.11.2003' },
      { nama: 'Gunung Sitember', kecamatan: 'Gunung Sitember', lat: 2.93998, lng: 98.16527, adm4: '12.11.12.2002' },
      { nama: 'Sambaliang', kecamatan: 'Berampu', lat: 2.74345, lng: 98.21982, adm4: '12.11.13.2001' },
      { nama: 'Silalahi I', kecamatan: 'Silahisabungan', lat: 2.79727, lng: 98.50907, adm4: '12.11.14.2002' },
      { nama: 'Sitinjo', kecamatan: 'Sitinjo', lat: 2.69807, lng: 98.36310, adm4: '12.11.15.2001' },
    ];

    await this.desaRepository.save(
      desaData.map((d) =>
        this.desaRepository.create({
          nama: d.nama,
          kecamatan: d.kecamatan,
          status: StatusDesa.AMAN,
          skor: 0,
          adm4: d.adm4,
        }),
      ),
    );

    this.logger.log('Master data 15 kecamatan tersimpan. Tidak ada data dummy laporan yang dibuat.');
  }
}
