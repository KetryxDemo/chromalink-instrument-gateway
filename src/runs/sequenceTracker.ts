/**
 * Acquisition sequence tracking.
 *
 * Each instrument emits a monotonically increasing sequence number per acquisition. The
 * tracker records the highest sequence seen and the gaps, so the gateway can tell the
 * difference between "nothing was acquired" and "something was acquired and never arrived".
 * A silent gap is the failure mode that matters: the portal would look complete when it is not.
 */

export interface SequenceState {
  instrumentId: string;
  highestSeen: number;
  missing: number[];
}

const state = new Map<string, SequenceState>();

export function observe(instrumentId: string, sequence: number): SequenceState {
  const current =
    state.get(instrumentId) ?? { instrumentId, highestSeen: -1, missing: [] as number[] };

  if (sequence > current.highestSeen) {
    for (let s = current.highestSeen + 1; s < sequence; s += 1) {
      current.missing.push(s);
    }
    current.highestSeen = sequence;
  } else {
    current.missing = current.missing.filter((s) => s !== sequence);
  }

  state.set(instrumentId, current);
  return current;
}

export function gapsFor(instrumentId: string): number[] {
  return [...(state.get(instrumentId)?.missing ?? [])];
}
