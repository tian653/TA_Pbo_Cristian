import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesaModule } from './desa/desa.module';
import { LaporanModule } from './laporan/laporan.module';
import { SeederModule } from './seeder/seeder.module';
import { CuacaModule } from './cuaca/cuaca.module';
import { BmkgModule } from './bmkg/bmkg.module';
import { Desa } from './desa/desa.entity';
import { Laporan } from './laporan/laporan.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const isSsl =
          config.get<string>('DB_SSL') === 'true' ||
          (!!databaseUrl && !databaseUrl.includes('localhost'));

        return {
          type: 'postgres' as const,
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: config.get<string>('DB_HOST', 'localhost'),
                port: config.get<number>('DB_PORT', 5432),
                username: config.get<string>('DB_USER', 'dairi_user'),
                password: config.get<string>('DB_PASSWORD', 'dairi_pass'),
                database: config.get<string>('DB_NAME', 'dairi_db'),
              }),
          ssl: isSsl ? { rejectUnauthorized: false } : false,
          entities: [Desa, Laporan],
          synchronize: true,
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
      inject: [ConfigService],
    }),
    DesaModule,
    LaporanModule,
    SeederModule,
    CuacaModule,
    BmkgModule,
  ],
})
export class AppModule {}
