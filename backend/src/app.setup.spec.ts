import { describe, expect, it } from 'vitest';
import { parseCorsOrigin } from './app.setup.js';

describe('parseCorsOrigin', () => {
  it('defaults to wildcard when omitted or blank', () => {
    expect(parseCorsOrigin(undefined)).toBe('*');
    expect(parseCorsOrigin('')).toBe('*');
    expect(parseCorsOrigin('   ')).toBe('*');
  });

  it('returns a single origin as a string', () => {
    expect(parseCorsOrigin('http://localhost:5173')).toBe('http://localhost:5173');
    expect(parseCorsOrigin('  http://localhost:5173 , ')).toBe('http://localhost:5173');
  });

  it('parses a comma-separated list of origins', () => {
    expect(parseCorsOrigin('http://localhost:5173, https://gean-bebidas.vercel.app ')).toEqual([
      'http://localhost:5173',
      'https://gean-bebidas.vercel.app',
    ]);
  });

  it('falls back to wildcard when "*" is included in the list', () => {
    expect(parseCorsOrigin('*')).toBe('*');
    expect(parseCorsOrigin('http://localhost:5173, *')).toBe('*');
  });
});
