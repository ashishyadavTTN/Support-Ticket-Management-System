import { useState } from 'react';
import { createRepresentative } from '../../api/admin';
import { ApiError } from '../../api/client';
import { REPRESENTATIVE_DEFAULT_PERMISSIONS } from '../../constants/permissions';
import { mapApiErrors, validateEmail, validateName, validatePassword } from '../../utils/validation';
import { useToast } from '../../context/ToastContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import PermissionCheckboxes from './PermissionCheckboxes';

export default function AddRepresentativeModal({ isOpen, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [permissions, setPermissions] = useState({
    ...REPRESENTATIVE_DEFAULT_PERMISSIONS,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setForm({ name: '', email: '', password: '' });
    setPermissions({ ...REPRESENTATIVE_DEFAULT_PERMISSIONS });
    setErrors({});
    setFormError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };
    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await createRepresentative({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        permissions,
      });
      toast.success(`${data.user.name} was added as a representative`);
      onCreated?.(data.user);
      handleClose();
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(mapApiErrors(err.details));
      } else {
        setFormError(err.message || 'Failed to create representative.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Representative"
      description="Create a new support representative account"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="add-rep-form" isLoading={isLoading}>
            Add Representative
          </Button>
        </>
      }
    >
      <form id="add-rep-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
            role="alert"
          >
            {formError}
          </div>
        )}

        <Input
          label="Full name"
          name="name"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          error={errors.email}
          required
        />

        <Input
          label="Temporary password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          error={errors.password}
          hint="Share this with the representative — they should change it after first login"
          required
        />

        <PermissionCheckboxes
          permissions={permissions}
          onChange={setPermissions}
        />
      </form>
    </Modal>
  );
}
