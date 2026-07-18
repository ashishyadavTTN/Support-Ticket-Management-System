export const ROLES = {
  ADMIN: 'admin',
  REPRESENTATIVE: 'representative',
  CUSTOMER: 'customer',
};

export const ROLE_LABELS = {
  admin: 'Administrator',
  representative: 'Representative',
  customer: 'Customer',
};

export function getDefaultRoute(role) {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.REPRESENTATIVE:
      return '/rep/dashboard';
    case ROLES.CUSTOMER:
      return '/customer/dashboard';
    default:
      return '/login';
  }
}
