/**
 * Local run store.
 *
 * Runs are held locally until the portal confirms receipt. The store is bounded: when the
 * offline queue limit is reached the gateway stops accepting new runs and reports the
 * condition, rather than discarding the oldest. Dropping acquired data silently is never
 * acceptable, so back-pressure is preferred to eviction.
 */

import type { Run } from '../runs/ingest.js';

export class QueueFullError extends Error {}

export class RunStore {
  private readonly pending: Run[] = [];
  private readonly confirmed = new Set<string>();

  constructor(private readonly limit: number) {}

  enqueue(run: Run): void {
    if (this.pending.length >= this.limit) {
      throw new QueueFullError(
        `Offline queue limit of ${this.limit} reached; refusing to accept further runs`,
      );
    }
    this.pending.push(run);
  }

  /** Runs awaiting portal confirmation, oldest first. */
  awaitingConfirmation(): readonly Run[] {
    return this.pending;
  }

  confirm(runId: string): void {
    const index = this.pending.findIndex((r) => r.runId === runId);
    if (index >= 0) {
      this.pending.splice(index, 1);
      this.confirmed.add(runId);
    }
  }

  isConfirmed(runId: string): boolean {
    return this.confirmed.has(runId);
  }

  get depth(): number {
    return this.pending.length;
  }
}
