import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';
import {
  updateEmail,
  updatePassword,
  updateProfile,
} from '../api/auth';
import { getDefaultPermissions } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { ROLES } from '../constants/roles';
import { PERMISSION_LABELS } from '../constants/permissions';
import { mapApiErrors, validateEmail, validateName, validatePassword } from '../utils/validation';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ThemeToggle from '../components/ui/ThemeToggle';
import SkeletonList from '../components/ui/Skeleton';

function SettingsSection({ title, description, children }) {
  return (
    <section className="rounded-xl border border-surface-200 bg-white p-6 shadow-xs dark:border-surface-700 dark:bg-surface-900">
      <div className="mb-5">
        <h2 className="text-h2 text-surface-900 dark:text-surface-100">{title}</h2>
        {description && (
          <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function AdminDefaultPermissions() {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDefaultPermissions();
        setTemplate(data.template);
      } catch {
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <SkeletonList count={1} />;

  if (!template) {
    return (
      <p className="text-body-sm text-surface-500 dark:text-surface-400">
        Unable to load permission template.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-body-sm text-surface-600 dark:text-surface-400">
        These defaults are applied when creating a new representative. Editing this
        template globally is a planned future improvement — for now, customize permissions
        per user on the{' '}
        <Link
          to="/admin/users"
          className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          Representatives
        </Link>{' '}
        page.
      </p>
      <ul className="divide-y divide-surface-100 rounded-lg border border-surface-200 dark:divide-surface-800 dark:border-surface-700">
        {Object.entries(template).map(([key, enabled]) => (
          <li
            key={key}
            className="flex items-center justify-between px-4 py-3 text-body-sm"
          >
            <span className="text-surface-800 dark:text-surface-200">
              {PERMISSION_LABELS[key] || key}
            </span>
            <span
              className={
                enabled
                  ? 'font-medium text-emerald-700 dark:text-emerald-400'
                  : 'text-surface-400 dark:text-surface-500'
              }
            >
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { isDark } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [email, setEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailErrors, setEmailErrors] = useState({});
  const [savingEmail, setSavingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user?.name, user?.email]);

  const handleNameSave = async (e) => {
    e.preventDefault();
    const error = validateName(name);
    setNameError(error);
    if (error) return;

    setSavingName(true);
    try {
      const data = await updateProfile({ name: name.trim() });
      setUser(data.user);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSavingName(false);
    }
  };

  const handleEmailSave = async (e) => {
    e.preventDefault();
    const nextErrors = {
      email: validateEmail(email),
      currentPassword: emailPassword ? '' : 'Current password is required',
    };
    setEmailErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSavingEmail(true);
    try {
      const data = await updateEmail({
        email: email.trim(),
        currentPassword: emailPassword,
      });
      setUser(data.user);
      setEmailPassword('');
      toast.success('Email updated.');
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setEmailErrors(mapApiErrors(err.details));
      } else {
        toast.error(err.message || 'Failed to update email.');
      }
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const nextErrors = {
      currentPassword: currentPassword ? '' : 'Current password is required',
      newPassword: validatePassword(newPassword),
      confirmPassword: !confirmPassword
        ? 'Please confirm your new password'
        : confirmPassword !== newPassword
          ? 'Passwords do not match'
          : '',
    };
    setPasswordErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSavingPassword(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated.');
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setPasswordErrors(mapApiErrors(err.details));
      } else {
        toast.error(err.message || 'Failed to update password.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-h1 text-surface-900 dark:text-surface-100">Settings</h1>
        <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
          Manage your account and preferences
        </p>
      </div>

      <SettingsSection title="Profile" description="Update your display name and email address.">
        <form onSubmit={handleNameSave} className="space-y-4">
          <Input
            label="Full name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={savingName}>
              Save name
            </Button>
          </div>
        </form>

        <form onSubmit={handleEmailSave} className="mt-6 space-y-4 border-t border-surface-100 pt-6 dark:border-surface-800">
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailErrors.email}
            required
          />
          <Input
            label="Current password"
            name="emailPassword"
            type="password"
            autoComplete="current-password"
            value={emailPassword}
            onChange={(e) => setEmailPassword(e.target.value)}
            error={emailErrors.currentPassword}
            hint="Required to change your email address"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={savingEmail}>
              Save email
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Password" description="Change your account password.">
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <Input
            label="Current password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={passwordErrors.currentPassword}
            required
          />
          <Input
            label="New password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={passwordErrors.newPassword}
            hint="Must be at least 8 characters"
            required
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={passwordErrors.confirmPassword}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={savingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Preferences" description="Customize your experience.">
        <div className="flex items-center justify-between rounded-lg border border-surface-200 px-4 py-3 dark:border-surface-700">
          <div>
            <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100">
              Dark mode
            </p>
            <p className="text-caption text-surface-500 dark:text-surface-400">
              Currently {isDark ? 'on' : 'off'}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </SettingsSection>

      {user?.role === ROLES.ADMIN && (
        <SettingsSection
          title="Representative permissions"
          description="Default permission template for new representatives."
        >
          <AdminDefaultPermissions />
        </SettingsSection>
      )}
    </div>
  );
}
