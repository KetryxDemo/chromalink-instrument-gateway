import { describe, expect, it } from 'vitest';
import { decodeSignal, encodeSignal, DecodeError } from '../src/runs/chromatogramCodec.js';

describe('chromatogram codec', () => {
  it('round-trips an absolute signal', () => {
    const absolute = [5, 9, 4, 12];
    expect(decodeSignal(encodeSignal(absolute))).toEqual(absolute);
  });
  it('raises rather than returning a truncated trace', () => {
    expect(() => decodeSignal([1, 2, 3], 10)).toThrow(DecodeError);
  });
  it('rejects a non-finite sample', () => {
    expect(() => decodeSignal([1, Number.NaN])).toThrow(DecodeError);
  });
});
