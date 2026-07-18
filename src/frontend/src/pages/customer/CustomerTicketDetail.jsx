import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createComment, getTicketById } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getTicketBreadcrumbs } from '../../constants/breadcrumbs';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatusStepper from '../../components/customer/StatusStepper';
import ImageAttachmentPicker from '../../components/attachments/ImageAttachmentPicker';
import { AttachmentGallery } from '../../components/attachments/AttachmentImage';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import { cn } from '../../utils/cn';

export default function CustomerTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTicketById(id);
        if (!cancelled) setTicket(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!ticket || (!commentText.trim() && !commentAttachments.length)) return;

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      message: commentText.trim(),
      createdAt: new Date().toISOString(),
      author: { id: user.id, name: user.name },
      attachments: [],
      _optimistic: true,
    };

    const attachmentsToSend = [...commentAttachments];

    setTicket((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), optimisticComment],
    }));
    setCommentText('');
    setCommentAttachments([]);
    setSubmittingComment(true);

    try {
      const created = await createComment(
        ticket.id,
        { message: optimisticComment.message },
        attachmentsToSend
      );
      setTicket((prev) => ({
        ...prev,
        comments: (prev.comments || [])
          .filter((c) => c.id !== optimisticComment.id)
          .concat(created),
      }));
    } catch (err) {
      setTicket((prev) => ({
        ...prev,
        comments: (prev.comments || []).filter((c) => c.id !== optimisticComment.id),
      }));
      setCommentText(optimisticComment.message);
      setCommentAttachments(attachmentsToSend);
      toast.error(err.message || 'Failed to send message.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <LoadingState message="Loading your request..." />;
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorState message={error} />
        <Link to="/customer/dashboard">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
    );
  }
  if (!ticket) return <ErrorState message="Request not found." />;

  const comments = ticket.comments || [];

  return (
    <div className="mx-auto w-full max-w-6xl pb-4 sm:pb-6">
      <Breadcrumbs items={getTicketBreadcrumbs(user?.role, ticket.id)} className="mb-3 sm:mb-4" />

      <div className="grid gap-4 lg:grid-cols-5 lg:items-start lg:gap-6">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-xs dark:border-surface-700 dark:bg-surface-900 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-caption font-medium text-surface-500 dark:text-surface-400">
                  Request #{ticket.id}
                </p>
                <h1 className="mt-1 break-words text-h2 text-surface-900 dark:text-surface-100 sm:text-h1">
                  {ticket.title}
                </h1>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <Badge variant={ticket.status} type="status" />
                <Badge variant={ticket.priority} type="priority" />
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-surface-50 p-3 dark:bg-surface-800/60 sm:mt-5 sm:p-4">
              <StatusStepper status={ticket.status} />
            </div>

            <div className="mt-4 border-t border-surface-100 pt-4 dark:border-surface-800 sm:mt-5 sm:pt-5">
              <h2 className="text-label text-surface-500 dark:text-surface-400">Details</h2>
              <p className="mt-1.5 whitespace-pre-wrap break-words text-body-sm leading-relaxed text-surface-700 dark:text-surface-300 sm:text-body">
                {ticket.description || 'No additional details provided.'}
              </p>
              <AttachmentGallery ticketId={ticket.id} attachments={ticket.attachments} />
            </div>

            {ticket.assignee && (
              <div className="mt-4 flex items-center gap-2.5 border-t border-surface-100 pt-4 dark:border-surface-800">
                <Avatar name={ticket.assignee.name} size="sm" />
                <div className="min-w-0">
                  <p className="text-caption text-surface-500 dark:text-surface-400">Support agent</p>
                  <p className="truncate text-body-sm font-medium text-surface-800 dark:text-surface-200">
                    {ticket.assignee.name}
                  </p>
                </div>
              </div>
            )}

            <p className="mt-4 text-caption text-surface-400">
              Submitted {formatRelativeTime(ticket.createdAt)}
            </p>
          </div>
        </div>

        <section className="flex min-h-0 flex-col rounded-2xl border border-surface-200 bg-white shadow-xs dark:border-surface-700 dark:bg-surface-900 lg:col-span-3 lg:max-h-[calc(100vh-7rem)] lg:sticky lg:top-4">
          <div className="border-b border-surface-100 px-4 py-3 dark:border-surface-800 sm:px-5 sm:py-4">
            <h2 className="text-h3 text-surface-900 dark:text-surface-100 sm:text-h2">Conversation</h2>
            <p className="mt-0.5 text-caption text-surface-500 dark:text-surface-400 sm:text-body-sm">
              Messages between you and our support team
            </p>
          </div>

          <ul className="flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:space-y-4 sm:px-4 sm:py-5">
            {comments.map((comment) => {
              const isOwn = comment.author?.id === user?.id;
              return (
                <li
                  key={comment.id}
                  className={cn('flex gap-2 sm:gap-3', isOwn && 'flex-row-reverse')}
                  style={{ opacity: comment._optimistic ? 0.7 : 1 }}
                >
                  <Avatar name={comment.author?.name} size="sm" className="mt-0.5 shrink-0" />
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3 py-2.5 sm:max-w-[78%] sm:px-4 sm:py-3',
                      isOwn
                        ? 'rounded-tr-md bg-brand-500 text-white dark:bg-brand-600'
                        : 'rounded-tl-md bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                    )}
                  >
                    <div
                      className={cn(
                        'flex flex-wrap items-baseline gap-x-2 gap-y-0.5',
                        isOwn ? 'justify-end' : 'justify-between'
                      )}
                    >
                      <p
                        className={cn(
                          'text-caption font-medium sm:text-body-sm',
                          isOwn ? 'text-brand-50' : 'text-surface-900 dark:text-surface-100'
                        )}
                      >
                        {isOwn ? 'You' : comment.author?.name || 'Support'}
                      </p>
                      <span
                        className={cn(
                          'text-[0.6875rem] sm:text-caption',
                          isOwn ? 'text-brand-100' : 'text-surface-400'
                        )}
                      >
                        {formatRelativeTime(comment.createdAt)}
                        {comment._optimistic && ' · Sending...'}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'mt-1 break-words text-body-sm',
                        isOwn ? 'text-white' : 'text-surface-700 dark:text-surface-300'
                      )}
                    >
                      {comment.message}
                    </p>
                    <AttachmentGallery
                      ticketId={ticket.id}
                      attachments={comment.attachments}
                      className={isOwn ? 'mt-2' : 'mt-2'}
                    />
                  </div>
                </li>
              );
            })}
            {!comments.length && (
              <li className="flex flex-1 items-center justify-center py-10 sm:py-16">
                <div className="max-w-xs text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800">
                    <svg className="h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <p className="mt-3 text-body-sm font-medium text-surface-700 dark:text-surface-300">
                    No messages yet
                  </p>
                  <p className="mt-1 text-caption text-surface-500 dark:text-surface-400">
                    We&apos;ll post updates here. You can also send a message below.
                  </p>
                </div>
              </li>
            )}
          </ul>

          <form
            onSubmit={handleCommentSubmit}
            className="border-t border-surface-100 p-3 dark:border-surface-800 sm:p-4"
          >
            <label htmlFor="customer-comment" className="sr-only">
              Add a message
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <textarea
                id="customer-comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type your message..."
                rows={2}
                className="block min-h-[2.75rem] w-full flex-1 resize-none rounded-xl border border-surface-300 px-3 py-2.5 text-body-sm shadow-xs transition-colors placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500 sm:min-h-[3rem] sm:px-4 sm:py-3 sm:text-body"
              />
              <Button
                type="submit"
                disabled={!commentText.trim() && !commentAttachments.length}
                isLoading={submittingComment}
                className="w-full shrink-0 sm:w-auto"
              >
                Send
              </Button>
            </div>
            <ImageAttachmentPicker
              files={commentAttachments}
              onChange={setCommentAttachments}
              disabled={submittingComment}
            />
          </form>
        </section>
      </div>
    </div>
  );
}
