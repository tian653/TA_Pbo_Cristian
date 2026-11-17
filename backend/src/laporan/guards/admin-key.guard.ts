import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const adminKey = this.configService.get<string>('ADMIN_KEY');

    // Kalau ADMIN_KEY tidak diset di environment, tolak semua request
    if (!adminKey || adminKey.trim() === '') {
      throw new ForbiddenException(
        'Endpoint ini memerlukan konfigurasi ADMIN_KEY di server',
      );
    }

    const providedKey = request.headers['x-admin-key'] as string;

    // Header tidak ada atau kosong
    if (!providedKey || providedKey.trim() === '') {
      throw new UnauthorizedException('Header x-admin-key diperlukan');
    }

    // Timing-safe comparison untuk mencegah timing attack
    try {
      const adminKeyBuffer = Buffer.from(adminKey, 'utf8');
      const providedKeyBuffer = Buffer.from(providedKey, 'utf8');

      // Pastikan length sama untuk timingSafeEqual
      if (adminKeyBuffer.length !== providedKeyBuffer.length) {
        throw new UnauthorizedException('Kunci petugas tidak valid');
      }

      const isValid = crypto.timingSafeEqual(adminKeyBuffer, providedKeyBuffer);

      if (!isValid) {
        throw new UnauthorizedException('Kunci petugas tidak valid');
      }

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Kunci petugas tidak valid');
    }
  }
}
