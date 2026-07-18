import ThemeToggle from '../ui/ThemeToggle';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-surface-950">
      <div className="hidden w-1/2 flex-col justify-between bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-h2 text-white">SupportDesk</span>
        </div>
        <div>
          <h2 className="text-display text-white">
            Customer support,<br />done right.
          </h2>
          <p className="mt-4 max-w-md text-body text-surface-400">
            Track, assign, and resolve support tickets with a modern platform
            built for teams of every size.
          </p>
        </div>
        <p className="text-caption text-surface-500">
          &copy; {new Date().getFullYear()} SupportDesk. All rights reserved.
        </p>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="text-h2 text-surface-900 dark:text-surface-100">SupportDesk</span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-h1 text-surface-900 dark:text-surface-100">{title}</h1>
            <p className="mt-2 text-body-sm text-surface-500 dark:text-surface-400">{subtitle}</p>
          </div>
          <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm dark:border-surface-700 dark:bg-surface-900 md:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
