import { useEffect, useState } from 'react';
import { apiFetchBlob } from '../../api/client';
import { getAttachmentPath } from '../../api/tickets';
import { cn } from '../../utils/cn';

export function AttachmentImage({ ticketId, attachment, className, alt }) {
  const [src, setSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    async function load() {
      try {
        const blob = await apiFetchBlob(getAttachmentPath(ticketId, attachment.id));
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ticketId, attachment.id]);

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-surface-100 text-caption text-surface-500 dark:bg-surface-800',
          className
        )}
      >
        Image unavailable
      </div>
    );
  }

  if (!src) {
    return (
      <div
        className={cn(
          'animate-pulse rounded-lg bg-surface-100 dark:bg-surface-800',
          className
        )}
      />
    );
  }

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-lg"
      title={attachment.originalName}
    >
      <img
        src={src}
        alt={alt || attachment.originalName}
        className={cn('h-full w-full object-cover', className)}
      />
    </a>
  );
}

export function AttachmentGallery({ ticketId, attachments, className, imageClassName }) {
  if (!attachments?.length) return null;

  return (
    <div className={cn('mt-2 flex flex-wrap gap-2', className)}>
      {attachments.map((attachment) => (
        <AttachmentImage
          key={attachment.id}
          ticketId={ticketId}
          attachment={attachment}
          className={cn('h-20 w-20 sm:h-24 sm:w-24', imageClassName)}
        />
      ))}
    </div>
  );
}
