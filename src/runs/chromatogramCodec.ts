/**
 * Chromatogram encoding.
 *
 * Detector signal arrives as a delta-encoded stream to keep instrument bandwidth low. The
 * codec is the only place that interprets that encoding. A decode that cannot be completed
 * raises rather than returning a truncated trace, because a truncated chromatogram is
 * indistinguishable from a real one that simply ended early.
 */

export class DecodeError extends Error {}

/** Decode a delta-encoded signal into absolute detector values. */
export function decodeSignal(deltas: readonly number[], expectedLength?: number): number[] {
  if (deltas.length === 0) {
    throw new DecodeError('Signal contains no samples');
  }
  const out: number[] = [];
  let running = 0;
  for (const d of deltas) {
    if (!Number.isFinite(d)) {
      throw new DecodeError('Signal contains a non-finite sample');
    }
    running += d;
    out.push(running);
  }
  if (expectedLength !== undefined && out.length !== expectedLength) {
    throw new DecodeError(
      `Decoded ${out.length} samples but the instrument declared ${expectedLength}`,
    );
  }
  return out;
}

export function encodeSignal(absolute: readonly number[]): number[] {
  const out: number[] = [];
  let previous = 0;
  for (const value of absolute) {
    out.push(value - previous);
    previous = value;
  }
  return out;
}
