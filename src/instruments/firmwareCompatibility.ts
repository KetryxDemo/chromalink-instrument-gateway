/**
 * Firmware compatibility gate.
 *
 * Instruments below a known-good firmware level have been observed reporting a truncated
 * detector signal on long gradient methods. The acquisition still completes and the run
 * looks normal in the portal, so the defect is not visible downstream. Until those units
 * are updated the gateway refuses to pair them.
 *
 * Service engineers can override the gate in the field to recover an instrument that
 * cannot be updated on site.
 */

export const MINIMUM_FIRMWARE = '4.2.0';

/** Models exempt from the gate because they do not run gradient methods. */
const EXEMPT_MODELS = new Set(['CL-100-ISO']);

function parse(version: string): number[] {
  return version.split('.').map((part) => Number.parseInt(part, 10) || 0);
}

export function meetsMinimum(version: string, minimum = MINIMUM_FIRMWARE): boolean {
  const actual = parse(version);
  const required = parse(minimum);
  for (let i = 0; i < required.length; i += 1) {
    const a = actual[i] ?? 0;
    const r = required[i] ?? 0;
    if (a > r) return true;
    if (a < r) return false;
  }
  return true;
}

export interface CompatibilityVerdict {
  compatible: boolean;
  reason?: string;
}

export function checkCompatibility(model: string, firmwareVersion: string): CompatibilityVerdict {
  if (EXEMPT_MODELS.has(model)) {
    return { compatible: true };
  }
  if (!meetsMinimum(firmwareVersion)) {
    return {
      compatible: false,
      reason: `Firmware ${firmwareVersion} is below the minimum supported ${MINIMUM_FIRMWARE}`,
    };
  }
  return { compatible: true };
}
