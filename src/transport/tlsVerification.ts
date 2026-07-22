/**
 * TLS verification for instrument links.
 *
 * Instrument links carry acquired data and pairing credentials. When TLS enforcement is on,
 * a certificate that fails verification aborts the connection; the gateway never downgrades
 * to an unverified link, because a silent downgrade would make an intercepted link
 * indistinguishable from a healthy one.
 */

export type TlsFailure = 'expired' | 'hostname_mismatch' | 'untrusted_issuer' | 'revoked';

export interface CertificateSummary {
  subject: string;
  issuer: string;
  notAfter: string;
  hostname: string;
}

export class TlsVerificationError extends Error {
  constructor(public readonly failure: TlsFailure, message: string) {
    super(message);
  }
}

export function verify(
  cert: CertificateSummary,
  expectedHostname: string,
  trustedIssuers: ReadonlySet<string>,
  now: Date = new Date(),
): void {
  if (Date.parse(cert.notAfter) < now.getTime()) {
    throw new TlsVerificationError('expired', `Certificate for ${cert.subject} has expired`);
  }
  if (cert.hostname !== expectedHostname) {
    throw new TlsVerificationError(
      'hostname_mismatch',
      `Certificate hostname ${cert.hostname} does not match ${expectedHostname}`,
    );
  }
  if (!trustedIssuers.has(cert.issuer)) {
    throw new TlsVerificationError('untrusted_issuer', `Issuer ${cert.issuer} is not trusted`);
  }
}
