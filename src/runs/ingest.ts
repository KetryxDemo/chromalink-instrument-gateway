/**
 * Run ingest.
 *
 * A completed run is accepted once and only once. The instrument supplies a monotonic
 * sequence number per acquisition; re-delivery of a sequence already held is discarded so a
 * retrying instrument cannot duplicate data in the portal.
 */

import { record } from '../audit/auditLog.js';

export interface Run {
  runId: string;
  instrumentId: string;
  sequence: number;
  sampleId: string;
  method: string;
  acquiredAt: string;
  signal: number[];
}

const accepted = new Map<string, Map<number, Run>>();

export function ingest(run: Run, actor = 'system'): boolean {
  const forInstrument = accepted.get(run.instrumentId) ?? new Map<number, Run>();
  if (forInstrument.has(run.sequence)) {
    return false;
  }
  forInstrument.set(run.sequence, run);
  accepted.set(run.instrumentId, forInstrument);
  record('run.ingested', run.instrumentId, actor, { runId: run.runId, sequence: run.sequence });
  return true;
}

export function runsFor(instrumentId: string): Run[] {
  const forInstrument = accepted.get(instrumentId);
  if (!forInstrument) return [];
  return [...forInstrument.values()].sort((a, b) => a.sequence - b.sequence);
}
