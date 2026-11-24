import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginRateLimitGuard } from './login-rate-limit.guard.js';

function configWith(values: Record<string, string | undefined> = {}): ConfigService {
  return {
    get: (key: string) => values[key],
  } as unknown as ConfigService;
}

function contextForIp(ip: string) {
  const headers: Record<string, string> = {};
  const context = {
    switchToHttp: () => ({
      getRequest: () => ({ ip }),
      getResponse: () => ({
        setHeader: (name: string, value: string) => {
          headers[name] = value;
        },
      }),
    }),
  } as unknown as ExecutionContext;
  return { context, headers };
}

describe('LoginRateLimitGuard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the configured limit and sets rate-limit headers', () => {
    const guard = new LoginRateLimitGuard(
      configWith({ LOGIN_RATE_LIMIT_MAX: '2', LOGIN_RATE_LIMIT_WINDOW_MS: '10000' }),
    );

    const first = contextForIp('10.0.0.1');
    expect(guard.canActivate(first.context)).toBe(true);
    expect(first.headers['X-RateLimit-Limit']).toBe('2');
    expect(first.headers['X-RateLimit-Remaining']).toBe('1');

    const second = contextForIp('10.0.0.1');
    expect(guard.canActivate(second.context)).toBe(true);
    expect(second.headers['X-RateLimit-Remaining']).toBe('0');
  });

  it('blocks requests above the limit with 429 and Retry-After', () => {
    const guard = new LoginRateLimitGuard(
      configWith({ LOGIN_RATE_LIMIT_MAX: '2', LOGIN_RATE_LIMIT_WINDOW_MS: '30000' }),
    );

    guard.canActivate(contextForIp('10.0.0.1').context);
    guard.canActivate(contextForIp('10.0.0.1').context);

    const third = contextForIp('10.0.0.1');
    try {
      guard.canActivate(third.context);
      expect.unreachable('Expected rate limit exception');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
    expect(third.headers['Retry-After']).toBe('30');
  });

  it('isolates limits per client IP and resets after the window expires', () => {
    const guard = new LoginRateLimitGuard(
      configWith({ LOGIN_RATE_LIMIT_MAX: '1', LOGIN_RATE_LIMIT_WINDOW_MS: '5000' }),
    );

    expect(guard.canActivate(contextForIp('10.0.0.1').context)).toBe(true);
    expect(() => guard.canActivate(contextForIp('10.0.0.1').context)).toThrow(HttpException);

    // Different IP is unaffected
    expect(guard.canActivate(contextForIp('10.0.0.2').context)).toBe(true);

    // Window expires for the first IP
    vi.advanceTimersByTime(5001);
    expect(guard.canActivate(contextForIp('10.0.0.1').context)).toBe(true);
  });
});
