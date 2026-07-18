import { useState } from 'react';
import { createTicket } from '../../api/tickets';
import { ApiError } from '../../api/client';
import { mapApiErrors } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import ImageAttachmentPicker from '../attachments/ImageAttachmentPicker';

export default function CustomerCreateTicketModal({ isOpen, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const resetForm = () => {
    setForm({ title: '', description: '', priority: 'medium' });
    setErrors({});
    setFormError('');
    setAttachments([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Please enter a subject';
    if (!form.description.trim()) next.description = 'Please describe your issue';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const ticket = await createTicket(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          priority: form.priority,
        },
        attachments
      );
      toast.success('Your request has been submitted!');
      onCreated?.(ticket);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(mapApiErrors(err.details));
      } else {
        setFormError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Get help"
      description="Tell us what's going on and we'll get back to you soon"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-create-ticket" isLoading={isLoading}>
            Submit request
          </Button>
        </>
      }
    >
      <form id="customer-create-ticket" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {formError}
          </div>
        )}

        <Input
          label="What do you need help with?"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g. Can't reset my password"
          required
        />

        <Textarea
          label="Describe the issue"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Share any details that will help us assist you..."
          required
        />

        <Select
          label="How urgent is this?"
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">Low — general question</option>
          <option value="medium">Medium — needs attention</option>
          <option value="high">High — blocking my work</option>
          <option value="critical">Critical — urgent issue</option>
        </Select>

        <div>
          <p className="mb-1.5 text-label text-surface-700 dark:text-surface-300">Screenshots (optional)</p>
          <ImageAttachmentPicker
            files={attachments}
            onChange={setAttachments}
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
}
