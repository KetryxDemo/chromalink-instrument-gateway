import { describe, expect, it } from 'vitest';
import { assertCanReadInstrument, AccessDeniedError, type Principal } from '../src/security/accessControl.js';

const principal: Principal = { userId: 'u1', organisationId: 'ORG-A', roles: ['analyst'] };

describe('access control', () => {
  it('allows a read within the principal organisation', () => {
    expect(() => assertCanReadInstrument(principal, 'ORG-A')).not.toThrow();
  });
  it('denies a read across organisations', () => {
    expect(() => assertCanReadInstrument(principal, 'ORG-B')).toThrow(AccessDeniedError);
  });
});
