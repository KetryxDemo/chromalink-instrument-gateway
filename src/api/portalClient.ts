/**
 * Portal client.
 *
 * Pushes confirmed runs to the ChromaLink Data Portal. Delivery is at-least-once and the
 * portal de-duplicates on run id, so a retry after an ambiguous failure cannot create a
 * duplicate record in the portal.
 */

import { delayForAttempt, shouldRetry } from '../transport/retryPolicy.js';
import type { Run } from '../runs/ingest.js';

export interface DeliveryOutcome {
  runId: string;
  delivered: boolean;
  attempts: number;
  lastError?: string;
}

export type Transport = (run: Run) => Promise<void>;

export async function deliver(run: Run, transport: Transport): Promise<DeliveryOutcome> {
  let attempt = 0;
  let lastError: string | undefined;

  while (shouldRetry(attempt)) {
    attempt += 1;
    try {
      await transport(run);
      return { runId: run.runId, delivered: true, attempts: attempt };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      await new Promise((resolve) => setTimeout(resolve, delayForAttempt(attempt)));
    }
  }

  return { runId: run.runId, delivered: false, attempts: attempt, lastError };
}
