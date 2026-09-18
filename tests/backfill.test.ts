import { describe, expect, it } from 'vitest';
import { backfill } from '../src/runs/offlineBackfill.js';
import { runsFor, type Run } from '../src/runs/ingest.js';

const run = (sequence: number): Run => ({
  runId: `R-${sequence}`,
  instrumentId: 'INST-1',
  sequence,
  sampleId: `S-${sequence}`,
  method: 'gradient-A',
  acquiredAt: new Date(Date.UTC(2026, 0, 1, 0, sequence)).toISOString(),
  signal: [0, 1, 2],
});

describe('offline backfill', () => {
  it('ingests offered runs in acquisition order regardless of delivery order', () => {
    backfill('INST-1', [run(3), run(1), run(2)]);
    expect(runsFor('INST-1').map((r) => r.sequence)).toEqual([1, 2, 3]);
  });

  it('discards a sequence already held rather than duplicating it', () => {
    const result = backfill('INST-1', [run(1), run(4)]);
    expect(result.duplicatesDiscarded).toBe(1);
    expect(result.ingested).toBe(1);
  });
});
