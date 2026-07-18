import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTicketById } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import { getTicketBreadcrumbs } from '../../constants/breadcrumbs';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import LoadingState from '../../components/LoadingState';
import ErrorState from '../../components/ErrorState';
import Badge from '../../components/ui/Badge';
import { AttachmentGallery } from '../../components/attachments/AttachmentImage';

export default function InternalTicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <LoadingState message="Loading ticket..." />;
  if (error) return <ErrorState message={error} />;
  if (!ticket) return <ErrorState message="Ticket not found." />;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={getTicketBreadcrumbs(user?.role, ticket.id)} />

      <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-xs dark:border-surface-700 dark:bg-surface-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-h1 text-surface-900 dark:text-surface-100">{ticket.title}</h1>
            <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
              Ticket #{ticket.id}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={ticket.status} type="status" />
            <Badge variant={ticket.priority} type="priority" />
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-label text-surface-500 dark:text-surface-400">Status</dt>
            <dd className="mt-1 text-body capitalize text-surface-900 dark:text-surface-100">
              {ticket.status?.replace(/_/g, ' ')}
            </dd>
          </div>
          <div>
            <dt className="text-label text-surface-500 dark:text-surface-400">Priority</dt>
            <dd className="mt-1 text-body capitalize text-surface-900 dark:text-surface-100">
              {ticket.priority}
            </dd>
          </div>
          <div>
            <dt className="text-label text-surface-500 dark:text-surface-400">Created By</dt>
            <dd className="mt-1 text-body text-surface-900 dark:text-surface-100">
              {ticket.creator?.name || ticket.createdBy}
            </dd>
          </div>
          <div>
            <dt className="text-label text-surface-500 dark:text-surface-400">Assigned To</dt>
            <dd className="mt-1 text-body text-surface-900 dark:text-surface-100">
              {ticket.assignee?.name || 'Unassigned'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-label text-surface-500 dark:text-surface-400">Description</dt>
            <dd className="mt-1 text-body text-surface-700 dark:text-surface-300">
              {ticket.description || '—'}
            </dd>
            <AttachmentGallery ticketId={ticket.id} attachments={ticket.attachments} />
          </div>
        </dl>
      </div>

      <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-xs dark:border-surface-700 dark:bg-surface-900">
        <h2 className="text-h2 text-surface-900 dark:text-surface-100">Comments</h2>
        {ticket.comments?.length ? (
          <ul className="mt-4 space-y-4">
            {ticket.comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-lg border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800"
              >
                <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
                  {comment.author?.name || 'Unknown'}
                </p>
                <p className="mt-1 text-body-sm text-surface-600 dark:text-surface-400">
                  {comment.message}
                </p>
                <AttachmentGallery ticketId={ticket.id} attachments={comment.attachments} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-body-sm text-surface-500 dark:text-surface-400">No comments yet.</p>
        )}
      </section>
    </div>
  );
}
