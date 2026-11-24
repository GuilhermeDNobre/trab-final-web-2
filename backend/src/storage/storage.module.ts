import { Module } from '@nestjs/common';
import { R2StorageService } from './r2-storage.service.js';
import { R2_S3_CLIENT } from './storage.constants.js';

@Module({
  providers: [
    { provide: R2_S3_CLIENT, useValue: undefined },
    R2StorageService,
  ],
  exports: [R2StorageService],
})
export class StorageModule {}
