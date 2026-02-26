import React, { useMemo, useState, useRef, useEffect } from 'react';
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
import { usersApi } from '../../services/api';
import toast from 'react-hot-toast';

// Sample staff data - replace with actual data from API
const sampleStaffData = [
  {
    id: 1,
    name: 'John Doe',
    phone: '+1 234 567 8900',
    email: 'john.doe@example.com',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    phone: '+1 234 567 8901',
    email: 'jane.smith@example.com',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    phone: '+1 234 567 8902',
    email: 'mike.johnson@example.com',
    status: 'Inactive'
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    phone: '+1 234 567 8903',
    email: 'sarah.wilson@example.com',
    status: 'Active'
  }
];

const StaffTable = ({ isLoading, organizationId = null }) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [staffData, setStaffData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchStaff = async () => {
      setLoadingData(true);
      try {
        if (organizationId) {
          const res = await usersApi.getAllStaffByOrganization(organizationId, 1, 100);
          const items = Array.isArray(res?.data) ? res.data : [];
          if (mounted) setStaffData(items.map((it) => ({ id: it._id || it.id, name: it.name, phone: it.phone || '', email: it.email || '', status: it.isActive ? 'Active' : 'Inactive' })));
        } else {
          const res = await usersApi.getUsers(1, 100);
          const items = Array.isArray(res?.data) ? res.data : [];
          const staffItems = items.filter((u) => u.role === 'STAFF');
          if (mounted) setStaffData(staffItems.map((it) => ({ id: it._id || it.id, name: it.name, phone: it.phone || '', email: it.email || '', status: it.isActive ? 'Active' : 'Inactive' })));
        }
      } catch (err) {
        // keep empty list on error
        if (mounted) setStaffData([]);
      } finally {
        if (mounted) setLoadingData(false);
      }
    };
    fetchStaff();
    return () => { mounted = false; };
  }, [organizationId]);

  const staffFormRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  const handleView = (item) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const handleAddStaff = () => {
    if (staffFormRef.current && staffFormRef.current.open) staffFormRef.current.open();
  };

  // Create staff entry when form submits; StaffForm will call this with the new staff data (without id)
  const handleCreateStaff = async (staff) => {
    try {
      const payload = { name: staff.name, phone: staff.phone, email: staff.email, password: staff.password, isActive: Boolean(staff.isActive) };
      const res = await usersApi.createStaff(payload);
      const created = res?.data || res;
      const newStaff = { id: created._id || created.id || Date.now(), name: created.name || staff.name, phone: created.phone || staff.phone, email: created.email || staff.email, status: created.isActive ? 'Active' : 'Inactive' };
      setStaffData((prev) => [...prev, newStaff]);
      toast.success('Staff member created successfully');
    } catch (err) {
      console.error('Failed to create staff:', err);
      toast.error('Failed to create staff. Please try again.');
    }
  };

  // handle create or update from StaffForm
  const handleCreateOrUpdateStaff = async (staff, editingId) => {
    if (editingId) {
      // update
      try {
        await usersApi.updateUser(editingId, { name: staff.name, phone: staff.phone, email: staff.email, isActive: Boolean(staff.isActive) });
        setStaffData((prev) => prev.map((s) => (s.id === editingId ? { ...s, name: staff.name, phone: staff.phone, email: staff.email, status: staff.isActive ? 'Active' : 'Inactive' } : s)));
        toast.success('Staff member updated successfully');
      } catch (err) {
        toast.error('Failed to update staff. Please try again.');
      }
    } else {
      return handleCreateStaff(staff);
    }
  };

  // Filtered & searched data
  const filteredData = useMemo(() => {
    return staffData.filter((s) => {
      const matchesQuery = [s.name, s.email].join(' ').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : s.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, staffData]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Define table columns
  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: '25%',
      render: (row) => (
        <Typography variant="body1" sx={{ fontWeight: 500, color: 'var(--color-grey-900)' }}>
          {row.name}
        </Typography>
      )
    },
    {
      field: 'phone',
      headerName: 'Phone Number',
      width: '20%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
          {row.phone}
        </Typography>
      )
    },
    {
      field: 'email',
      headerName: 'Email ID',
      width: '30%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
          {row.email}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Is Active',
      width: '15%',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tooltip title={row.status === 'Active' ? 'Active' : 'Inactive'}>
            <Switch
              checked={row.status === 'Active'}
              onChange={() => handleToggleActive(row.id)}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'var(--color-secondary-main)',
                  '&:hover': { backgroundColor: 'rgba(103,58,183,0.08)' }
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'var(--color-secondary-main)'
                }
              }}
            />
          </Tooltip>
        </div>
      )
    }
    ,
    {
      field: 'actions',
      headerName: 'Actions',
      width: '15%',
      render: (row) => (
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
      )
    }
  ];

  // Toggle active/inactive status for a staff member
  const handleToggleActive = async (id) => {
    const target = staffData.find((s) => s.id === id);
    const newActive = target?.status !== 'Active';
    setStaffData((prev) => prev.map((s) => (s.id === id ? { ...s, status: newActive ? 'Active' : 'Inactive' } : s)));
    try {
      await usersApi.updateUser(id, { isActive: newActive });
      toast.success(`Staff ${newActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      // revert
      setStaffData((prev) => prev.map((s) => (s.id === id ? { ...s, status: !newActive ? 'Active' : 'Inactive' } : s)));
      toast.error('Failed to update status.');
    }
  };

  const handleEdit = (item) => {
    if (staffFormRef.current && staffFormRef.current.open) staffFormRef.current.open(item);
  };

  const openDeleteConfirm = (item) => {
    setConfirmTarget(item);
    setConfirmOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await usersApi.deleteUser(id);
      toast.success('Staff member deleted successfully');
      setStaffData((prev) => prev.filter((s) => s.id !== id && s.id !== (id)));
    } catch (err) {
      toast.error('Failed to delete staff. Please try again.');
      // fallback: remove locally
      setStaffData((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  // Toolbar with search, copy, print, filter, add
  const handleCopy = () => {
    console.log('Copy table data');
  };

  const handlePrint = () => {
    window.print();
  };

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
      // onFilter={(filter) => { setStatusFilter(filter); setPage(0); }}
      onAdd={handleAddStaff}
    />
  );

  return (
    <>
      <NormalTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading || loadingData}
        toolbar={toolbar}
        showCheckbox={true}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredData.length}
        onPageChange={setPage}
        onRowsPerPageChange={(val) => { setRowsPerPage(val); setPage(0); }}
      />

      <StaffForm ref={staffFormRef} onSubmit={handleCreateOrUpdateStaff} />

      <NormalModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Staff Details"
        maxWidth="sm"
      >
        {viewItem && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Name', value: viewItem.name },
              { label: 'Phone Number', value: viewItem.phone },
              { label: 'Email ID', value: viewItem.email },
              { label: 'Status', value: viewItem.status },
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
