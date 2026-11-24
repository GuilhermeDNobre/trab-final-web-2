import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

const DEFAULT_MAX_ATTEMPTS = 10;
const DEFAULT_WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 1000;

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

function parsePositiveInt(raw: unknown, fallback: number): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

@Injectable()
export class LoginRateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitBucket>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(config: ConfigService) {
    this.maxAttempts = parsePositiveInt(
      config.get('LOGIN_RATE_LIMIT_MAX'),
      DEFAULT_MAX_ATTEMPTS,
    );
    this.windowMs = parsePositiveInt(
      config.get('LOGIN_RATE_LIMIT_WINDOW_MS'),
      DEFAULT_WINDOW_MS,
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const key = request.ip || request.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    if (this.buckets.size >= MAX_TRACKED_KEYS) {
      this.pruneExpired(now);
    }

    const existing = this.buckets.get(key);
    const bucket: RateLimitBucket =
      !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + this.windowMs }
        : existing;

    bucket.count += 1;
    this.buckets.set(key, bucket);

    const remaining = Math.max(0, this.maxAttempts - bucket.count);
    response.setHeader('X-RateLimit-Limit', String(this.maxAttempts));
    response.setHeader('X-RateLimit-Remaining', String(remaining));

    if (bucket.count > this.maxAttempts) {
      const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      response.setHeader('Retry-After', String(retryAfterSeconds));
      throw new HttpException(
        'Too many login attempts. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  reset(): void {
    this.buckets.clear();
  }

  private pruneExpired(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
