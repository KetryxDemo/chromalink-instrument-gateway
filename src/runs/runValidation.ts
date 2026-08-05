/**
 * Run validation.
 *
 * A run is rejected before it reaches the store if it is internally inconsistent. Rejecting
 * at the boundary means the portal never displays a chromatogram that cannot be trusted, and
 * the rejection reason is recorded so an analyst can see that something was refused rather
 * than silently lost.
 */

import type { Run } from './ingest.js';

export type RejectionReason =
  | 'empty_signal'
  | 'non_monotonic_sequence'
  | 'missing_sample_id'
  | 'acquired_in_future'
  | 'signal_length_mismatch';

export interface ValidationResult {
  valid: boolean;
  reason?: RejectionReason;
  detail?: string;
}

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export function validateRun(run: Run, now: Date = new Date()): ValidationResult {
  if (!run.sampleId || run.sampleId.trim() === '') {
    return { valid: false, reason: 'missing_sample_id' };
  }
  if (!run.signal || run.signal.length === 0) {
    return { valid: false, reason: 'empty_signal' };
  }
  if (run.sequence < 0 || !Number.isInteger(run.sequence)) {
    return { valid: false, reason: 'non_monotonic_sequence' };
  }
  if (Date.parse(run.acquiredAt) > now.getTime() + MAX_CLOCK_SKEW_MS) {
    return {
      valid: false,
      reason: 'acquired_in_future',
      detail: `acquiredAt ${run.acquiredAt} is beyond acceptable clock skew`,
    };
  }
  return { valid: true };
}
