import { cn } from '../../utils/cn';

const sizes = {
  sm: 'h-7 w-7 text-caption',
  md: 'h-8 w-8 text-body-sm',
  lg: 'h-10 w-10 text-body',
};

export default function Avatar({ name, size = 'md', className }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700',
        sizes[size],
        className
      )}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
