import { describe, expect, it } from 'vitest';
import { observe, gapsFor } from '../src/runs/sequenceTracker.js';

describe('sequence tracking', () => {
  it('records a gap when a sequence is skipped', () => {
    observe('SEQ-A', 0);
    observe('SEQ-A', 3);
    expect(gapsFor('SEQ-A')).toEqual([1, 2]);
  });
  it('clears a gap when the missing sequence later arrives', () => {
    observe('SEQ-B', 0);
    observe('SEQ-B', 2);
    observe('SEQ-B', 1);
    expect(gapsFor('SEQ-B')).toEqual([]);
  });
});
