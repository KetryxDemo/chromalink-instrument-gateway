/**
 * Instrument pairing.
 *
 * Pairing binds a discovered instrument to one organisation. A paired instrument's runs flow
 * into that organisation's portal and nowhere else. Pairing is an explicit administrator
 * action and is always audited.
 */

import { record } from '../audit/auditLog.js';
import type { DiscoveredInstrument } from './discovery.js';

export interface PairedInstrument {
  instrumentId: string;
  organisationId: string;
  model: string;
  firmwareVersion: string;
  pairedAt: string;
}

export class PairingError extends Error {}

const paired = new Map<string, PairedInstrument>();

export function pair(
  instrument: DiscoveredInstrument,
  organisationId: string,
  actor: string,
): PairedInstrument {
  const existing = paired.get(instrument.instrumentId);
  if (existing && existing.organisationId !== organisationId) {
    throw new PairingError(
      `Instrument ${instrument.instrumentId} is already paired to another organisation`,
    );
  }

  const result: PairedInstrument = {
    instrumentId: instrument.instrumentId,
    organisationId,
    model: instrument.model,
    firmwareVersion: instrument.firmwareVersion,
    pairedAt: new Date().toISOString(),
  };
  paired.set(instrument.instrumentId, result);
  record('instrument.paired', instrument.instrumentId, actor, { organisationId });
  return result;
}

export function unpair(instrumentId: string, actor: string): void {
  paired.delete(instrumentId);
  record('instrument.unpaired', instrumentId, actor);
}

export function pairedInstrument(instrumentId: string): PairedInstrument | undefined {
  return paired.get(instrumentId);
}
