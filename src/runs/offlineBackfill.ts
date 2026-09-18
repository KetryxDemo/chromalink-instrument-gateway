/**
 * Offline backfill.
 *
 * When an instrument reconnects it offers everything it acquired while the link was down.
 * Those runs must appear in the portal in acquisition order, not in the order the instrument
 * happened to hand them over, otherwise an analyst reading the queue sees history out of
 * sequence.
 */

import { record } from '../audit/auditLog.js';
import { ingest, type Run } from './ingest.js';

export interface BackfillResult {
  ingested: number;
  duplicatesDiscarded: number;
}

export function backfill(instrumentId: string, offered: Run[], actor = 'system'): BackfillResult {
  const inAcquisitionOrder = [...offered].sort((a, b) => a.sequence - b.sequence);

  let ingested = 0;
  let duplicatesDiscarded = 0;

  for (const run of inAcquisitionOrder) {
    if (ingest(run, actor)) {
      ingested += 1;
    } else {
      duplicatesDiscarded += 1;
    }
  }

  record('run.backfilled', instrumentId, actor, { ingested, duplicatesDiscarded });
  return { ingested, duplicatesDiscarded };
}
