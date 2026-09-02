import { describe, expect, it } from 'vitest';
import { delayForAttempt, shouldRetry, DEFAULT_BUDGET } from '../src/transport/retryPolicy.js';

describe('retry policy', () => {
  it('caps the delay at the configured maximum', () => {
    expect(delayForAttempt(20)).toBeLessThanOrEqual(DEFAULT_BUDGET.maxDelayMs);
  });
  it('stops retrying once the budget is spent', () => {
    expect(shouldRetry(DEFAULT_BUDGET.maxAttempts)).toBe(false);
  });
});
