import React, { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import toast from 'react-hot-toast';
import NormalModal from '../../ui/NormalModal';
import NormalTable from '../../ui/NormalTable';
import TableToolbar from '../../ui/TableToolbar';
import ConfirmDialog from '../../ui/ConfirmDialog';
import InventoryForm from './InventoryForm';
import { inventoryApi, materialMasterApi } from '../../services/api';
import { usePermissions } from '../../hooks/usePermissions';
import inputSx from '../../services/inputStyles';

const InventoryTable = ({ isLoading }) => {
  const { canPerform } = usePermissions();
  const queryClient = useQueryClient();
  const formRef = useRef(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [matDialogOpen, setMatDialogOpen] = useState(false);
  const [newMat, setNewMat] = useState({
    code: '',
    label: '',
    matterClass: 'OTHER',
    formSection: 'OUTWARDS',
  });

  const { data: vehicleResult, isLoading: loadingData, refetch } = useQuery({
    queryKey: ['inventory-vehicles', page, rowsPerPage, query],
    queryFn: async () => {
      const res = await inventoryApi.getVehicles({
        page: page + 1,
        limit: rowsPerPage,
        search: query.trim() || undefined,
      });
      const items = Array.isArray(res?.data) ? res.data : [];
      return {
        data: items.map((r) => ({
          ...r,
          id: r.vechileId || r._id,
        })),
        total: res?.meta?.total ?? items.length,
      };
    },
    placeholderData: (prev) => prev,
  });

  const vehicles = vehicleResult?.data ?? [];
  const total = vehicleResult?.total ?? 0;

  const { data: materials = [], refetch: refetchMaterials } = useQuery({
    queryKey: ['material-master'],
    queryFn: async () => {
      const res = await materialMasterApi.list();
      return Array.isArray(res) ? res : res?.data ?? [];
    },
    staleTime: 60_000,
  });

  const {
    data: vehicleDetail,
    isLoading: detailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['inventory-by-vehicle', selectedVehicle?.vechileId],
    queryFn: () => inventoryApi.getByVehicle(selectedVehicle.vechileId),
    enabled: Boolean(selectedVehicle?.vechileId) && drawerOpen,
  });

  const parts = useMemo(
    () =>
      (vehicleDetail?.parts ?? []).map((p) => ({
        ...p,
        id: p._id || p.id,
      })),
    [vehicleDetail],
  );

  const handleAdd = useCallback(() => {
    formRef.current?.open?.();
  }, []);

  const handleCreateOrUpdate = async (result) => {
    try {
      if (result.type === 'update') {
        await inventoryApi.update(result.id, result.payload);
        toast.success('Part updated');
      } else {
        await inventoryApi.create(result.payload);
        toast.success('Parts added');
      }
      inventoryApi.invalidateCache();
      queryClient.invalidateQueries({ queryKey: ['inventory-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-by-vehicle'] });
      refetchDetail();
      formRef.current?.close?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Save failed');
      throw err;
    }
  };

  const openVehicle = useCallback((row) => {
    setSelectedVehicle(row);
    setDrawerOpen(true);
  }, []);

  const handleDeletePart = async () => {
    if (!confirmTarget) return;
    try {
      await inventoryApi.delete(confirmTarget._id || confirmTarget.id);
      toast.success('Part deleted');
      inventoryApi.invalidateCache();
      queryClient.invalidateQueries({ queryKey: ['inventory-vehicles'] });
      refetchDetail();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleAddMaterial = async () => {
    try {
      await materialMasterApi.create(newMat);
      toast.success('Material added');
      await refetchMaterials();
      setMatDialogOpen(false);
      setNewMat({
        code: '',
        label: '',
        matterClass: 'OTHER',
        formSection: 'OUTWARDS',
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add material');
    }
  };

  const vehicleColumns = useMemo(
    () => [
      {
        field: 'registrationNumber',
        headerName: 'Registration',
        width: '16%',
        render: (row) => row.registrationNumber || '—',
      },
      {
        field: 'vehicle',
        headerName: 'Vehicle',
        width: '22%',
        render: (row) =>
          `${row.make || ''} ${row.modelName || row.vechileModel || ''}`.trim() ||
          '—',
      },
      {
        field: 'purchaseInvoiceNumber',
        headerName: 'Invoice',
        width: '14%',
      },
      {
        field: 'formVehicleClass',
        headerName: 'Class',
        width: '8%',
        render: (row) => row.formVehicleClass || '—',
      },
      { field: 'partCount', headerName: 'Parts', width: '8%' },
      {
        field: 'grossWeightKg',
        headerName: 'In (KG)',
        width: '10%',
        render: (row) => row.grossWeightKg ?? '—',
      },
      {
        field: 'totalWeightKg',
        headerName: 'Out (KG)',
        width: '10%',
        render: (row) => Number(row.totalWeightKg || 0).toFixed(2),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: '12%',
        render: (row) => (
          <Button size="small" onClick={() => openVehicle(row)}>
            View parts
          </Button>
        ),
      },
    ],
    [openVehicle],
  );

  const partColumns = useMemo(
    () => [
      { field: 'partName', headerName: 'Part', width: '22%' },
      {
        field: 'materialCode',
        headerName: 'Material',
        width: '12%',
        render: (r) => r.materialCode || '—',
      },
      {
        field: 'stateOfMatter',
        headerName: 'State',
        width: '10%',
        render: (r) => r.stateOfMatter || '—',
      },
      {
        field: 'weightKg',
        headerName: 'KG',
        width: '8%',
        render: (r) => r.weightKg ?? '—',
      },
      { field: 'openingStock', headerName: 'Qty', width: '8%' },
      { field: 'condition', headerName: 'Cond.', width: '10%' },
      {
        field: 'actions',
        headerName: '',
        width: '18%',
        render: (row) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canPerform('inventory:edit') && (
              <IconButton size="small" onClick={() => formRef.current?.open?.(row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {canPerform('inventory:delete') && (
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setConfirmTarget(row);
                  setConfirmOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ),
      },
    ],
    [canPerform],
  );

  return (
    <Box>
      <TableToolbar
        searchPlaceholder="Search registration / make / invoice..."
        searchValue={query}
        onSearchChange={(v) => {
          setQuery(v);
          setPage(0);
        }}
        onAdd={canPerform('inventory:create') ? handleAdd : undefined}
        showAdd={canPerform('inventory:create')}
        showFilter={false}
        showRefresh
        onRefresh={refetch}
      />

      <NormalTable
        columns={vehicleColumns}
        data={vehicles}
        isLoading={isLoading || loadingData}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={total}
        onPageChange={setPage}
        onRowsPerPageChange={(n) => {
          setRowsPerPage(n);
          setPage(0);
        }}
      />

      <NormalModal
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          selectedVehicle
            ? `${selectedVehicle.registrationNumber || 'Vehicle'} · parts`
            : 'Parts'
        }
        maxWidth="lg"
        actions={
          <>
            <Button onClick={() => setDrawerOpen(false)} startIcon={<CloseIcon />}>
              Close
            </Button>
            {canPerform('inventory:create') && selectedVehicle && (
              <Button
                variant="contained"
                onClick={() =>
                  formRef.current?.openAddMore?.({
                    vechileId: selectedVehicle.vechileId,
                    invoiceId: selectedVehicle.invoiceId,
                    registration_number: selectedVehicle.registrationNumber,
                    make: selectedVehicle.make,
                    model_name: selectedVehicle.modelName,
                  })
                }
              >
                Add more parts
              </Button>
            )}
          </>
        }
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Inwards: {selectedVehicle?.grossWeightKg ?? '—'} KG · Parts out:{' '}
          {Number(
            vehicleDetail?.totalWeightKg || selectedVehicle?.totalWeightKg || 0,
          ).toFixed(2)}{' '}
          KG
        </Typography>
        <NormalTable
          columns={partColumns}
          data={parts}
          isLoading={detailLoading}
        />
      </NormalModal>

      <InventoryForm
        ref={formRef}
        onSubmit={handleCreateOrUpdate}
        materials={materials}
        onRequestAddMaterial={() => setMatDialogOpen(true)}
      />

      <Dialog open={matDialogOpen} onClose={() => setMatDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add material</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Code"
            value={newMat.code}
            onChange={(e) =>
              setNewMat((p) => ({ ...p, code: e.target.value.toUpperCase() }))
            }
            sx={{ ...inputSx, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Label"
            value={newMat.label}
            onChange={(e) => setNewMat((p) => ({ ...p, label: e.target.value }))}
            sx={{ ...inputSx, mt: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Matter class"
            value={newMat.matterClass}
            onChange={(e) => setNewMat((p) => ({ ...p, matterClass: e.target.value }))}
            sx={{ ...inputSx, mt: 2 }}
          >
            {['METAL', 'NON_METAL', 'OTHER'].map((v) => (
              <MenuItem key={v} value={v}>
                {v}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMatDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMaterial}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete part"
        description="Delete this inventory part? This cannot be undone."
        onConfirm={handleDeletePart}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmTarget(null);
        }}
      />
    </Box>
  );
};

InventoryTable.propTypes = {
  isLoading: PropTypes.bool,
};

export default InventoryTable;
