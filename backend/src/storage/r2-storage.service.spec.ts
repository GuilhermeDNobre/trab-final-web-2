import { PutObjectCommand } from '@aws-sdk/client-s3';
import {
  BadRequestException,
  PayloadTooLargeException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { R2StorageService } from './r2-storage.service.js';
import { MAX_IMAGE_SIZE_BYTES } from './storage.constants.js';

const PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
]);
const JPEG_BUFFER = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const WEBP_BUFFER = Buffer.from('RIFF\x00\x00\x00\x00WEBP', 'latin1');

function configWith(values: Record<string, string | undefined>): ConfigService {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

describe('R2StorageService', () => {
  const send = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    send.mockResolvedValue({});
  });

  const configuredValues = {
    R2_ACCOUNT_ID: 'account-123',
    R2_ACCESS_KEY_ID: 'key-id',
    R2_SECRET_ACCESS_KEY: 'secret-key',
    R2_BUCKET_NAME: 'gean-bebidas',
    R2_PUBLIC_URL: 'https://cdn.geanbebidas.com/',
  };

  it('uploads a valid PNG to R2 and returns the public URL', async () => {
    const service = new R2StorageService(configWith(configuredValues), { send });

    const result = await service.uploadProductImage({
      buffer: PNG_BUFFER,
      mimetype: 'image/png',
      size: PNG_BUFFER.length,
      originalname: 'skol.png',
    });

    expect(result.imageUrl).toMatch(/^https:\/\/cdn\.geanbebidas\.com\/products\/[0-9a-f-]+\.png$/);
    expect(send).toHaveBeenCalledTimes(1);

    const command = send.mock.calls[0][0] as PutObjectCommand;
    expect(command).toBeInstanceOf(PutObjectCommand);
    expect(command.input).toMatchObject({
      Bucket: 'gean-bebidas',
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
      Body: PNG_BUFFER,
    });
  });

  it('uploads JPEG and WEBP with matching extensions', async () => {
    const service = new R2StorageService(configWith(configuredValues), { send });

    const jpg = await service.uploadProductImage({
      buffer: JPEG_BUFFER,
      mimetype: 'image/jpeg',
      size: JPEG_BUFFER.length,
    });
    const webp = await service.uploadProductImage({
      buffer: WEBP_BUFFER,
      mimetype: 'image/webp',
      size: WEBP_BUFFER.length,
    });

    expect(jpg.imageUrl).toMatch(/\.jpg$/);
    expect(webp.imageUrl).toMatch(/\.webp$/);
  });

  it('rejects a missing or empty file with 400', async () => {
    const service = new R2StorageService(configWith(configuredValues), { send });

    await expect(service.uploadProductImage(undefined)).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.uploadProductImage({ buffer: Buffer.alloc(0), mimetype: 'image/png', size: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects files larger than 5 MB with 413', async () => {
    const service = new R2StorageService(configWith(configuredValues), { send });

    await expect(
      service.uploadProductImage({
        buffer: PNG_BUFFER,
        mimetype: 'image/png',
        size: MAX_IMAGE_SIZE_BYTES + 1,
      }),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects unsupported MIME types such as SVG and spoofed image signatures', async () => {
    const service = new R2StorageService(configWith(configuredValues), { send });

    await expect(
      service.uploadProductImage({
        buffer: Buffer.from('<svg></svg>'),
        mimetype: 'image/svg+xml',
        size: 11,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.uploadProductImage({
        buffer: Buffer.from('not-really-a-png'),
        mimetype: 'image/png',
        size: 16,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(send).not.toHaveBeenCalled();
  });

  it('returns 503 when R2 is not configured', async () => {
    const service = new R2StorageService(configWith({}));

    await expect(
      service.uploadProductImage({
        buffer: PNG_BUFFER,
        mimetype: 'image/png',
        size: PNG_BUFFER.length,
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
