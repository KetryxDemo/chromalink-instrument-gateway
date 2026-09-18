/**
 * Append-only audit log.
 *
 * Every state change that affects acquired sample or run data must be recorded here.
 * Entries are immutable once written; corrections are appended, never edited in place.
 */

export type AuditEvent =
  | 'instrument.paired'
  | 'instrument.unpaired'
  | 'instrument.connection_lost'
  | 'instrument.connection_restored'
  | 'run.ingested'
  | 'run.backfilled';

export interface AuditEntry {
  event: AuditEvent;
  instrumentId: string;
  actor: string;
  at: string;
  detail?: Record<string, string | number | boolean>;
}

const entries: AuditEntry[] = [];

export function record(
  event: AuditEvent,
  instrumentId: string,
  actor: string,
  detail?: Record<string, string | number | boolean>,
): void {
  entries.push({ event, instrumentId, actor, at: new Date().toISOString(), detail });
}

export function entriesFor(instrumentId: string): readonly AuditEntry[] {
  return entries.filter((e) => e.instrumentId === instrumentId);
}
