import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export interface AuthenticatedAdmin {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AuthenticatedAdmin;
}

interface JwtPayload {
  sub?: unknown;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (typeof payload?.sub !== 'string' || payload.sub.trim() === '') {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.admin = { id: payload.sub };
    return true;
  }
}
