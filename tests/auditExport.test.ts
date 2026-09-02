import { describe, expect, it } from 'vitest';
import { record } from '../src/audit/auditLog.js';
import { exportRange } from '../src/audit/auditExport.js';

describe('audit export', () => {
  it('produces a content hash over the exported range', () => {
    record('instrument.paired', 'EXP-1', 'admin', { organisationId: 'ORG-A' });
    const out = exportRange('EXP-1', new Date(Date.now() - 60_000), new Date(Date.now() + 60_000));
    expect(out.entries.length).toBeGreaterThan(0);
    expect(out.contentHash).toMatch(/^sha-lite:/);
  });
});
