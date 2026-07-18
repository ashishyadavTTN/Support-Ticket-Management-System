import { useEffect, useRef, useState } from 'react';
import { subscribeLoading } from '../../api/loadingTracker';
import { cn } from '../../utils/cn';

export default function LoadingBar() {
  const [active, setActive] = useState(false);
  const [completing, setCompleting] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    let completeTimer;

    return subscribeLoading((count) => {
      if (count > 0) {
        clearTimeout(completeTimer);
        activeRef.current = true;
        setCompleting(false);
        setActive(true);
        return;
      }

      if (activeRef.current) {
        setCompleting(true);
        completeTimer = setTimeout(() => {
          activeRef.current = false;
          setActive(false);
          setCompleting(false);
        }, 350);
      }
    });
  }, []);

  if (!active && !completing) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden transition-opacity duration-300',
        completing ? 'opacity-0' : 'opacity-100'
      )}
      role="progressbar"
      aria-hidden="true"
    >
      <div className="loading-bar-track h-full w-full bg-brand-200/30 dark:bg-brand-900/40">
        <div className="loading-bar-indeterminate h-full bg-brand-600 dark:bg-brand-400" />
      </div>
    </div>
  );
}