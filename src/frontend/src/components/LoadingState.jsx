import SkeletonList from './ui/Skeleton';

function LoadingState({ message = 'Loading...' }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <p className="text-body-sm text-surface-500 dark:text-surface-400">{message}</p>
      <SkeletonList count={3} />
    </div>
  );
}

export default LoadingState;
