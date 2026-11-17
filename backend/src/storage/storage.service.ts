import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucketName = 'laporan-foto';

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase Storage not configured. Photo upload will not work.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
  }

  /**
   * Upload foto ke Supabase Storage
   * @param file Multer file object
   * @returns Public URL foto
   */
  async uploadFoto(file: Express.Multer.File): Promise<string> {
    if (!this.supabase) {
      throw new BadRequestException('Storage service not configured');
    }

    // Validate file first
    this.validateFoto(file);

    // Generate unique filename: timestamp_random_originalname
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = file.originalname.split('.').pop();
    const uniqueFilename = `${timestamp}_${randomStr}.${ext}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(uniqueFilename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  /**
   * Hapus foto dari Supabase Storage
   * @param fotoUrl Public URL foto
   */
  async deleteFoto(fotoUrl: string): Promise<void> {
    if (!this.supabase || !fotoUrl) return;

    try {
      // Extract filename from URL
      const filename = fotoUrl.split('/').pop();
      if (!filename) return;

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filename]);

      if (error) {
        console.error('Delete foto error:', error);
      }
    } catch (err) {
      console.error('Delete foto exception:', err);
    }
  }

  /**
   * Validasi file foto
   */
  validateFoto(file: Express.Multer.File): void {
    // Validasi size: max 5MB
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Ukuran foto maksimal 5MB');
    }

    // Validasi type: hanya jpg, jpeg, png
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Format foto harus JPG, PNG, atau WebP');
    }
  }

  private getContentType(ext: string): string {
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    return types[ext?.toLowerCase()] || 'image/jpeg';
  }
}
