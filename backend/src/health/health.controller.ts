import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Connection } from 'mongoose';

const CONNECTED = 1;

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: 'API and database connection status' })
  check() {
    if (this.connection.readyState !== CONNECTED) {
      throw new ServiceUnavailableException({ status: 'degraded', database: 'disconnected' });
    }
    return { status: 'ok', database: 'connected' };
  }
}
