import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ParseObjectIdPipe } from './parse-object-id.pipe.js';

describe('ParseObjectIdPipe', () => {
  const pipe = new ParseObjectIdPipe();

  it('accepts a valid 24 character hex id', () => {
    expect(pipe.transform('64b000000000000000000000')).toBe('64b000000000000000000000');
  });

  it('accepts uppercase hex', () => {
    expect(pipe.transform('64B00000000000000000000A')).toBe('64B00000000000000000000A');
  });

  it.each(['abc', '', '64b00000000000000000000', '64b0000000000000000000000', 'zzzzzzzzzzzzzzzzzzzzzzzz'])(
    'rejects "%s"',
    (value) => {
      expect(() => pipe.transform(value)).toThrow(BadRequestException);
    },
  );

  it('rejects a 12 character string, which Mongoose would treat as an ObjectId', () => {
    expect(() => pipe.transform('abcdefghijkl')).toThrow(BadRequestException);
  });
});
