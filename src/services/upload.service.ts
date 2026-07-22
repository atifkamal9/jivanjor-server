import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { supabase } from '../config/supabase';
import { AppError, HttpCode } from '../utils/errors';

const DEFAULT_BUCKET = 'media';
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  // Images
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  // Videos
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  // Documents & Technical Resources
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  'text/csv': '.csv',
  // Archives
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
  'application/x-rar-compressed': '.rar',
  'application/vnd.rar': '.rar',
  'application/x-7z-compressed': '.7z',
  'application/x-tar': '.tar',
  'application/gzip': '.gz',
};

export interface UploadResult {
  url: string;
  path: string;
  bucket: string;
  size: number;
  mimeType: string;
}

export interface UploadInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  bucket?: string;
  folder?: string;
}

export class UploadService {
  /**
   * Upload a file buffer to Supabase Storage and return the public URL.
   */
  static async upload(input: UploadInput): Promise<UploadResult> {
    const { buffer, originalName, mimeType, size, bucket = DEFAULT_BUCKET, folder } = input;

    // 1. Validate file size
    if (size > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        `File too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
        HttpCode.BAD_REQUEST,
      );
    }

    // 2. Validate MIME type & Extension
    let extension = ALLOWED_MIME_TYPES[mimeType];

    if (!extension) {
      // Fallback extension check from original filename for unusual browser MIME types
      const fileExt = path.extname(originalName).toLowerCase();
      const allowedExtensions = [
        '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
        '.mp4', '.webm', '.mov',
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv',
        '.zip', '.rar', '.7z', '.tar', '.gz'
      ];
      if (allowedExtensions.includes(fileExt)) {
        extension = fileExt;
      }
    }

    if (!extension) {
      throw new AppError(
        `Unsupported file type: ${mimeType}. Allowed types: images, videos, PDF, Office documents (DOC, DOCX, XLS, XLSX, PPT, PPTX), text, CSV, and archives (ZIP, RAR, 7Z).`,
        HttpCode.BAD_REQUEST,
      );
    }

    // 3. Build a unique storage path: folder/uuid-originalname.ext
    const safeOriginalName = path.parse(originalName).name
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()
      .substring(0, 40);
    const uniqueFilename = `${uuidv4()}-${safeOriginalName}${extension}`;
    const storagePath = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

    // 4. Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error('Supabase Storage Error Details:', error);
      throw new AppError(`Storage upload failed: ${error.message}`, HttpCode.INTERNAL_SERVER_ERROR);
    }

    // 5. Get the public URL
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);

    return {
      url: publicUrlData.publicUrl,
      path: storagePath,
      bucket,
      size,
      mimeType,
    };
  }

  /**
   * Delete a file from Supabase Storage by its path.
   */
  static async delete(filePath: string, bucket: string = DEFAULT_BUCKET): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      throw new AppError(`Failed to delete file: ${error.message}`, HttpCode.INTERNAL_SERVER_ERROR);
    }
  }
}
