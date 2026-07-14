/**
 * Access control.
 *
 * Every read of acquired data is scoped to the organisation that owns the instrument that
 * produced it. Scoping is enforced here rather than at the API edge so that a new endpoint
 * cannot accidentally expose another organisation's runs by forgetting a filter.
 */

export class AccessDeniedError extends Error {}

export interface Principal {
  userId: string;
  organisationId: string;
  roles: string[];
}

export function assertCanReadInstrument(principal: Principal, instrumentOrgId: string): void {
  if (principal.organisationId !== instrumentOrgId) {
    throw new AccessDeniedError(
      `Principal ${principal.userId} may not read data for another organisation`,
    );
  }
}

export function hasRole(principal: Principal, role: string): boolean {
  return principal.roles.includes(role);
}
