import { apiFetch } from './client';

export function getDashboardStats() {
  return apiFetch('/dashboard/stats');
}

export function getAdminDashboardStats() {
  return apiFetch('/admin/dashboard-stats');
}
