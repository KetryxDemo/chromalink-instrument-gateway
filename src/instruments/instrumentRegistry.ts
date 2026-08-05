/**
 * Instrument registry.
 *
 * The authoritative list of instruments this gateway is responsible for, and the model and
 * firmware level last reported by each. The registry is what an operator inspects to answer
 * "what is attached to this gateway, and what is it running".
 */

export interface RegistryEntry {
  instrumentId: string;
  organisationId: string;
  model: string;
  firmwareVersion: string;
  serialNumber: string;
  registeredAt: string;
  lastFirmwareChangeAt?: string;
}

const registry = new Map<string, RegistryEntry>();

export function register(entry: RegistryEntry): void {
  registry.set(entry.instrumentId, entry);
}

/** Records a firmware level change and when it was observed. */
export function noteFirmware(instrumentId: string, firmwareVersion: string): void {
  const entry = registry.get(instrumentId);
  if (!entry) return;
  if (entry.firmwareVersion !== firmwareVersion) {
    entry.firmwareVersion = firmwareVersion;
    entry.lastFirmwareChangeAt = new Date().toISOString();
  }
}

export function forOrganisation(organisationId: string): RegistryEntry[] {
  return [...registry.values()].filter((e) => e.organisationId === organisationId);
}

export function lookup(instrumentId: string): RegistryEntry | undefined {
  return registry.get(instrumentId);
}
