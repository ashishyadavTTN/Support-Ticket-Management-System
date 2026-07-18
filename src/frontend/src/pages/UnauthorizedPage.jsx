import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRoute } from '../constants/roles';
import Button from '../components/ui/Button';

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4 text-center dark:bg-surface-950">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
        <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-display text-surface-900 dark:text-surface-100">Access Denied</h1>
      <p className="mt-2 max-w-md text-body text-surface-500 dark:text-surface-400">
        You don&apos;t have permission to view this page. Contact your administrator
        if you believe this is an error.
      </p>
      <Link to={getDefaultRoute(user?.role)} className="mt-8">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  );
}
