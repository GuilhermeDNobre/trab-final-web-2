import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard, type AuthenticatedRequest } from './jwt-auth.guard.js';

function contextWith(authorization?: string) {
  const request = { headers: { authorization } } as AuthenticatedRequest;
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { context, request };
}

describe('JwtAuthGuard', () => {
  const jwtService = { verifyAsync: vi.fn() };
  let guard: JwtAuthGuard;

  beforeEach(() => {
    vi.resetAllMocks();
    guard = new JwtAuthGuard(jwtService as unknown as JwtService);
  });

  it('allows a request with a valid Bearer token and attaches the admin payload', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'admin-1' });
    const { context, request } = contextWith('Bearer valid-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(request.admin).toEqual({ id: 'admin-1' });
  });

  it('rejects a request without Authorization header', async () => {
    const { context } = contextWith(undefined);
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a non-Bearer scheme', async () => {
    const { context } = contextWith('Basic abc123');
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('rejects an empty Bearer token', async () => {
    const { context } = contextWith('Bearer ');
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an invalid or expired token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
    const { context } = contextWith('Bearer expired');

    await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
  });

  it('rejects a token without a valid subject', async () => {
    jwtService.verifyAsync.mockResolvedValue({});
    const { context } = contextWith('Bearer token-without-sub');

    await expect(guard.canActivate(context)).rejects.toThrow('Invalid or expired token');
  });
});
