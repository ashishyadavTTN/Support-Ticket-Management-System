import { apiFetch, apiFetchMultipart } from './client';

export const MAX_ATTACHMENTS_PER_UPLOAD = 3;

function buildTicketFormData(data, attachments = []) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  attachments.forEach((file) => {
    formData.append('attachments', file);
  });

  return formData;
}

export async function getTickets(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.status?.length) searchParams.set('status', params.status.join(','));
  if (params.priority?.length) searchParams.set('priority', params.priority.join(','));
  if (params.assignedTo) searchParams.set('assignedTo', params.assignedTo);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  const path = `/tickets${query ? `?${query}` : ''}`;
  return apiFetch(path);
}

export async function getTicketById(id) {
  return apiFetch(`/tickets/${id}`);
}

export async function getCustomers() {
  return apiFetch('/tickets/customers');
}

export async function getAssignees() {
  return apiFetch('/tickets/assignees');
}

export async function createTicket(data, attachments = []) {
  if (attachments.length > 0) {
    return apiFetchMultipart('/tickets', {
      method: 'POST',
      body: buildTicketFormData(data, attachments),
    });
  }

  return apiFetch('/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTicket(id, data) {
  return apiFetch(`/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateTicketStatus(id, status) {
  return apiFetch(`/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function createComment(ticketId, data, attachments = []) {
  if (attachments.length > 0) {
    const formData = new FormData();
    if (data.message) {
      formData.append('message', data.message);
    }
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    return apiFetchMultipart(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: formData,
    });
  }

  return apiFetch(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getAttachmentPath(ticketId, attachmentId) {
  return `/tickets/${ticketId}/attachments/${attachmentId}`;
}
