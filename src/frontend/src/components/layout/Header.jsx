import { ROLE_LABELS } from '../../constants/roles';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

export default function Header({ user, onMenuToggle, onLogout }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-white px-4 dark:border-surface-800 dark:bg-surface-900 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-surface-600 transition-colors hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-800 md:hidden"
          aria-label="Toggle navigation menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:block">
          <p className="text-body-sm text-surface-500 dark:text-surface-400">Welcome back,</p>
          <p className="text-body-sm font-semibold text-surface-900 dark:text-surface-100">
            {user?.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <div className="hidden text-right sm:block">
          <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
            {user?.name}
          </p>
          <p className="text-caption text-surface-500 dark:text-surface-400">
            {ROLE_LABELS[user?.role] || user?.role}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-body-sm font-semibold text-brand-700 dark:bg-brand-900 dark:text-brand-300">
          {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
