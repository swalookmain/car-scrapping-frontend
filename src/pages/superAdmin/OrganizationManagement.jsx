import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { organizationsApi } from '../../services/api';
import Breadcrumb from '../../ui/Breadcrumb';
import TableToolbar from '../../ui/TableToolbar';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import { Box, TextField, Button, MenuItem } from '@mui/material';
import OrganizationForm from './OrganizationForm';
import SuperAdminLayout from '../../layout/SuperAdminLayout';
import getOrganizationColumns from './organizationColumns';
import OrgDetails from './OrgDetails';

const OrganizationManagement = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ name: '', status: '', createdFrom: '', createdTo: '' });
  const [appliedFilters, setAppliedFilters] = useState({});

  const formRef = useRef(null);

  const { data: orgResult, isLoading: loading } = useQuery({
    queryKey: ['organizations', page, rowsPerPage, appliedFilters],
    queryFn: async () => {
      const res = await organizationsApi.getAll(page + 1, rowsPerPage, { useCache: false, filters: appliedFilters });
      const items = Array.isArray(res?.data) ? res.data : [];
      return { data: items, total: res?.meta?.total ?? items.length };
    },
  });

  const organizations = orgResult?.data ?? [];
  const total = orgResult?.total ?? 0;

  const handleCreate = async (payload) => {
    try {
      if (payload && (payload._id || payload.id)) {
        const id = payload._id || payload.id;
        await organizationsApi.update(id, payload);
        toast.success('Organization updated successfully');
      } else {
        await organizationsApi.create(payload);
        toast.success('Organization created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    } catch (err) {
      console.error('Organization save error:', err);
      toast.error('Failed to save organization. Please try again.');
    }
  };

  const handleToggleActive = async (id, current) => {
    const qKey = ['organizations', page, rowsPerPage, appliedFilters];
    // Optimistic cache update
    queryClient.setQueryData(qKey, (old) =>
      old ? { ...old, data: old.data.map((o) => (o._id === id || o.id === id ? { ...o, isActive: !current } : o)) } : old
    );
    try {
      await organizationsApi.update(id, { isActive: !current });
      toast.success(`Organization ${!current ? 'activated' : 'deactivated'}`);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['organizations', page, rowsPerPage, appliedFilters] }); // revert
      toast.error('Failed to update status.');
    }
  };

  const handleEdit = (item) => {
    if (formRef.current && formRef.current.open) formRef.current.open(item);
  };

  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState(null);

  const handleView = (item) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmTarget, setConfirmTarget] = React.useState(null);

  const openDeleteConfirm = (item) => {
    setConfirmTarget(item);
    setConfirmOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await organizationsApi.delete(id);
      toast.success('Organization deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete organization. Please try again.');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleSearchChange = (val) => {
    setQuery(val);
  };

  const handleOpenFilters = () => setFilterOpen(true);

  const handleApplyFilters = () => {
    const payload = {};
    if (filters.name && filters.name.trim()) payload.name = filters.name.trim();
    if (filters.status) payload.status = filters.status;
    if (filters.createdFrom) payload.createdFrom = filters.createdFrom;
    if (filters.createdTo) payload.createdTo = filters.createdTo;
    setAppliedFilters(payload);
    setPage(0);
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters({ name: '', status: '', createdFrom: '', createdTo: '' });
    setAppliedFilters({});
    setPage(0);
    setFilterOpen(false);
  };

  const filtered = organizations.filter((o) => [o.name].join(' ').toLowerCase().includes(query.toLowerCase()));
  const tableData = filtered.map((item) => ({ ...item, id: item._id || item.id }));

  const columns = getOrganizationColumns({ handleToggleActive, handleView, handleEdit, openDeleteConfirm });

  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search organizations..."
      searchValue={query}
      onSearchChange={handleSearchChange}
      onCopy={() => {}}
      onPrint={() => window.print()}
      showFilter={false}
      onAdd={() => formRef.current && formRef.current.open()}
    />
  );

  return (
    <SuperAdminLayout>
      <div>
        <Breadcrumb title="Organizations" items={[{ label: 'Super Admin', path: '/super-admin/organizations' }, { label: 'Organizations' }]} />

        <NormalTable
          columns={columns}
          data={tableData}
          isLoading={loading}
          toolbar={toolbar}
          showCheckbox={false}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={total}
          onPageChange={(p) => setPage(p)}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
        />

        <OrganizationForm ref={formRef} onSubmit={handleCreate} />

        <NormalModal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter organizations" maxWidth="sm" actions={(
          <>
            <Button onClick={handleClearFilters}>Clear</Button>
            <Button variant="contained" onClick={handleApplyFilters}>Apply</Button>
          </>
        )}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Name" value={filters.name} onChange={(e) => setFilters((s) => ({ ...s, name: e.target.value }))} fullWidth />
            <TextField select label="Status" value={filters.status} onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))} fullWidth>
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField label="Created from" type="date" value={filters.createdFrom} onChange={(e) => setFilters((s) => ({ ...s, createdFrom: e.target.value }))} sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
              <TextField label="Created to" type="date" value={filters.createdTo} onChange={(e) => setFilters((s) => ({ ...s, createdTo: e.target.value }))} sx={{ flex: 1 }} InputLabelProps={{ shrink: true }} />
            </Box>
          </Box>
        </NormalModal>

        <NormalModal open={viewOpen} onClose={() => setViewOpen(false)} title="Organization Details" maxWidth="sm">
          <OrgDetails item={viewItem} />
        </NormalModal>

        <ConfirmDialog
          open={confirmOpen}
          title="Delete organization"
          description={confirmTarget ? `Delete organization "${confirmTarget.name}"? This cannot be undone.` : 'Delete item?'}
          onClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
          onConfirm={() => handleDelete(confirmTarget?._id || confirmTarget?.id)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </SuperAdminLayout>
  );
};

export default OrganizationManagement;
