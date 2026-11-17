import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('returns the config when required variables are present', () => {
    const config = { MONGODB_URI: 'mongodb://localhost/test', JWT_SECRET: 'secret', PORT: '3000' };

    expect(validateEnv(config)).toBe(config);
  });

  it('lists every missing required variable', () => {
    expect(() => validateEnv({})).toThrow('MONGODB_URI, JWT_SECRET');
  });

  it('fails when only one variable is missing', () => {
    expect(() => validateEnv({ MONGODB_URI: 'mongodb://localhost/test' })).toThrow(
      'JWT_SECRET',
    );
  });

  it('treats an empty value as missing', () => {
    expect(() => validateEnv({ MONGODB_URI: '', JWT_SECRET: 'secret' })).toThrow('MONGODB_URI');
  });
});
