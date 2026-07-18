import { useEffect, useState } from 'react';
import { createTicket, getAssignees, getCustomers } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ROLES } from '../../constants/roles';
import { ApiError } from '../../api/client';
import { mapApiErrors } from '../../utils/validation';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

export default function NewTicketModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === ROLES.ADMIN;
  const canCreateForCustomer =
    isAdmin || user?.permissions?.canCreateTickets;
  const canAssign =
    user?.role === ROLES.ADMIN || user?.permissions?.canAssignTickets;

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    createdBy: '',
    assignedTo: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [representatives, setRepresentatives] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      title: '',
      description: '',
      priority: 'medium',
      createdBy: '',
      assignedTo: '',
    });
    setErrors({});
    setFormError('');

    async function loadOptions() {
      try {
        if (canCreateForCustomer) {
          const custData = await getCustomers();
          setCustomers(custData.customers || []);
        }
        if (canAssign) {
          const repData = await getAssignees();
          setRepresentatives(repData.representatives || []);
        }
      } catch {
        // Options are optional — form still works without them
      }
    }

    loadOptions();
  }, [isOpen, canCreateForCustomer, canAssign]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.description.trim()) next.description = 'Description is required';
    if (canCreateForCustomer && !form.createdBy) next.createdBy = 'Customer is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
      };

      if (canCreateForCustomer && form.createdBy) {
        payload.createdBy = parseInt(form.createdBy, 10);
      }

      if (canAssign && form.assignedTo) {
        payload.assignedTo = parseInt(form.assignedTo, 10);
      }

      const ticket = await createTicket(payload);
      toast.success('Ticket created successfully');
      onCreated?.(ticket);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(mapApiErrors(err.details));
      } else {
        setFormError(err.message || 'Failed to create ticket.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Ticket"
      description="Create a support ticket on behalf of a customer"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="new-ticket-form" isLoading={isLoading}>
            Create Ticket
          </Button>
        </>
      }
    >
      <form id="new-ticket-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300" role="alert">
            {formError}
          </div>
        )}

        <Input
          label="Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Brief summary of the issue"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="Detailed description"
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

        {canCreateForCustomer && (
          <Select
            label="Customer"
            name="createdBy"
            value={form.createdBy}
            onChange={handleChange}
            error={errors.createdBy}
            required
          >
            <option value="">Select customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name} ({c.email})
              </option>
            ))}
          </Select>
        )}

        {canAssign && (
          <Select
            label="Assign to (optional)"
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
          >
            <option value="">Unassigned</option>
            {representatives.map((rep) => (
              <option key={rep.id} value={String(rep.id)}>
                {rep.name}
              </option>
            ))}
          </Select>
        )}
      </form>
    </Modal>
  );
}
