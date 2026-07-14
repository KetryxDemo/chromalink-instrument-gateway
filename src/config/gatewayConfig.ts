/**
 * Gateway configuration.
 *
 * Configuration is read once at start-up and validated before any instrument connection is
 * attempted. A gateway that cannot prove its configuration is valid must not start: a
 * half-configured gateway that silently accepts runs is worse than one that refuses to run,
 * because the operator believes acquisition is covered when it is not.
 */

export interface GatewayConfig {
  /** Portal this gateway reports into. */
  portalBaseUrl: string;
  /** Organisation this gateway is licensed to. */
  organisationId: string;
  /** Seconds without a heartbeat before an instrument is considered offline. */
  heartbeatTimeoutSeconds: number;
  /** Maximum runs held locally when the portal is unreachable. */
  offlineQueueLimit: number;
  /** Whether TLS certificate verification is enforced on instrument links. */
  enforceTls: boolean;
}

export class ConfigurationError extends Error {}

const REQUIRED_KEYS: (keyof GatewayConfig)[] = [
  'portalBaseUrl',
  'organisationId',
  'heartbeatTimeoutSeconds',
  'offlineQueueLimit',
  'enforceTls',
];

export function validate(raw: Partial<GatewayConfig>): GatewayConfig {
  for (const key of REQUIRED_KEYS) {
    if (raw[key] === undefined || raw[key] === null) {
      throw new ConfigurationError(`Missing required configuration value: ${key}`);
    }
  }
  if (!/^https:\/\//.test(raw.portalBaseUrl!)) {
    throw new ConfigurationError('portalBaseUrl must use https');
  }
  if (raw.heartbeatTimeoutSeconds! <= 0) {
    throw new ConfigurationError('heartbeatTimeoutSeconds must be positive');
  }
  if (raw.offlineQueueLimit! <= 0) {
    throw new ConfigurationError('offlineQueueLimit must be positive');
  }
  return raw as GatewayConfig;
}
