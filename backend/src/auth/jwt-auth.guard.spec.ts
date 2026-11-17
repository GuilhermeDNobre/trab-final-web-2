import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from './jwt-auth.guard.js';

function contextWith(authorization?: string): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization } }) }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const jwtService = { verifyAsync: vi.fn() };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    vi.resetAllMocks();
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('allows a request with a valid Bearer token', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'admin-1' });

    await expect(guard.canActivate(contextWith('Bearer valid-token'))).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
  });

  it('rejects a request without Authorization header', async () => {
    await expect(guard.canActivate(contextWith(undefined))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a non-Bearer scheme', async () => {
    await expect(guard.canActivate(contextWith('Basic abc123'))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects an empty Bearer token', async () => {
    await expect(guard.canActivate(contextWith('Bearer '))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an invalid or expired token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(guard.canActivate(contextWith('Bearer expired'))).rejects.toThrow(
      'Invalid or expired token',
    );
  });
});
