import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Admin } from '../admins/admin.schema.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  let service: AuthService;
  let passwordHash: string;
  const select = vi.fn();
  const adminModel = { findOne: vi.fn(), findById: vi.fn() };
  const jwtService = { signAsync: vi.fn() };

  beforeAll(async () => {
    passwordHash = await hash('correct-password', 4);
  });

  beforeEach(async () => {
    vi.resetAllMocks();
    adminModel.findOne.mockReturnValue({ select });
    jwtService.signAsync.mockResolvedValue('signed-token');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(Admin.name), useValue: adminModel },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  it('returns a signed token for valid credentials', async () => {
    select.mockResolvedValue({ id: 'admin-1', password: passwordHash });

    await expect(
      service.login({ email: 'admin@geanbebidas.com', password: 'correct-password' }),
    ).resolves.toEqual({ token: 'signed-token' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'admin-1' });
  });

  it('normalizes the email before searching', async () => {
    select.mockResolvedValue({ id: 'admin-1', password: passwordHash });

    await service.login({ email: '  ADMIN@GeanBebidas.com ', password: 'correct-password' });

    expect(adminModel.findOne).toHaveBeenCalledWith({ email: 'admin@geanbebidas.com' });
  });

  it('rejects a wrong password', async () => {
    select.mockResolvedValue({ id: 'admin-1', password: passwordHash });

    await expect(
      service.login({ email: 'admin@geanbebidas.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('rejects an unknown email with the same error as a wrong password', async () => {
    select.mockResolvedValue(null);

    await expect(
      service.login({ email: 'nobody@example.com', password: 'whatever' }),
    ).rejects.toThrow('Invalid credentials');
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  describe('getProfile', () => {
    const validId = '64b000000000000000000001';

    it('returns the admin id and email when found', async () => {
      adminModel.findById.mockResolvedValue({
        id: validId,
        email: 'admin@geanbebidas.com',
        password: passwordHash,
      });

      await expect(service.getProfile(validId)).resolves.toEqual({
        id: validId,
        email: 'admin@geanbebidas.com',
      });
      expect(adminModel.findById).toHaveBeenCalledWith(validId);
    });

    it('rejects when the admin no longer exists', async () => {
      adminModel.findById.mockResolvedValue(null);

      await expect(service.getProfile(validId)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a malformed admin id without hitting the database', async () => {
      await expect(service.getProfile('not-an-id')).rejects.toBeInstanceOf(UnauthorizedException);
      expect(adminModel.findById).not.toHaveBeenCalled();
    });
  });
});
