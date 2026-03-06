import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { usersApi, organizationsApi } from '../../services/api';
import getAdminColumns from './adminColumns';
import AdminDetails from './AdminDetails';
import Breadcrumb from '../../ui/Breadcrumb';
import TableToolbar from '../../ui/TableToolbar';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import AdminForm from './AdminForm';
import SuperAdminLayout from '../../layout/SuperAdminLayout';

const AdminManagement = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formRef = useRef(null);

  // ── Fetch admins ───────────────────────────────────────────
  const { data: adminResult, isLoading: loading } = useQuery({
    queryKey: ['admins', page, rowsPerPage],
    queryFn: async () => {
      const res = await usersApi.getUsers(page + 1, rowsPerPage);
      const users = Array.isArray(res?.data) ? res.data : [];
      return { data: users.filter((u) => u.role === 'ADMIN'), total: res?.meta?.total ?? users.length };
    },
  });

  // ── Fetch organizations for dropdown ─────────────────────────────
  const { data: orgs = [] } = useQuery({
    queryKey: ['organizations-list'],
    queryFn: async () => {
      const res = await organizationsApi.getAll(1, 100);
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const admins = adminResult?.data  ?? [];
  const total  = adminResult?.total ?? 0;

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
      queryClient.invalidateQueries({ queryKey: ['admins'] });
    } catch (err) {
      console.error('Admin save error:', err);
      toast.error('Failed to save admin. Please try again.');
    }
  };

  const handleToggleActiveUser = async (id, current) => {
    const qKey = ['admins', page, rowsPerPage];
    queryClient.setQueryData(qKey, (old) =>
      old ? { ...old, data: old.data.map((u) => (u._id === id || u.id === id ? { ...u, isActive: !current } : u)) } : old
    );
    try {
      await usersApi.updateUser(id, { isActive: !current });
      toast.success(`Admin ${!current ? 'activated' : 'deactivated'}`);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
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
      queryClient.invalidateQueries({ queryKey: ['admins'] });
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

  const columns = getAdminColumns({ orgs, handleToggleActiveUser, handleEdit, handleView, openDeleteConfirm });

  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search admins..."
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
          onPageChange={(p) => setPage(p)}
          onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
        />
        <AdminForm ref={formRef} onSubmit={handleCreate} organizations={orgs} />

        <NormalModal open={viewOpen} onClose={() => setViewOpen(false)} title="Admin Details" maxWidth="sm">
          <AdminDetails item={viewItem} orgs={orgs} />
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
