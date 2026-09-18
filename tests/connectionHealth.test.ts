import { describe, expect, it } from 'vitest';
import { heartbeat, markOffline, healthOf } from '../src/instruments/connectionHealth.js';

describe('connection health', () => {
  it('reports the drop reason when a link goes down', () => {
    heartbeat('INST-9');
    markOffline('INST-9', 'heartbeat_timeout');
    expect(healthOf('INST-9')?.state).toBe('offline');
    expect(healthOf('INST-9')?.dropReason).toBe('heartbeat_timeout');
  });
});
