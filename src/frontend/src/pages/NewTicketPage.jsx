import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createTicket } from '../api/tickets';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function NewTicketPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const ticket = await createTicket({
        ...form,
        createdBy: user.id,
      });
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create ticket.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to="/tickets"
          className="text-body-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          &larr; Back to tickets
        </Link>
        <h1 className="mt-2 text-h1 text-surface-900 dark:text-surface-100">Create New Ticket</h1>
        <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
          Describe your issue and we&apos;ll get back to you as soon as possible.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-surface-200 bg-white p-6 shadow-xs dark:border-surface-700 dark:bg-surface-900"
        noValidate
      >
        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Brief summary of your issue"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Provide details to help us understand the problem"
          required
        />

        <Select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </Select>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/tickets">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={submitting}>
            Create Ticket
          </Button>
        </div>
      </form>
    </div>
  );
}

export default NewTicketPage;
