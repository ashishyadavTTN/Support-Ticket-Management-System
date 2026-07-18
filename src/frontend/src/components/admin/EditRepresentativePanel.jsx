import { useEffect, useState } from 'react';
import { updateRepresentative } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import SlidePanel from '../ui/SlidePanel';
import SkeletonList from '../ui/Skeleton';
import PermissionCheckboxes from './PermissionCheckboxes';
import PermissionBadges from './PermissionBadges';
import ActiveToggle from './ActiveToggle';

export default function EditRepresentativePanel({
  representative,
  isOpen,
  onClose,
  onUpdated,
}) {
  const toast = useToast();
  const [permissions, setPermissions] = useState({});
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (representative) {
      setPermissions({ ...representative.permissions });
      setIsActive(representative.isActive);
      setHasChanges(false);
    }
  }, [representative]);

  useEffect(() => {
    if (!representative) return;
    const permissionsChanged =
      JSON.stringify(permissions) !== JSON.stringify(representative.permissions);
    const activeChanged = isActive !== representative.isActive;
    setHasChanges(permissionsChanged || activeChanged);
  }, [permissions, isActive, representative]);

  const handleSave = async () => {
    if (!representative || !hasChanges) return;

    setIsSaving(true);
    try {
      const data = await updateRepresentative(representative.id, {
        permissions,
        isActive,
      });
      toast.success('Representative updated successfully');
      onUpdated?.(data.user);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update representative.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (nextActive) => {
    if (!representative) return;

    setIsTogglingActive(true);
    try {
      const data = await updateRepresentative(representative.id, {
        isActive: nextActive,
      });
      setIsActive(nextActive);
      toast.success(
        nextActive
          ? `${representative.name} has been reactivated`
          : `${representative.name} has been deactivated`
      );
      onUpdated?.(data.user);
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setIsTogglingActive(false);
    }
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={representative?.name || 'Representative'}
      subtitle={representative?.email}
    >
      {!representative ? (
        <SkeletonList count={2} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-xl border border-surface-200 bg-surface-50 p-4 dark:border-surface-700 dark:bg-surface-800">
            <Avatar name={representative.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="text-body font-medium text-surface-900 dark:text-surface-100">
                {representative.name}
              </p>
              <p className="text-body-sm text-surface-500 dark:text-surface-400">{representative.email}</p>
              <p className="mt-1 text-caption text-surface-500 dark:text-surface-400">
                {representative.assignedTicketCount ?? 0} tickets currently assigned
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-surface-200 px-4 py-3 dark:border-surface-700">
            <div>
              <p className="text-body-sm font-medium text-surface-900 dark:text-surface-100">Account status</p>
              <p className="text-caption text-surface-500 dark:text-surface-400">
                {isActive
                  ? 'Active — can log in and be assigned tickets'
                  : 'Inactive — cannot log in or receive new assignments'}
              </p>
            </div>
            <ActiveToggle
              isActive={isActive}
              onChange={handleToggleActive}
              disabled={isTogglingActive || isSaving}
            />
          </div>

          <div>
            <p className="mb-2 text-label text-surface-600 dark:text-surface-400">Current permissions</p>
            <PermissionBadges permissions={representative.permissions} />
          </div>

          <PermissionCheckboxes
            permissions={permissions}
            onChange={setPermissions}
            disabled={!isActive || isSaving}
          />

          {!isActive && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-body-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Reactivate this account to edit permissions. Historical ticket
              assignments are preserved.
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-surface-200 pt-4 dark:border-surface-700">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!hasChanges || !isActive}
            >
              Save changes
            </Button>
          </div>
        </div>
      )}
    </SlidePanel>
  );
}
