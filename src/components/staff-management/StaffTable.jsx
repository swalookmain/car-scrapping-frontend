import React, { useMemo, useState, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import { Typography, Switch, Tooltip, IconButton, Box, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmDialog from '../../ui/ConfirmDialog';
import NormalTable from '../../ui/NormalTable';
import NormalModal from '../../ui/NormalModal';
import TableToolbar from '../../ui/TableToolbar';
import StaffForm from './StaffForm';
import getStaffColumns from './staffColumns';
import StaffDetails from './StaffDetails';
import { usersApi } from '../../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../../hooks/usePermissions';


const StaffTable = ({ isLoading, organizationId = null }) => {
  const { canPerform } = usePermissions();
  const queryClient = useQueryClient();
  const tableRef = useRef(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { data: staffResult, isLoading: loadingData, refetch: refetchStaff } = useQuery({
    queryKey: ['staff', organizationId, page, rowsPerPage],
    queryFn: async () => {
      if (organizationId) {
        const res = await usersApi.getAllStaffByOrganization(organizationId, page + 1, rowsPerPage);
        const items = Array.isArray(res?.data) ? res.data : [];
        return {
          data: items.map((it) => ({ id: it._id || it.id, name: it.name, phone: it.phoneNumber || it.phone || '', email: it.email || '', status: it.isActive ? 'Active' : 'Inactive' })),
          total: res?.meta?.total ?? items.length,
        };
      } else {
        const res = await usersApi.getUsers(page + 1, rowsPerPage);
        const items = Array.isArray(res?.data) ? res.data : [];
        const staffItems = items.filter((u) => u.role === 'STAFF');
        return {
          data: staffItems.map((it) => ({ id: it._id || it.id, name: it.name, phone: it.phoneNumber || it.phone || '', email: it.email || '', status: it.isActive ? 'Active' : 'Inactive' })),
          total: res?.meta?.total ?? staffItems.length,
        };
      }
    },
  });

  const staffData = staffResult?.data ?? [];
  const total = staffResult?.total ?? 0;

  const staffFormRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const handleView = useCallback((item) => {
    setViewItem(item);
    setViewOpen(true);
  }, []);

  const handleAddStaff = useCallback(() => {
    if (staffFormRef.current && staffFormRef.current.open) staffFormRef.current.open();
  }, []);

  // Create staff entry when form submits; StaffForm will call this with the new staff data (without id)
  const handleCreateStaff = async (staff) => {
    try {
      const payload = { name: staff.name, phoneNumber: staff.phone, email: staff.email, password: staff.password, isActive: Boolean(staff.isActive) };
      await usersApi.createStaff(payload);
      toast.success('Staff member created successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setPage(0);
    } catch (err) {
      console.error('Failed to create staff:', err);
      toast.error('Failed to create staff. Please try again.');
    }
  };

  // handle create or update from StaffForm
  const handleCreateOrUpdateStaff = async (staff, editingId) => {
    if (editingId) {
      try {
        await usersApi.updateUser(editingId, { name: staff.name, phoneNumber: staff.phone, email: staff.email, isActive: Boolean(staff.isActive) });
        toast.success('Staff member updated successfully');
        queryClient.invalidateQueries({ queryKey: ['staff'] });
      } catch (err) {
        toast.error('Failed to update staff. Please try again.');
      }
    } else {
      return handleCreateStaff(staff);
    }
  };

  // Client-side search filter only (pagination is server-side)
  const filteredData = useMemo(() => {
    if (!query.trim()) return staffData;
    const q = query.toLowerCase();
    return staffData.filter((s) =>
      [s.name, s.email].join(' ').toLowerCase().includes(q)
    );
  }, [query, staffData]);

  // Move toggle handler above column creation (columns use it)
  const handleToggleActive = async (id) => {
    const target = staffData.find((s) => s.id === id);
    const newActive = target?.status !== 'Active';
    const qKey = ['staff', organizationId, page, rowsPerPage];
    queryClient.setQueryData(qKey, (old) =>
      old ? { ...old, data: old.data.map((s) => s.id === id ? { ...s, status: newActive ? 'Active' : 'Inactive' } : s) } : old
    );
    try {
      await usersApi.updateUser(id, { isActive: newActive });
      toast.success(`Staff ${newActive ? 'activated' : 'deactivated'}`);
    } catch {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.error('Failed to update status.');
    }
  };

  const handleEdit = useCallback((item) => {
    if (staffFormRef.current && staffFormRef.current.open) staffFormRef.current.open(item);
  }, []);

  const openDeleteConfirm = useCallback((item) => {
    setConfirmTarget(item);
    setConfirmOpen(true);
  }, []);

  // Define table columns using the extracted module
  const columns = getStaffColumns({ canPerform, handleToggleActive, handleView, handleEdit, openDeleteConfirm });

  const handleDelete = async (id) => {
    try {
      await usersApi.deleteUser(id);
      toast.success('Staff member deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setPage(0);
    } catch (err) {
      toast.error('Failed to delete staff. Please try again.');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  // Toolbar with search, copy, print, filter, add
  const handleCopy = useCallback(() => {
    console.log('Copy table data');
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

//   const handleFilter = () => {
//     console.log('Open filter modal');
//   };

  const toolbar = (
    <TableToolbar
      searchPlaceholder="Search Staff..."
      searchValue={query}
      onSearchChange={(val) => { setQuery(val); setPage(0); }}
      onCopy={handleCopy}
      onPrint={handlePrint}
      showFilter={false}
      onRefresh={() => refetchStaff()}
      showRefresh={true}
      onAdd={handleAddStaff}
      showExportCsv={true}
      onExportCsv={() => tableRef.current?.exportCsv()}
      showColumnToggle={true}
      onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
    />
  );

  return (
    <>
      <NormalTable
        ref={tableRef}
        columns={columns}
        data={filteredData}
        isLoading={isLoading || loadingData}
        toolbar={toolbar}
        showCheckbox={false}
        csvFilename="staff"
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={total}
        onPageChange={(p) => setPage(p)}
        onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }}
      />

      <StaffForm ref={staffFormRef} onSubmit={handleCreateOrUpdateStaff} />

      <NormalModal open={viewOpen} onClose={() => setViewOpen(false)} title="Staff Details" maxWidth="sm">
        <StaffDetails item={viewItem} />
      </NormalModal>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete staff"
        description={confirmTarget ? `Delete staff "${confirmTarget.name}"? This cannot be undone.` : 'Delete item?'}
        onClose={() => { setConfirmOpen(false); setConfirmTarget(null); }}
        onConfirm={() => handleDelete(confirmTarget?.id || confirmTarget?._id)}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

StaffTable.propTypes = {
  isLoading: PropTypes.bool
};

export default StaffTable;
