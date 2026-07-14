/**
 * Instrument credential storage.
 *
 * Pairing produces a per-instrument credential. Credentials are held only in memory and are
 * never written to the run store or the audit log, so an exported audit trail can be shared
 * with a customer's auditor without leaking the means to impersonate an instrument.
 */

export class CredentialVault {
  private readonly credentials = new Map<string, string>();

  store(instrumentId: string, secret: string): void {
    this.credentials.set(instrumentId, secret);
  }

  /** Returns true when the presented secret matches the stored one. */
  verify(instrumentId: string, presented: string): boolean {
    const stored = this.credentials.get(instrumentId);
    if (stored === undefined) return false;
    return timingSafeEqual(stored, presented);
  }

  revoke(instrumentId: string): void {
    this.credentials.delete(instrumentId);
  }
}

/** Constant-time comparison so a caller cannot discover a secret by timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
