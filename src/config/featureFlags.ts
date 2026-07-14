/**
 * Feature flags.
 *
 * Flags gate behaviour that is not yet cleared for general release. A flag that is unknown
 * reads as disabled, so an unrecognised flag name can never silently enable behaviour.
 */

export type FlagName =
  | 'parallelIngest'
  | 'extendedDiagnostics'
  | 'strictSequenceChecking';

const defaults: Record<FlagName, boolean> = {
  parallelIngest: false,
  extendedDiagnostics: false,
  strictSequenceChecking: true,
};

let overrides: Partial<Record<FlagName, boolean>> = {};

export function isEnabled(flag: FlagName): boolean {
  return overrides[flag] ?? defaults[flag] ?? false;
}

export function applyOverrides(next: Partial<Record<FlagName, boolean>>): void {
  overrides = { ...next };
}
