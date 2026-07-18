import { useEffect, useState } from 'react';
import {
  createComment,
  getTicketById,
  updateTicket,
  updateTicketStatus,
} from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatTicketId } from '../../utils/formatTicketId';
import { ROLES } from '../../constants/roles';
import {
  TICKET_STATUSES,
  formatStatus,
  getTransitionBlockReason,
} from '../../constants/tickets';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Select from '../ui/Select';
import SlidePanel from '../ui/SlidePanel';
import SkeletonList from '../ui/Skeleton';
import ImageAttachmentPicker from '../attachments/ImageAttachmentPicker';
import { AttachmentGallery } from '../attachments/AttachmentImage';

export default function TicketDetailPanel({
  ticketId,
  isOpen,
  onClose,
  representatives,
  onTicketUpdated,
}) {
  const { user } = useAuth();
  const toast = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentAttachments, setCommentAttachments] = useState([]);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  const perms = user?.role === ROLES.ADMIN
    ? { canChangeStatus: true, canAssignTickets: true, canComment: true }
    : user?.permissions || {};

  const canChangeStatus = user?.role === ROLES.ADMIN || perms.canChangeStatus;
  const canAssign = user?.role === ROLES.ADMIN || perms.canAssignTickets;
  const canComment = user?.role === ROLES.ADMIN || perms.canComment;

  useEffect(() => {
    if (!isOpen || !ticketId) {
      setTicket(null);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await getTicketById(ticketId);
        if (!cancelled) setTicket(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err.message || 'Failed to load ticket.');
          onClose();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, ticketId, onClose, toast]);

  const handleStatusChange = async (newStatus) => {
    if (!ticket || newStatus === ticket.status) return;

    setUpdatingStatus(true);
    try {
      await updateTicketStatus(ticket.id, newStatus);
      const refreshed = await getTicketById(ticket.id);
      setTicket(refreshed);
      onTicketUpdated?.(refreshed);
      toast.success(`Status updated to ${formatStatus(newStatus)}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (value) => {
    if (!ticket) return;
    const assignedTo = value === '' ? null : parseInt(value, 10);

    setUpdatingAssignee(true);
    try {
      await updateTicket(ticket.id, { assignedTo });
      const refreshed = await getTicketById(ticket.id);
      setTicket(refreshed);
      onTicketUpdated?.(refreshed);
      toast.success('Assignee updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update assignee.');
    } finally {
      setUpdatingAssignee(false);
    }
  };

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
      toast.error(err.message || 'Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={ticket ? ticket.title : 'Loading...'}
      subtitle={ticket ? `Ticket ${formatTicketId(ticket.id)}` : undefined}
    >
      {loading || !ticket ? (
        <SkeletonList count={2} />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant={ticket.status} type="status" />
            <Badge variant={ticket.priority} type="priority" />
          </div>

          <div>
            <h3 className="text-label text-surface-500 dark:text-surface-400">Description</h3>
            <p className="mt-1.5 text-body-sm leading-relaxed text-surface-700 dark:text-surface-300">
              {ticket.description || 'No description provided.'}
            </p>
            <AttachmentGallery ticketId={ticket.id} attachments={ticket.attachments} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {canChangeStatus && (
              <div>
                <label className="mb-1.5 block text-label text-surface-600 dark:text-surface-400">
                  Status
                </label>
                <Select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                >
                  {TICKET_STATUSES.map((s) => {
                    const blockReason = getTransitionBlockReason(ticket.status, s.value);
                    const isDisabled = Boolean(blockReason) && s.value !== ticket.status;
                    return (
                      <option
                        key={s.value}
                        value={s.value}
                        disabled={isDisabled}
                        title={blockReason || undefined}
                      >
                        {s.label}
                        {isDisabled ? ' (unavailable)' : ''}
                      </option>
                    );
                  })}
                </Select>
                {ticket.status && getTransitionBlockReason(ticket.status, ticket.status) === null && (
                  <p className="mt-1 text-caption text-surface-400">
                    Invalid transitions are disabled in the dropdown.
                  </p>
                )}
              </div>
            )}

            {canAssign && (
              <div>
                <Select
                  label="Assigned to"
                  value={ticket.assignedTo ?? ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  disabled={updatingAssignee}
                >
                  <option value="">Unassigned</option>
                  {representatives.map((rep) => (
                    <option key={rep.id} value={String(rep.id)}>
                      {rep.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-lg bg-surface-50 p-3 text-body-sm dark:bg-surface-800">
            <div>
              <dt className="text-caption text-surface-500 dark:text-surface-400">Created by</dt>
              <dd className="mt-0.5 font-medium text-surface-800 dark:text-surface-200">
                {ticket.creator?.name || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-surface-500 dark:text-surface-400">Created</dt>
              <dd className="mt-0.5 text-surface-700 dark:text-surface-300">
                {formatRelativeTime(ticket.createdAt)}
              </dd>
            </div>
          </dl>

          <section>
            <h3 className="text-h3 text-surface-900 dark:text-surface-100">
              Comments ({ticket.comments?.length || 0})
            </h3>
            <ul className="mt-3 space-y-3">
              {(ticket.comments || []).map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-lg border border-surface-200 bg-white p-3 transition-opacity duration-200 dark:border-surface-700 dark:bg-surface-800"
                  style={{ opacity: comment._optimistic ? 0.7 : 1 }}
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={comment.author?.name} size="sm" />
                    <div>
                      <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
                        {comment.author?.name || 'Unknown'}
                      </p>
                      <p className="text-caption text-surface-400">
                        {formatRelativeTime(comment.createdAt)}
                        {comment._optimistic && ' · Sending...'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-body-sm text-surface-700 dark:text-surface-300">{comment.message}</p>
                  <AttachmentGallery ticketId={ticket.id} attachments={comment.attachments} />
                </li>
              ))}
              {!ticket.comments?.length && (
                <p className="text-body-sm text-surface-500 dark:text-surface-400">No comments yet.</p>
              )}
            </ul>

            {canComment && (
              <form onSubmit={handleCommentSubmit} className="mt-4 space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="block w-full resize-y rounded-lg border border-surface-300 px-3 py-2 text-body-sm shadow-xs transition-colors placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-surface-600 dark:bg-surface-900 dark:text-surface-100 dark:placeholder:text-surface-500"
                />
                <ImageAttachmentPicker
                  files={commentAttachments}
                  onChange={setCommentAttachments}
                  disabled={submittingComment}
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!commentText.trim() && !commentAttachments.length}
                    isLoading={submittingComment}
                  >
                    Post comment
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </SlidePanel>
  );
}
