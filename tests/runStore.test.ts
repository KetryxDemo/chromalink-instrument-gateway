import { describe, expect, it } from 'vitest';
import { RunStore, QueueFullError } from '../src/storage/runStore.js';
import type { Run } from '../src/runs/ingest.js';

const run = (n: number): Run => ({
  runId: `R-${n}`, instrumentId: 'I', sequence: n, sampleId: `S-${n}`,
  method: 'm', acquiredAt: new Date().toISOString(), signal: [1],
});

describe('run store', () => {
  it('applies back-pressure instead of evicting the oldest run', () => {
    const store = new RunStore(2);
    store.enqueue(run(1));
    store.enqueue(run(2));
    expect(() => store.enqueue(run(3))).toThrow(QueueFullError);
    expect(store.awaitingConfirmation().map((r) => r.runId)).toEqual(['R-1', 'R-2']);
  });
  it('removes a run once the portal confirms it', () => {
    const store = new RunStore(5);
    store.enqueue(run(1));
    store.confirm('R-1');
    expect(store.depth).toBe(0);
    expect(store.isConfirmed('R-1')).toBe(true);
  });
});
