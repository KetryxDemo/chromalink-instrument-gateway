/**
 * Connection health.
 *
 * A lab administrator needs to tell a real instrument fault from a transient network blip,
 * so the gateway reports the current state, when the instrument last reported, and the
 * reason the link dropped.
 */

import { record } from '../audit/auditLog.js';

export type LinkState = 'online' | 'offline';

export type DropReason =
  | 'network_unreachable'
  | 'instrument_powered_down'
  | 'credential_rejected'
  | 'heartbeat_timeout';

export interface ConnectionHealth {
  instrumentId: string;
  state: LinkState;
  lastReportedAt: string;
  dropReason?: DropReason;
}

const health = new Map<string, ConnectionHealth>();

export function heartbeat(instrumentId: string): void {
  const previous = health.get(instrumentId);
  health.set(instrumentId, {
    instrumentId,
    state: 'online',
    lastReportedAt: new Date().toISOString(),
  });
  if (previous?.state === 'offline') {
    record('instrument.connection_restored', instrumentId, 'system');
  }
}

export function markOffline(instrumentId: string, reason: DropReason): void {
  const previous = health.get(instrumentId);
  health.set(instrumentId, {
    instrumentId,
    state: 'offline',
    lastReportedAt: previous?.lastReportedAt ?? new Date().toISOString(),
    dropReason: reason,
  });
  record('instrument.connection_lost', instrumentId, 'system', { reason });
}

export function healthOf(instrumentId: string): ConnectionHealth | undefined {
  return health.get(instrumentId);
}
