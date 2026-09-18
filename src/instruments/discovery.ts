/**
 * Instrument discovery.
 *
 * Instruments advertise themselves on the local network. Discovery is passive: the gateway
 * listens for advertisements and reports what it has seen within the freshness window. It
 * never initiates a connection, so an instrument mid-run is never interrupted.
 */

export interface DiscoveredInstrument {
  instrumentId: string;
  model: string;
  firmwareVersion: string;
  address: string;
  lastSeen: string;
}

const FRESHNESS_WINDOW_MS = 60_000;

const seen = new Map<string, DiscoveredInstrument>();

export function noteAdvertisement(instrument: DiscoveredInstrument): void {
  seen.set(instrument.instrumentId, instrument);
}

/** Instruments advertised within the freshness window, newest first. */
export function discover(now: Date = new Date()): DiscoveredInstrument[] {
  const cutoff = now.getTime() - FRESHNESS_WINDOW_MS;
  return [...seen.values()]
    .filter((i) => Date.parse(i.lastSeen) >= cutoff)
    .sort((a, b) => Date.parse(b.lastSeen) - Date.parse(a.lastSeen));
}
