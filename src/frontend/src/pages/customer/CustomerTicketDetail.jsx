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
import { formatRelativeTime } from '../../utils/formatRelativeTime';

export default function CustomerTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
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
    if (!ticket || !commentText.trim()) return;

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      message: commentText.trim(),
      createdAt: new Date().toISOString(),
      author: { id: user.id, name: user.name },
      _optimistic: true,
    };

    setTicket((prev) => ({
      ...prev,
      comments: [...(prev.comments || []), optimisticComment],
    }));
    setCommentText('');
    setSubmittingComment(true);

    try {
      const created = await createComment(ticket.id, {
        message: optimisticComment.message,
      });
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

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <Breadcrumbs items={getTicketBreadcrumbs(user?.role, ticket.id)} />

      <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs dark:border-surface-700 dark:bg-surface-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-caption font-medium text-surface-500 dark:text-surface-400">Request #{ticket.id}</p>
            <h1 className="mt-1 text-h1 text-surface-900 dark:text-surface-100">{ticket.title}</h1>
          </div>
          <Badge variant={ticket.priority} type="priority" />
        </div>

        <div className="mt-6">
          <StatusStepper status={ticket.status} />
        </div>

        <div className="mt-6 border-t border-surface-100 pt-6 dark:border-surface-800">
          <h2 className="text-label text-surface-500 dark:text-surface-400">Details</h2>
          <p className="mt-2 text-body leading-relaxed text-surface-700 dark:text-surface-300">
            {ticket.description || 'No additional details provided.'}
          </p>
        </div>

        {ticket.assignee && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-50 p-3 dark:bg-surface-800">
            <Avatar name={ticket.assignee.name} size="sm" />
            <div>
              <p className="text-caption text-surface-500 dark:text-surface-400">Assigned support agent</p>
              <p className="text-body-sm font-medium text-surface-800 dark:text-surface-200">
                {ticket.assignee.name}
              </p>
            </div>
          </div>
        )}

        <p className="mt-4 text-caption text-surface-400">
          Submitted {formatRelativeTime(ticket.createdAt)}
        </p>
      </div>

      <section className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs dark:border-surface-700 dark:bg-surface-900 sm:p-6">
        <h2 className="text-h2 text-surface-900 dark:text-surface-100">Conversation</h2>
        <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
          Messages between you and our support team
        </p>

        <ul className="mt-5 space-y-4">
          {(ticket.comments || []).map((comment) => {
            const isOwn = comment.author?.id === user?.id;
            return (
              <li
                key={comment.id}
                className="flex gap-3"
                style={{ opacity: comment._optimistic ? 0.7 : 1 }}
              >
                <Avatar name={comment.author?.name} size="sm" />
                <div
                  className={`flex-1 rounded-2xl px-4 py-3 ${
                    isOwn
                      ? 'bg-brand-50 text-surface-800 dark:bg-brand-950 dark:text-surface-200'
                      : 'bg-surface-50 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
                      {isOwn ? 'You' : comment.author?.name || 'Support'}
                    </p>
                    <span className="shrink-0 text-caption text-surface-400">
                      {formatRelativeTime(comment.createdAt)}
                      {comment._optimistic && ' · Sending...'}
                    </span>
                  </div>
                  <p className="mt-1 text-body-sm">{comment.message}</p>
                </div>
              </li>
            );
          })}
          {!ticket.comments?.length && (
            <li className="rounded-xl border border-dashed border-surface-200 py-8 text-center text-body-sm text-surface-500 dark:border-surface-700 dark:text-surface-400">
              No messages yet. We&apos;ll update you here.
            </li>
          )}
        </ul>

        <form onSubmit={handleCommentSubmit} className="mt-6 space-y-3 border-t border-surface-100 pt-6 dark:border-surface-800">
          <label htmlFor="customer-comment" className="text-label text-surface-700 dark:text-surface-300">
            Add a message
          </label>
          <textarea
            id="customer-comment"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Type your message..."
            rows={3}
            className="block w-full resize-y rounded-xl border border-surface-300 px-4 py-3 text-body shadow-xs transition-colors placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!commentText.trim()}
              isLoading={submittingComment}
            >
              Send message
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
