import { describe, expect, it } from 'vitest';
import { verify, TlsVerificationError, type CertificateSummary } from '../src/transport/tlsVerification.js';

const cert: CertificateSummary = {
  subject: 'CN=inst-1', issuer: 'CN=ChromaLink Lab CA',
  notAfter: '2030-01-01T00:00:00.000Z', hostname: 'inst-1.lab.local',
};
const trusted = new Set(['CN=ChromaLink Lab CA']);

describe('TLS verification', () => {
  it('accepts a valid certificate', () => {
    expect(() => verify(cert, 'inst-1.lab.local', trusted)).not.toThrow();
  });
  it('rejects a hostname mismatch', () => {
    try { verify(cert, 'other.lab.local', trusted); } catch (e) {
      expect((e as TlsVerificationError).failure).toBe('hostname_mismatch');
    }
  });
  it('rejects an untrusted issuer', () => {
    try { verify(cert, 'inst-1.lab.local', new Set(['CN=Other'])); } catch (e) {
      expect((e as TlsVerificationError).failure).toBe('untrusted_issuer');
    }
  });
});
