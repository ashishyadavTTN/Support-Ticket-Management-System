import { useId, useRef } from 'react';
import { MAX_ATTACHMENTS_PER_UPLOAD } from '../../api/tickets';
import { cn } from '../../utils/cn';

export default function ImageAttachmentPicker({
  files,
  onChange,
  disabled = false,
  className,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const canAddMore = files.length < MAX_ATTACHMENTS_PER_UPLOAD;

  const handleSelect = (event) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;

    const remaining = MAX_ATTACHMENTS_PER_UPLOAD - files.length;
    const toAdd = selected.slice(0, remaining);
    onChange([...files, ...toAdd]);
    event.target.value = '';
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className={cn('space-y-2', className)}>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="group relative h-16 w-16 overflow-hidden rounded-lg border border-surface-200 dark:border-surface-600 sm:h-20 sm:w-20"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full object-cover"
                onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={disabled}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleSelect}
            disabled={disabled}
            className="sr-only"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-surface-300 px-3 py-1.5 text-caption text-surface-600 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-surface-600 dark:text-surface-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
            Add images
          </button>
        </>
      )}

      <p className="text-caption text-surface-400">
        Up to {MAX_ATTACHMENTS_PER_UPLOAD} images per upload. You can add more in additional messages.
      </p>
    </div>
  );
}
