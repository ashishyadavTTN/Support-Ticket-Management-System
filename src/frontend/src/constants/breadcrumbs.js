import { ROLES } from './roles';
import { formatTicketId } from '../utils/formatTicketId';

const ROOTS = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'Tickets', to: '/tickets' },
  ],
  [ROLES.REPRESENTATIVE]: [
    { label: 'Dashboard', to: '/rep/dashboard' },
    { label: 'Tickets', to: '/tickets' },
  ],
  [ROLES.CUSTOMER]: [
    { label: 'Home', to: '/customer/dashboard' },
    { label: 'My Requests', to: '/tickets' },
  ],
};

const ADMIN_REP_ROOT = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Representatives', to: '/admin/users' },
];

export function getTicketBreadcrumbs(role, ticketId) {
  const root = ROOTS[role] || ROOTS[ROLES.CUSTOMER];
  return [...root, { label: formatTicketId(ticketId), current: true }];
}

export function getRepresentativeBreadcrumbs(name) {
  return [...ADMIN_REP_ROOT, { label: name, current: true }];
}
