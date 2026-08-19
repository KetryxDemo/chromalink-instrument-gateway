/**
 * Gateway health endpoint.
 *
 * Reports whether the gateway itself is fit to accept data. It is deliberately conservative:
 * if the offline queue is near its limit or the portal is unreachable, the gateway reports
 * degraded rather than healthy, so a monitoring system escalates before data is refused.
 */

import { snapshot } from '../telemetry/metrics.js';

export type HealthState = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthReport {
  state: HealthState;
  queueDepth: number;
  queueLimit: number;
  portalReachable: boolean;
  counters: Record<string, number>;
  reportedAt: string;
}

export function report(
  queueDepth: number,
  queueLimit: number,
  portalReachable: boolean,
): HealthReport {
  let state: HealthState = 'healthy';
  if (!portalReachable || queueDepth >= queueLimit) {
    state = 'unhealthy';
  } else if (queueDepth > queueLimit * 0.8) {
    state = 'degraded';
  }
  return {
    state,
    queueDepth,
    queueLimit,
    portalReachable,
    counters: snapshot(),
    reportedAt: new Date().toISOString(),
  };
}
