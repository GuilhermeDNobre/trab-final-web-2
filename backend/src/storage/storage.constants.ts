export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
} as const;

export type AllowedImageMimeType = keyof typeof ALLOWED_IMAGE_MIME_TYPES;

export const R2_S3_CLIENT = Symbol('R2_S3_CLIENT');
