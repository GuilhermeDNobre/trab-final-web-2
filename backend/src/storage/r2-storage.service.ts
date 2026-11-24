import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  Inject,
  Injectable,
  Optional,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { validateImageBuffer } from './image-validation.util.js';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  R2_S3_CLIENT,
} from './storage.constants.js';

export interface UploadedImageFile {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
}

export interface R2ClientLike {
  send(command: PutObjectCommand): Promise<unknown>;
}

interface R2Config {
  bucketName: string;
  publicUrl: string;
}

@Injectable()
export class R2StorageService {
  private readonly client: R2ClientLike | null;
  private readonly r2Config: R2Config | null;

  constructor(
    config: ConfigService,
    @Optional() @Inject(R2_S3_CLIENT) injectedClient?: R2ClientLike,
  ) {
    const accountId = config.get<string>('R2_ACCOUNT_ID')?.trim();
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID')?.trim();
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY')?.trim();
    const bucketName = config.get<string>('R2_BUCKET_NAME')?.trim();
    const publicUrl = config.get<string>('R2_PUBLIC_URL')?.trim().replace(/\/+$/, '');

    if (bucketName && publicUrl && (injectedClient || (accountId && accessKeyId && secretAccessKey))) {
      this.r2Config = { bucketName, publicUrl };
      this.client =
        injectedClient ??
        new S3Client({
          region: 'auto',
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: accessKeyId!,
            secretAccessKey: secretAccessKey!,
          },
        });
    } else {
      this.r2Config = null;
      this.client = null;
    }
  }

  async uploadProductImage(file?: UploadedImageFile): Promise<{ imageUrl: string }> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Image file is required');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES || file.buffer.length > MAX_IMAGE_SIZE_BYTES) {
      throw new PayloadTooLargeException('Image must be at most 5 MB');
    }

    const mimeType = validateImageBuffer(file.buffer, file.mimetype);

    if (!this.client || !this.r2Config) {
      throw new ServiceUnavailableException('Image storage is not configured');
    }

    const extension = ALLOWED_IMAGE_MIME_TYPES[mimeType];
    const key = `products/${randomUUID()}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.r2Config.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return { imageUrl: `${this.r2Config.publicUrl}/${key}` };
  }
}
