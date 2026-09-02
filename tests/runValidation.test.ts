import { describe, expect, it } from 'vitest';
import { validateRun } from '../src/runs/runValidation.js';
import type { Run } from '../src/runs/ingest.js';

const base: Run = {
  runId: 'R-1', instrumentId: 'INST-1', sequence: 1, sampleId: 'S-1',
  method: 'gradient-A', acquiredAt: '2026-01-01T00:00:00.000Z', signal: [1, 2, 3],
};

describe('run validation', () => {
  it('accepts a well-formed run', () => {
    expect(validateRun(base, new Date('2026-01-02T00:00:00Z')).valid).toBe(true);
  });
  it('rejects an empty signal', () => {
    expect(validateRun({ ...base, signal: [] }, new Date('2026-01-02T00:00:00Z')).reason)
      .toBe('empty_signal');
  });
  it('rejects a missing sample id', () => {
    expect(validateRun({ ...base, sampleId: '  ' }, new Date('2026-01-02T00:00:00Z')).reason)
      .toBe('missing_sample_id');
  });
  it('rejects a run acquired beyond acceptable clock skew', () => {
    expect(validateRun(base, new Date('2025-01-01T00:00:00Z')).reason).toBe('acquired_in_future');
  });
});
