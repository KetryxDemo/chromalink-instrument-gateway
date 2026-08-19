/**
 * Operational metrics.
 *
 * Counters an operator uses to tell whether the gateway is healthy without opening the audit
 * log. Metrics are operational only: they never carry sample identifiers or any acquired
 * data, so shipping them to a monitoring system does not export customer data.
 */

export type Counter =
  | 'runs_ingested'
  | 'runs_rejected'
  | 'runs_backfilled'
  | 'pairings_refused_firmware'
  | 'connection_drops'
  | 'queue_full_events';

const counters = new Map<Counter, number>();

export function increment(counter: Counter, by = 1): void {
  counters.set(counter, (counters.get(counter) ?? 0) + by);
}

export function snapshot(): Record<string, number> {
  return Object.fromEntries(counters);
}

export function reset(): void {
  counters.clear();
}
