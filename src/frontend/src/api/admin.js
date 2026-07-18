import { apiFetch } from './client';

export async function getRepresentatives({ activeOnly = false } = {}) {
  const params = activeOnly ? '?activeOnly=true' : '';
  return apiFetch(`/admin/representatives${params}`);
}

export async function getCustomers() {
  return apiFetch('/admin/customers');
}

export async function createRepresentative(data) {
  return apiFetch('/admin/representatives', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRepresentative(id, data) {
  return apiFetch(`/admin/representatives/${id}/permissions`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getDefaultPermissions() {
  return apiFetch('/admin/default-permissions');
}
