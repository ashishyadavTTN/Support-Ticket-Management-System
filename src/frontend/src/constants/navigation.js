import { ROLES } from './roles';

const navItems = {
  [ROLES.ADMIN]: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
    { label: 'All Tickets', path: '/tickets', icon: 'tickets' },
    { label: 'Users', path: '/admin/users', icon: 'users' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
  ],
  [ROLES.REPRESENTATIVE]: [
    { label: 'Dashboard', path: '/rep/dashboard', icon: 'dashboard' },
    { label: 'Tickets', path: '/tickets', icon: 'tickets' },
    { label: 'Settings', path: '/rep/settings', icon: 'settings' },
  ],
  [ROLES.CUSTOMER]: [
    { label: 'Home', path: '/customer/dashboard', icon: 'dashboard' },
    { label: 'My Requests', path: '/tickets', icon: 'tickets' },
    { label: 'Settings', path: '/customer/settings', icon: 'settings' },
  ],
};

export function getNavItems(role) {
  return navItems[role] || [];
}
