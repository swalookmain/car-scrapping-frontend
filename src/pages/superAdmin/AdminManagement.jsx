import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Switch, IconButton, Typography, Box, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usersApi, organizationsApi } from '../../services/api';
import Breadcrumb from '../../ui/Breadcrumb';
import TableToolbar from '../../ui/TableToolbar';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import AdminForm from './AdminForm';
import SuperAdminLayout from '../../layout/SuperAdminLayout';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const formRef = useRef(null);

  useEffect(() => {
    fetchOrgs();
    fetchAdmins(1, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdmins = async (p = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers(p, limit);
      const users = Array.isArray(res?.data) ? res.data : [];
      setAdmins(users.filter((u) => u.role === 'ADMIN'));
      setTotal(res?.meta?.total ?? users.length);
    } catch (err) {
      setAdmins([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgs = async () => {
    try {
      const res = await organizationsApi.getAll(1, 100);
      setOrgs(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setOrgs([]);
    }
  };

  const handleCreate = async (payload, editingId) => {
    try {
      const id = editingId || payload?._id || payload?.id;
      const body = { ...payload };
      if (!body.password) delete body.password;
      if (id) {
        await usersApi.updateUser(id, body);
        toast.success('Admin updated successfully');
      } else {
        await usersApi.createUser({ ...body, role: 'ADMIN' });
        toast.success('Admin created successfully');
      }
      fetchAdmins(page + 1, rowsPerPage);
    } catch (err) {
      console.error('Admin save error:', err);
      toast.error('Failed to save admin. Please try again.');
    }
  };

  const handleToggleActiveUser = async (id, current) => {
    setAdmins((prev) => prev.map((u) => (u._id === id || u.id === id ? { ...u, isActive: !current } : u)));
    try {
      await usersApi.updateUser(id, { isActive: !current });
      toast.success(`Admin ${!current ? 'activated' : 'deactivated'}`);
    } catch (err) {
      setAdmins((prev) => prev.map((u) => (u._id === id || u.id === id ? { ...u, isActive: current } : u)));
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
      await usersApi.deleteUser(id);
      toast.success('Admin deleted successfully');
      fetchAdmins(1, rowsPerPage);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete admin. Please try again.');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleSearchChange = (val) => setQuery(val);

  const filtered = admins.filter((a) => [a.name, a.email].join(' ').toLowerCase().includes(query.toLowerCase()));
  const tableData = filtered.map((item) => ({ ...item, id: item._id || item.id }));

  const columns = [
    { field: 'name', headerName: 'Name', width: '25%', render: (row) => row.name },
    { field: 'email', headerName: 'Email', width: '30%', render: (row) => row.email },
    { field: 'role', headerName: 'Role', width: '10%', render: (row) => row.role },
    { field: 'organizationId', headerName: 'Organization', width: '20%', render: (row) => (orgs.find(o => (o._id || o.id) === row.organizationId)?.name || '-') },
    { field: 'isActive', headerName: 'Active', width: '7%', render: (row) => (
      <Switch checked={Boolean(row.isActive)} onChange={() => handleToggleActiveUser(row._id || row.id, row.isActive)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: 'var(--color-secondary-main)' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'var(--color-secondary-main)' } }} />
    ) },
    { field: 'actions', headerName: 'Actions', width: '12%', render: (row) => (
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
      searchPlaceholder="Search admins..."
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
        <Breadcrumb title="Admin Users" items={[{ label: 'Super Admin', path: '/super-admin/admins' }, { label: 'Admins' }]} />

        <NormalTable
          columns={columns}
          data={tableData}
          isLoading={loading}
          toolbar={toolbar}
          showCheckbox={false}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={total}
          onPageChange={(p) => { setPage(p); fetchAdmins(p + 1, rowsPerPage); }}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); fetchAdmins(1, r); }}
        />
        <AdminForm ref={formRef} onSubmit={handleCreate} organizations={orgs} />

        <NormalModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          title="Admin Details"
          maxWidth="sm"
        >
          {viewItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { label: 'Name', value: viewItem.name },
                { label: 'Email', value: viewItem.email },
                { label: 'Role', value: viewItem.role },
                { label: 'Organization', value: orgs.find(o => (o._id || o.id) === viewItem.organizationId)?.name || '—' },
                { label: 'Status', value: viewItem.isActive ? 'Active' : 'Inactive' },
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
          title="Delete user"
          description={confirmTarget ? `Delete user "${confirmTarget.name}"? This cannot be undone.` : 'Delete item?'}
          onClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
          onConfirm={() => handleDelete(confirmTarget?._id || confirmTarget?.id)}
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </SuperAdminLayout>
  );
};

export default AdminManagement;
