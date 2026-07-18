import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRepresentatives, updateRepresentative } from '../../api/admin';
import { useToast } from '../../context/ToastContext';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch';
import { getRepresentativeBreadcrumbs } from '../../constants/breadcrumbs';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import SearchInput from '../../components/ui/SearchInput';
import SkeletonList from '../../components/ui/Skeleton';
import ErrorState from '../../components/ErrorState';
import RepresentativeTable, {
  RepresentativeMobileList,
} from '../../components/admin/RepresentativeTable';
import AddRepresentativeModal from '../../components/admin/AddRepresentativeModal';
import EditRepresentativePanel from '../../components/admin/EditRepresentativePanel';

export default function RepresentativesPage() {
  const toast = useToast();
  const [representatives, setRepresentatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const {
    value: searchInput,
    setValue: setSearchInput,
    debouncedValue: debouncedSearch,
    isDebouncing,
  } = useDebouncedSearch('', 400);

  const fetchRepresentatives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRepresentatives();
      setRepresentatives(data.representatives || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepresentatives();
  }, [fetchRepresentatives]);

  const filteredRepresentatives = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return representatives;

    return representatives.filter(
      (rep) =>
        rep.name?.toLowerCase().includes(query) ||
        rep.email?.toLowerCase().includes(query)
    );
  }, [representatives, debouncedSearch]);

  const selectedRep = representatives.find((r) => r.id === selectedId) || null;
  const showSearchIndicator = isDebouncing;

  const handleToggleActive = async (rep, nextActive) => {
    setTogglingId(rep.id);
    try {
      const data = await updateRepresentative(rep.id, { isActive: nextActive });
      setRepresentatives((prev) =>
        prev.map((r) =>
          r.id === rep.id
            ? { ...r, ...data.user, assignedTicketCount: r.assignedTicketCount }
            : r
        )
      );
      toast.success(
        nextActive
          ? `${rep.name} has been reactivated`
          : `${rep.name} has been deactivated`
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdated = (updatedUser) => {
    setRepresentatives((prev) =>
      prev.map((r) =>
        r.id === updatedUser.id
          ? { ...r, ...updatedUser, assignedTicketCount: r.assignedTicketCount }
          : r
      )
    );
  };

  const handleCreated = () => {
    fetchRepresentatives();
  };

  return (
    <div className="space-y-6">
      {selectedRep && (
        <Breadcrumbs items={getRepresentativeBreadcrumbs(selectedRep.name)} />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-h1 text-surface-900 dark:text-surface-100">Representatives</h1>
          <p className="mt-1 text-body-sm text-surface-500 dark:text-surface-400">
            Manage support team members, permissions, and account access
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>Add Representative</Button>
      </div>

      {!loading && representatives.length > 0 && (
        <div className="max-w-md">
          <SearchInput
            type="search"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            isSearching={showSearchIndicator}
            aria-label="Search representatives"
          />
        </div>
      )}

      {error && <ErrorState message={error} onRetry={fetchRepresentatives} />}

      {loading ? (
        <SkeletonList count={4} />
      ) : representatives.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          title="No representatives yet"
          description="Add your first support representative to start assigning tickets."
          actionLabel="Add Representative"
          onAction={() => setShowAddModal(true)}
        />
      ) : filteredRepresentatives.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          title="No representatives match your search"
          description="Try a different name or email address."
        />
      ) : (
        <>
          <RepresentativeTable
            representatives={filteredRepresentatives}
            selectedId={selectedId}
            onRowClick={setSelectedId}
            onToggleActive={handleToggleActive}
            togglingId={togglingId}
          />
          <RepresentativeMobileList
            representatives={filteredRepresentatives}
            selectedId={selectedId}
            onRowClick={setSelectedId}
            onToggleActive={handleToggleActive}
            togglingId={togglingId}
          />
        </>
      )}

      <EditRepresentativePanel
        representative={selectedRep}
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        onUpdated={handleUpdated}
      />

      <AddRepresentativeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
