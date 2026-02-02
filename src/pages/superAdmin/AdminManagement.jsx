import React, { useState, useEffect, useRef } from 'react';
import { Switch, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usersApi, organizationsApi } from '../../services/api';
import Breadcrumb from '../../ui/Breadcrumb';
import TableToolbar from '../../ui/TableToolbar';
import NormalTable from '../../ui/NormalTable';
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
      } else {
        await usersApi.createUser({ ...body, role: 'ADMIN' });
      }
      fetchAdmins(page + 1, rowsPerPage);
    } catch (err) {
      // handle error
    }
  };

  const handleToggleActiveUser = async (id, current) => {
    setAdmins((prev) => prev.map((u) => (u._id === id || u.id === id ? { ...u, isActive: !current } : u)));
    try {
      await usersApi.updateUser(id, { isActive: !current });
    } catch (err) {
      setAdmins((prev) => prev.map((u) => (u._id === id || u.id === id ? { ...u, isActive: current } : u)));
    }
  };

  const handleEdit = (item) => {
    if (formRef.current && formRef.current.open) formRef.current.open(item);
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
      fetchAdmins(1, rowsPerPage);
    } catch (err) {
      // handle error
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
    { field: 'actions', headerName: 'Actions', width: '8%', render: (row) => (
      <>
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
