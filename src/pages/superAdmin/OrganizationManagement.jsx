import React, { useState, useEffect, useRef } from 'react';
import { Switch, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { organizationsApi } from '../../services/api';
import Breadcrumb from '../../ui/Breadcrumb';
import TableToolbar from '../../ui/TableToolbar';
import NormalTable from '../../ui/NormalTable';
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
      } else {
        await organizationsApi.create(payload);
      }
      fetchOrganizations(1, rowsPerPage);
    } catch (err) {
      // handle error
    }
  };

  const handleToggleActive = async (id, current) => {
    // optimistic update
    setOrganizations((prev) => prev.map((o) => (o._id === id || o.id === id ? { ...o, isActive: !current } : o)));
    try {
      await organizationsApi.update(id, { isActive: !current });
    } catch (err) {
      // revert on error
      setOrganizations((prev) => prev.map((o) => (o._id === id || o.id === id ? { ...o, isActive: current } : o)));
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
      await organizationsApi.delete(id);
      fetchOrganizations(1, rowsPerPage);
    } catch (err) {
      // handle error
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
