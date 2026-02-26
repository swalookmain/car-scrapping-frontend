import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Switch, IconButton, Typography, Box, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { organizationsApi } from '../../services/api';
import Breadcrumb from '../../ui/Breadcrumb';
import TableToolbar from '../../ui/TableToolbar';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import OrganizationForm from './OrganizationForm';
import SuperAdminLayout from '../../layout/SuperAdminLayout';

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const formRef = useRef(null);

  useEffect(() => {
    fetchOrganizations(1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrganizations = async (p = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await organizationsApi.getAll(p, limit);
      const items = Array.isArray(res?.data) ? res.data : [];
      setOrganizations(items);
      setTotal(res?.meta?.total ?? items.length);
    } catch (err) {
      setOrganizations([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

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
      fetchOrganizations(1, rowsPerPage);
    } catch (err) {
      console.error('Organization save error:', err);
      toast.error('Failed to save organization. Please try again.');
    }
  };

  const handleToggleActive = async (id, current) => {
    // optimistic update
    setOrganizations((prev) => prev.map((o) => (o._id === id || o.id === id ? { ...o, isActive: !current } : o)));
    try {
      await organizationsApi.update(id, { isActive: !current });
      toast.success(`Organization ${!current ? 'activated' : 'deactivated'}`);
    } catch (err) {
      // revert on error
      setOrganizations((prev) => prev.map((o) => (o._id === id || o.id === id ? { ...o, isActive: current } : o)));
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
      fetchOrganizations(1, rowsPerPage);
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

  const filtered = organizations.filter((o) => [o.name].join(' ').toLowerCase().includes(query.toLowerCase()));
  const tableData = filtered.map((item) => ({ ...item, id: item._id || item.id }));

  const columns = [
    { field: 'name', headerName: 'Name', width: '35%', render: (row) => row.name },
    { field: 'isActive', headerName: 'Status', width: '15%', render: (row) => (
      <Switch checked={Boolean(row.isActive)} onChange={() => handleToggleActive(row._id || row.id, row.isActive)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' } }} />
    ) },
    { field: 'createdAt', headerName: 'Created At', width: '30%', render: (row) => new Date(row.createdAt).toLocaleString() },
    { field: 'actions', headerName: 'Actions', width: '20%', render: (row) => (
      <>
        <IconButton size="small" onClick={() => handleView(row)} aria-label="view" sx={{ color: '#1565c0' }}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => handleEdit(row)} aria-label="edit" sx={{ color: 'var(--color-secondary-main)' }}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => openDeleteConfirm(row)} aria-label="delete" sx={{ color: '#e53935' }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </>
    ) }
  ];

  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search organizations..."
      searchValue={query}
      onSearchChange={handleSearchChange}
      onCopy={() => {}}
      onPrint={() => window.print()}
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
          onPageChange={(p) => { setPage(p); fetchOrganizations(p + 1, rowsPerPage); }}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); fetchOrganizations(1, r); }}
        />

        <OrganizationForm ref={formRef} onSubmit={handleCreate} />

        <NormalModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          title="Organization Details"
          maxWidth="sm"
        >
          {viewItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { label: 'Name', value: viewItem.name },
                { label: 'Status', value: viewItem.isActive ? 'Active' : 'Inactive' },
                { label: 'Created At', value: viewItem.createdAt ? new Date(viewItem.createdAt).toLocaleString() : '—' },
              ].map(({ label, value }) => (
                <Box key={label}>
                  <Typography variant="caption" sx={{ color: 'var(--color-grey-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-grey-900)', mt: 0.25 }}>{value || '—'}</Typography>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Box>
          )}
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
