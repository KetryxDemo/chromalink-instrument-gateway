/**
 * Heartbeat monitoring.
 *
 * Instruments heartbeat on a fixed interval. The monitor converts silence into an explicit
 * offline state with a reason, rather than leaving an instrument indefinitely "last seen a
 * while ago". An operator must be able to tell a dead link from a quiet one.
 */

import { markOffline, heartbeat } from './connectionHealth.js';

export interface MonitorOptions {
  timeoutSeconds: number;
}

const lastBeat = new Map<string, number>();

export function recordBeat(instrumentId: string, at: Date = new Date()): void {
  lastBeat.set(instrumentId, at.getTime());
  heartbeat(instrumentId);
}

/** Marks every instrument whose last beat is older than the timeout as offline. */
export function sweep(options: MonitorOptions, now: Date = new Date()): string[] {
  const cutoff = now.getTime() - options.timeoutSeconds * 1000;
  const timedOut: string[] = [];
  for (const [instrumentId, beat] of lastBeat) {
    if (beat < cutoff) {
      markOffline(instrumentId, 'heartbeat_timeout');
      timedOut.push(instrumentId);
    }
  }
  return timedOut;
}
