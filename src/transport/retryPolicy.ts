/**
 * Retry policy.
 *
 * Transient transport failures are retried with exponential backoff and jitter. Retries are
 * bounded: an instrument that cannot be reached within the budget is reported offline rather
 * than retried indefinitely, so a genuinely failed link surfaces to the operator instead of
 * being hidden by a retry loop.
 */

export interface RetryBudget {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_BUDGET: RetryBudget = {
  maxAttempts: 5,
  baseDelayMs: 250,
  maxDelayMs: 8_000,
};

export function delayForAttempt(attempt: number, budget: RetryBudget = DEFAULT_BUDGET): number {
  const exponential = budget.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  const capped = Math.min(exponential, budget.maxDelayMs);
  const jitter = capped * 0.2 * Math.random();
  return Math.round(capped - jitter);
}

export function shouldRetry(attempt: number, budget: RetryBudget = DEFAULT_BUDGET): boolean {
  return attempt < budget.maxAttempts;
}
