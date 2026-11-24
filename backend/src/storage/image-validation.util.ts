import { BadRequestException } from '@nestjs/common';
import { ALLOWED_IMAGE_MIME_TYPES, type AllowedImageMimeType } from './storage.constants.js';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const AVIF_BRANDS = new Set(['avif', 'avis', 'mif1']);

function isAllowedMimeType(mimetype: string): mimetype is AllowedImageMimeType {
  return mimetype in ALLOWED_IMAGE_MIME_TYPES;
}

function matchesSignature(buffer: Buffer, mimeType: AllowedImageMimeType): boolean {
  switch (mimeType) {
    case 'image/jpeg':
      return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return buffer.length >= PNG_SIGNATURE.length && buffer.subarray(0, 8).equals(PNG_SIGNATURE);
    case 'image/webp':
      return (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    case 'image/gif': {
      if (buffer.length < 6) return false;
      const header = buffer.subarray(0, 6).toString('ascii');
      return header === 'GIF87a' || header === 'GIF89a';
    }
    case 'image/avif':
      return (
        buffer.length >= 12 &&
        buffer.subarray(4, 8).toString('ascii') === 'ftyp' &&
        AVIF_BRANDS.has(buffer.subarray(8, 12).toString('ascii'))
      );
  }
}

export function validateImageBuffer(buffer: Buffer, mimetype: string): AllowedImageMimeType {
  if (!isAllowedMimeType(mimetype) || !matchesSignature(buffer, mimetype)) {
    throw new BadRequestException('Unsupported image format. Allowed: JPEG, PNG, WEBP, GIF, AVIF');
  }
  return mimetype;
}
