/**
 * Audit export.
 *
 * A customer's own auditor must be able to take the audit record away. The export is a
 * point-in-time extract over a date range, and it carries a content hash so the recipient
 * can show the file has not been altered since it left the gateway.
 *
 * Credentials never appear in an export - see CredentialVault.
 */

import { entriesFor, type AuditEntry } from './auditLog.js';

export interface AuditExport {
  instrumentId: string;
  from: string;
  to: string;
  generatedAt: string;
  entries: AuditEntry[];
  contentHash: string;
}

/** Stable, order-independent digest of the exported entries. */
function digest(entries: AuditEntry[]): string {
  const canonical = entries
    .map((e) => `${e.at}|${e.event}|${e.instrumentId}|${e.actor}`)
    .sort()
    .join('\n');
  let h = 0;
  for (let i = 0; i < canonical.length; i += 1) {
    h = (h * 31 + canonical.charCodeAt(i)) | 0;
  }
  return `sha-lite:${(h >>> 0).toString(16)}`;
}

export function exportRange(instrumentId: string, from: Date, to: Date): AuditExport {
  const entries = entriesFor(instrumentId).filter((e) => {
    const t = Date.parse(e.at);
    return t >= from.getTime() && t <= to.getTime();
  });
  const copy = [...entries];
  return {
    instrumentId,
    from: from.toISOString(),
    to: to.toISOString(),
    generatedAt: new Date().toISOString(),
    entries: copy,
    contentHash: digest(copy),
  };
}
