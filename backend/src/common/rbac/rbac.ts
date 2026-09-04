/**
 * Dealer + end-user RBAC, adapted from Manufacturing `shared/domain/rbac.ts`
 * CRM roles (sales_rep / channel_manager / crm_admin) mapped onto this product:
 *   user   → buyer/renter (end user)
 *   agent  → sales_rep (dealer who lists and works leads)
 *   broker → channel_manager (team + territory)
 *   admin  → crm_admin
 */

export type AppRole = 'user' | 'agent' | 'broker' | 'lawyer' | 'mortgage' | 'admin';

export type RbacAction = 'create' | 'read' | 'update' | 'delete' | 'claim' | 'assign';

export type RbacResource = 'Property' | 'Lead' | 'Opportunity' | 'Suggestion' | 'User';

export type Permission = `${RbacResource}:${RbacAction}`;

const CRUD: RbacAction[] = ['create', 'read', 'update', 'delete'];

function perms(resource: RbacResource, actions: RbacAction[]): Permission[] {
  return actions.map((a) => `${resource}:${a}` as Permission);
}

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  user: [
    ...perms('Property', ['read']),
    ...perms('Lead', ['create', 'read']),
    ...perms('Suggestion', ['read']),
  ],
  agent: [
    ...perms('Property', CRUD),
    ...perms('Lead', [...CRUD, 'claim']),
    ...perms('Opportunity', CRUD),
    ...perms('Suggestion', ['read', 'update']),
  ],
  broker: [
    ...perms('Property', CRUD),
    ...perms('Lead', [...CRUD, 'claim', 'assign']),
    ...perms('Opportunity', CRUD),
    ...perms('Suggestion', ['read', 'update', 'assign']),
    ...perms('User', ['read']),
  ],
  lawyer: [...perms('Property', ['read']), ...perms('Lead', ['read'])],
  mortgage: [...perms('Property', ['read']), ...perms('Lead', ['read'])],
  admin: [
    ...perms('Property', [...CRUD, 'assign']),
    ...perms('Lead', [...CRUD, 'claim', 'assign']),
    ...perms('Opportunity', CRUD),
    ...perms('Suggestion', [...CRUD, 'assign']),
    ...perms('User', CRUD),
  ],
};

export const DEALER_ROLES: AppRole[] = ['agent', 'broker', 'admin'];

export function isDealerRole(role?: string): boolean {
  return DEALER_ROLES.includes(role as AppRole);
}

export function canDo(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const list = ROLE_PERMISSIONS[role as AppRole];
  if (!list) return false;
  return list.includes(permission);
}

export function canAccessAgentPortal(role?: string): boolean {
  return isDealerRole(role);
}
