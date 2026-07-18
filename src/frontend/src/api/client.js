import { trackRequestEnd, trackRequestStart } from './loadingTracker';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const AUTH_PATHS_NO_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
];

let accessTokenGetter = () => null;
let tokenRefresher = null;
let sessionExpiredHandler = null;

/** Prevents duplicate session-expired toasts/redirects from concurrent 401s. */
let isHandlingSessionExpiry = false;

/** In-flight refresh promise — deduplicates concurrent 401 recoveries. */
let refreshPromise = null;

export function resetSessionExpiryGuard() {
  isHandlingSessionExpiry = false;
}

export function setAccessTokenGetter(getter) {
  accessTokenGetter = getter;
}

export function setTokenRefresher(refresher) {
  tokenRefresher = refresher;
}

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
}

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function isAuthPathNoRefresh(path) {
  return AUTH_PATHS_NO_REFRESH.some((authPath) => path.startsWith(authPath));
}

async function parseResponseBody(response) {
  return response.json().catch(() => ({}));
}

async function throwApiError(response, body) {
  throw new ApiError(body.error || `Request failed (${response.status})`, {
    status: response.status,
    details: body.details,
  });
}

/**
 * Raw refresh call — bypasses apiFetch retry to prevent infinite loops.
 */
export async function refreshAccessTokenRequest() {
  trackRequestStart();
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    const body = await parseResponseBody(response);
    if (!response.ok) {
      await throwApiError(response, body);
    }
    return body;
  } finally {
    trackRequestEnd();
  }
}

async function attemptTokenRefresh() {
  if (!tokenRefresher) {
    throw new ApiError('No token refresher configured', { status: 401 });
  }
  if (!refreshPromise) {
    refreshPromise = tokenRefresher().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function handleSessionExpired() {
  if (isHandlingSessionExpiry) return;
  isHandlingSessionExpiry = true;
  if (sessionExpiredHandler) {
    await sessionExpiredHandler();
  }
}

function shouldAttemptRefresh(path, options) {
  if (options._isAuthRetry) return false;
  if (options._skipAuthRetry) return false;
  if (isAuthPathNoRefresh(path)) return false;
  return true;
}

async function rawFetch(path, options = {}) {
  const token = accessTokenGetter();
  const headers = { ...options.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    signal: options.signal,
  });
}

export async function apiFetch(path, options = {}) {
  trackRequestStart();
  try {
    const response = await rawFetch(path, options);

    if (response.ok) {
      return parseResponseBody(response);
    }

    if (response.status !== 401 || !shouldAttemptRefresh(path, options)) {
      const body = await parseResponseBody(response);
      await throwApiError(response, body);
    }

    try {
      await attemptTokenRefresh();
    } catch {
      await handleSessionExpired();
      const body = await parseResponseBody(response);
      await throwApiError(response, body);
    }

    const retryResponse = await rawFetch(path, { ...options, _isAuthRetry: true });

    if (!retryResponse.ok) {
      if (retryResponse.status === 401) {
        await handleSessionExpired();
      }
      const body = await parseResponseBody(retryResponse);
      await throwApiError(retryResponse, body);
    }

    return parseResponseBody(retryResponse);
  } finally {
    trackRequestEnd();
  }
}

/**
 * Multipart fetch — does not set Content-Type so the browser adds the boundary.
 */
export async function apiFetchMultipart(path, options = {}) {
  trackRequestStart();
  try {
    const token = accessTokenGetter();
    const headers = { ...options.headers };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const doFetch = () =>
      fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
        signal: options.signal,
      });

    let response = await doFetch();

    if (response.ok) {
      return parseResponseBody(response);
    }

    if (response.status !== 401 || !shouldAttemptRefresh(path, options)) {
      const body = await parseResponseBody(response);
      await throwApiError(response, body);
    }

    try {
      await attemptTokenRefresh();
    } catch {
      await handleSessionExpired();
      const body = await parseResponseBody(response);
      await throwApiError(response, body);
    }

    response = await doFetch();

    if (!response.ok) {
      if (response.status === 401) {
        await handleSessionExpired();
      }
      const body = await parseResponseBody(response);
      await throwApiError(response, body);
    }

    return parseResponseBody(response);
  } finally {
    trackRequestEnd();
  }
}

/**
 * Fetch a binary resource (e.g. attachment image) with auth.
 */
export async function apiFetchBlob(path, options = {}) {
  trackRequestStart();
  try {
    const token = accessTokenGetter();
    const headers = { ...options.headers };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const doFetch = () =>
      fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
        signal: options.signal,
      });

    let response = await doFetch();

    if (response.status === 401 && shouldAttemptRefresh(path, options)) {
      try {
        await attemptTokenRefresh();
        response = await doFetch();
      } catch {
        await handleSessionExpired();
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        await handleSessionExpired();
      }
      const body = await parseResponseBody(response);
      await throwApiError(response, body);
    }

    return response.blob();
  } finally {
    trackRequestEnd();
  }
}
