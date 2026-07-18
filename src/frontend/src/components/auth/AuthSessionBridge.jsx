import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setSessionExpiredHandler, setTokenRefresher } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getTokenExpiry } from '../../utils/jwt';

const WARN_BEFORE_MS = 90 * 1000; // 1.5 minutes before expiry

export default function AuthSessionBridge() {
  const navigate = useNavigate();
  const toast = useToast();
  const { accessToken, performRefresh, clearSession, isAuthenticated } = useAuth();
  const expiryWarnedRef = useRef(false);

  useEffect(() => {
    setTokenRefresher(performRefresh);

    setSessionExpiredHandler(() => {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      clearSession();
      toast.error('Your session has expired, please log in again');
      navigate('/login', {
        replace: true,
        state: { from: { pathname: returnPath } },
      });
    });
  }, [performRefresh, clearSession, navigate, toast]);

  useEffect(() => {
    expiryWarnedRef.current = false;

    if (!isAuthenticated || !accessToken) return undefined;

    const exp = getTokenExpiry(accessToken);
    if (!exp) return undefined;

    const expiresAt = exp * 1000;
    const warnAt = expiresAt - WARN_BEFORE_MS;
    const delay = warnAt - Date.now();

    if (delay <= 0) return undefined;

    const timer = setTimeout(async () => {
      if (expiryWarnedRef.current) return;
      expiryWarnedRef.current = true;

      toast.info('Your session is expiring soon — refreshing in the background.', {
        duration: 8000,
      });

      try {
        await performRefresh();
      } catch {
        // apiFetch / session handler will deal with hard expiry on next request
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [accessToken, isAuthenticated, performRefresh, toast]);

  return null;
}
