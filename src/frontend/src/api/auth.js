import { apiFetch, refreshAccessTokenRequest } from './client';

export async function login({ email, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register({ name, email, password }) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

/** Uses raw fetch (no 401 retry) to avoid refresh loops. */
export async function refreshSession() {
  return refreshAccessTokenRequest();
}

export async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}

export async function getCurrentUser() {
  return apiFetch('/auth/me');
}

export async function updateProfile({ name }) {
  return apiFetch('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export async function updateEmail({ email, currentPassword }) {
  return apiFetch('/auth/email', {
    method: 'PATCH',
    body: JSON.stringify({ email, currentPassword }),
  });
}

export async function updatePassword({ currentPassword, newPassword }) {
  return apiFetch('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
