import React, { useMemo, useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import NormalTable from '../../ui/NormalTable';
import TableToolbar from '../../ui/TableToolbar';
import NormalModal from '../../ui/NormalModal';
import { auctionsApi } from '../../services/api';
import inputSx from '../../services/inputStyles';

const STEPS = ['Auction details', 'Lots', 'Vehicles & photos'];
const AUCTION_STATUS_OPTIONS = ['UPCOMING', 'ONGOING', 'STA', 'DEAL_DONE', 'REJECTED', 'LEFT', 'CANCELLED'];

/** Same options as [LeadForm.jsx](lead-management/LeadForm.jsx) */
const VEHICLE_TYPES = ['CAR', 'BIKE', 'COMMERCIAL'];

const OFFICER_TYPE_SELLER = 'SELLER';

const INITIAL_AUCTION = {
  auctionerName: 'MSTC',
  auctionNumber: '',
  auctionDate: '',
  startTime: '',
  endTime: '',
  inspectionFromDate: '',
  inspectionToDate: '',
  vehicleLocation: '',
  sellerName: '',
  sellerMobileNumber: '',
  sellerEmail: '',
  sellerAccountNumber: '',
  sellerTaxMode: 'RCM',
};

const INITIAL_LOT = {
  id: '',
  lotName: '',
  lotNumber: '',
  preEmdAmount: '',
  lotDescription: '',
  vehicleCount: 1,
};

const INITIAL_VEHICLE = {
  vehicleType: 'CAR',
  make: '',
  model: '',
  variant: '',
  /** Same meaning as lead "Vehicle number" (registration plate) */
  vehicleNumber: '',
  color: '',
  chassisLast5: '',
  yearOfManufacture: '',
};

/** Same categories as lead vehicle images; keys match backend multipart field names */
const VEHICLE_PHOTO_FIELDS = [
  { key: 'vehicleFront', label: 'Front' },
  { key: 'vehicleRight', label: 'Right side' },
  { key: 'vehicleEngine', label: 'Engine' },
  { key: 'vehicleLeft', label: 'Left side' },
  { key: 'vehicleBack', label: 'Back / rear' },
  { key: 'vehicleInterior', label: 'Interior' },
];

const formatTimeFromDate = (d) =>
  d
    ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    : '';

const toIsoDateTime = (dateValue, timeValue) =>
  dateValue && timeValue ? new Date(`${dateValue}T${timeValue}:00`).toISOString() : '';

const emptyOfficers = (auctionerName = 'MSTC') => [
  { name: '', email: '', phoneNumber: '', officerType: auctionerName },
];

const AuctionTable = () => {
  const queryClient = useQueryClient();
  const tableRef = useRef(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [query, setQuery] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuRow, setMenuRow] = useState(null);

  const [openAuctionModal, setOpenAuctionModal] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [wizardMode, setWizardMode] = useState('create'); // create | edit | addLot
  const [auctionId, setAuctionId] = useState('');
  const [auctionForm, setAuctionForm] = useState(INITIAL_AUCTION);
  const [officers, setOfficers] = useState(() => emptyOfficers());
  const [lots, setLots] = useState([{ ...INITIAL_LOT }]);
  const [selectedLotIndex, setSelectedLotIndex] = useState(0);
  /** vehiclesByLotIndex[lotIndex][vehicleIndex] */
  const [vehiclesByLotIndex, setVehiclesByLotIndex] = useState({});
  /** imagesByLotIndex[lotIndex][vehicleIndex][fieldKey] = File */
  const [imagesByLotIndex, setImagesByLotIndex] = useState({});
  const [copyCommon, setCopyCommon] = useState(false);
  const [commonVehicle, setCommonVehicle] = useState({
    vehicleType: 'CAR',
    make: '',
    model: '',
    variant: '',
    color: '',
    yearOfManufacture: '',
  });

  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewAuction, setViewAuction] = useState(null);
  const [initialAuctionStepPayload, setInitialAuctionStepPayload] = useState(null);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: 'UPCOMING', dealDoneAt: '' });

  const resetWizardState = useCallback(() => {
    setActiveStep(0);
    setWizardMode('create');
    setAuctionId('');
    setAuctionForm({ ...INITIAL_AUCTION });
    setOfficers(emptyOfficers(INITIAL_AUCTION.auctionerName));
    setLots([{ ...INITIAL_LOT }]);
    setSelectedLotIndex(0);
    setVehiclesByLotIndex({});
    setImagesByLotIndex({});
    setCopyCommon(false);
    setInitialAuctionStepPayload(null);
    setOpenStatusModal(false);
    setStatusForm({ status: 'UPCOMING', dealDoneAt: '' });
    setCommonVehicle({
      vehicleType: 'CAR',
      make: '',
      model: '',
      variant: '',
      color: '',
      yearOfManufacture: '',
    });
  }, []);

  const ensureVehicleSlotsForLot = useCallback((lotIndex, count) => {
    setVehiclesByLotIndex((prev) => {
      const next = { ...prev };
      const existing = Array.isArray(next[lotIndex]) ? [...next[lotIndex]] : [];
      while (existing.length < count) {
        existing.push({ ...INITIAL_VEHICLE });
      }
      next[lotIndex] = existing.slice(0, count);
      return next;
    });
    setImagesByLotIndex((prev) => {
      const next = { ...prev };
      const existing = Array.isArray(next[lotIndex]) ? [...next[lotIndex]] : [];
      while (existing.length < count) {
        existing.push({});
      }
      next[lotIndex] = existing.slice(0, count);
      return next;
    });
  }, []);

  const { data: auctionResult, isLoading, refetch } = useQuery({
    queryKey: ['auctions', page, rowsPerPage],
    queryFn: async () => {
      const res = await auctionsApi.getAll({ page: page + 1, limit: rowsPerPage });
      const items = Array.isArray(res?.data) ? res.data : [];
      return { data: items, total: res?.meta?.total ?? items.length };
    },
  });

  const rows = useMemo(() => {
    const items = auctionResult?.data ?? [];
    const filtered = query.trim()
      ? items.filter((row) =>
          [row.auctionNumber, row.status, row.vehicleLocation || row.auctionLocation, row.auctionerName || row.sourcePlatform]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
      : items;
    return filtered.map((row) => ({ ...row, id: row._id || row.id }));
  }, [auctionResult, query]);

  const buildAuctionStepPayload = useCallback(
    (form, officerRows) => ({
      auctionerName: form.auctionerName || 'MSTC',
      auctionNumber: form.auctionNumber.trim(),
      auctionDate: form.auctionDate,
      startDateTime: toIsoDateTime(form.auctionDate, form.startTime),
      endDateTime: toIsoDateTime(form.auctionDate, form.endTime),
      inspectionFromDate: form.inspectionFromDate || undefined,
      inspectionToDate: form.inspectionToDate || undefined,
      vehicleLocation: form.vehicleLocation.trim(),
      sourcePlatform: form.auctionerName || 'MSTC',
      sellerName: form.sellerName.trim(),
      sellerMobileNumber: form.sellerMobileNumber.replace(/\D/g, ''),
      sellerEmail: form.sellerEmail || undefined,
      sellerAccountNumber: form.sellerAccountNumber || undefined,
      sellerTaxMode: form.sellerTaxMode || 'RCM',
      officers: officerRows
        .filter((x) => x.name?.trim())
        .map((x) => ({
          name: x.name.trim(),
          email: x.email?.trim() || undefined,
          phoneNumber: x.phoneNumber?.trim() || undefined,
          officerType: x.officerType || form.auctionerName || 'MSTC',
        })),
    }),
    [],
  );

  const hydrateFromAuction = useCallback((auction, options = {}) => {
    const { startAtStep = 0, mode = 'edit' } = options;
    const id = auction?._id || auction?.id || '';
    setAuctionId(id);
    setWizardMode(mode);
    setActiveStep(startAtStep);

    const start = auction?.startDateTime ? new Date(auction.startDateTime) : null;
    const end = auction?.endDateTime ? new Date(auction.endDateTime) : null;
    setAuctionForm({
      auctionerName: auction?.auctionerName || auction?.sourcePlatform || 'MSTC',
      auctionNumber: auction?.auctionNumber || '',
      auctionDate: auction?.auctionDate ? String(auction.auctionDate).slice(0, 10) : '',
      startTime: formatTimeFromDate(start),
      endTime: formatTimeFromDate(end),
      inspectionFromDate: auction?.inspectionFromDate
        ? String(auction.inspectionFromDate).slice(0, 10)
        : '',
      inspectionToDate: auction?.inspectionToDate
        ? String(auction.inspectionToDate).slice(0, 10)
        : '',
      vehicleLocation: auction?.vehicleLocation || auction?.auctionLocation || '',
      sellerName: auction?.sellerName || '',
      sellerMobileNumber: auction?.sellerMobileNumber || '',
      sellerEmail: auction?.sellerEmail || '',
      sellerAccountNumber: auction?.sellerAccountNumber || '',
      sellerTaxMode:
        auction?.sellerTaxMode ||
        (auction?.sellerAccountNumber ? 'FCM' : 'RCM'),
    });

    const o = Array.isArray(auction?.officers) && auction.officers.length > 0
      ? auction.officers.map((x) => ({
          name: x.name || '',
          email: x.email || '',
          phoneNumber: x.phoneNumber || '',
          officerType:
            x.officerType ||
            auction?.auctionerName ||
            auction?.sourcePlatform ||
            'MSTC',
        }))
      : emptyOfficers(auction?.auctionerName || auction?.sourcePlatform || 'MSTC');
    setOfficers(o);
    setStatusForm({
      status: auction?.status || 'UPCOMING',
      dealDoneAt: auction?.dealDoneAt
        ? String(auction.dealDoneAt).slice(0, 16)
        : '',
    });
    const hydratedForm = {
      auctionerName: auction?.auctionerName || auction?.sourcePlatform || 'MSTC',
      auctionNumber: auction?.auctionNumber || '',
      auctionDate: auction?.auctionDate ? String(auction.auctionDate).slice(0, 10) : '',
      startTime: formatTimeFromDate(start),
      endTime: formatTimeFromDate(end),
      inspectionFromDate: auction?.inspectionFromDate
        ? String(auction.inspectionFromDate).slice(0, 10)
        : '',
      inspectionToDate: auction?.inspectionToDate
        ? String(auction.inspectionToDate).slice(0, 10)
        : '',
      vehicleLocation: auction?.vehicleLocation || auction?.auctionLocation || '',
      sellerName: auction?.sellerName || '',
      sellerMobileNumber: auction?.sellerMobileNumber || '',
      sellerEmail: auction?.sellerEmail || '',
      sellerAccountNumber: auction?.sellerAccountNumber || '',
      sellerTaxMode:
        auction?.sellerTaxMode ||
        (auction?.sellerAccountNumber ? 'FCM' : 'RCM'),
    };
    setInitialAuctionStepPayload(buildAuctionStepPayload(hydratedForm, o));

    const serverLots = Array.isArray(auction?.lots) ? auction.lots : [];
    let mappedLots =
      serverLots.length > 0
        ? serverLots.map((lot) => ({
            id: lot._id || lot.id || '',
            lotName: lot.lotName || '',
            lotNumber: lot.lotNumber || '',
            preEmdAmount: lot.preEmdAmount ?? '',
            lotDescription: lot.lotDescription || '',
            vehicleCount: Math.max(1, Number(lot.vehicleCount) || 1),
          }))
        : [{ ...INITIAL_LOT }];
    setLots(mappedLots);
    setSelectedLotIndex(0);

    const vehiclesMap = {};
    const imagesMap = {};
    const vehicles = Array.isArray(auction?.vehicles) ? auction.vehicles : [];
    mappedLots.forEach((lot, lotIdx) => {
      const lid = String(lot.id || '');
      const list = vehicles.filter(
        (v) => String(v.lotId?._id || v.lotId || '') === lid,
      );
      const count = Number(mappedLots[lotIdx].vehicleCount || 1);
      const rowsV = Array.from({ length: count }, (_, i) => {
        const v = list[i];
        if (!v) return { ...INITIAL_VEHICLE };
        return {
          vehicleType: v.vehicleType || 'CAR',
          make: v.make || '',
          model: v.model || v.vehicleModel || '',
          variant: v.variant || '',
          vehicleNumber: v.vehicleNumber || v.registrationNumber || '',
          color: v.color || '',
          chassisLast5: v.chassisLast5 || '',
          yearOfManufacture: v.yearOfManufacture != null ? String(v.yearOfManufacture) : '',
        };
      });
      vehiclesMap[lotIdx] = rowsV;
      imagesMap[lotIdx] = Array.from({ length: count }, () => ({}));
    });
    setVehiclesByLotIndex(vehiclesMap);
    setImagesByLotIndex(imagesMap);
  }, [buildAuctionStepPayload]);

  const saveAuctionStep = async () => {
    if (!auctionForm.auctionNumber?.trim()) throw new Error('Auction number is required');
    if (!auctionForm.auctionDate) throw new Error('Auction date is required');
    if (!auctionForm.startTime || !auctionForm.endTime) throw new Error('Start and end time are required');
    if (!auctionForm.vehicleLocation?.trim()) throw new Error('Vehicle location is required');
    if (!auctionForm.sellerName?.trim()) throw new Error('Seller name is required');
    if (!/^\d{10}$/.test((auctionForm.sellerMobileNumber || '').replace(/\D/g, ''))) {
      throw new Error('Seller mobile number must be exactly 10 digits');
    }

    const payload = buildAuctionStepPayload(auctionForm, officers);

    let id = auctionId;
    if (id) {
      const prevJson = JSON.stringify(initialAuctionStepPayload || {});
      const nextJson = JSON.stringify(payload);
      if (prevJson === nextJson) {
        toast.success('No auction changes to save');
        return;
      }
      await auctionsApi.update(id, payload);
      setInitialAuctionStepPayload(payload);
    } else {
      const created = await auctionsApi.create(payload);
      const data = created?.data ?? created;
      id = data?._id || data?.id;
      setAuctionId(id || '');
      setInitialAuctionStepPayload(payload);
    }
    if (!id) throw new Error('Could not save auction');
    toast.success('Auction details saved');
  };

  const saveLotsStep = async () => {
    if (!auctionId) throw new Error('Save auction first');
    const updatedLots = [];
    for (let i = 0; i < lots.length; i += 1) {
      const lot = lots[i];
      if (!lot.lotNumber?.trim()) {
        throw new Error(`Lot ${i + 1}: lot number is required`);
      }
      const vc = Math.max(1, Number(lot.vehicleCount) || 1);
      const body = {
        lotName: lot.lotName?.trim() || undefined,
        lotNumber: lot.lotNumber.trim(),
        preEmdAmount: lot.preEmdAmount !== '' && lot.preEmdAmount != null
          ? Number(lot.preEmdAmount)
          : undefined,
        lotDescription: lot.lotDescription?.trim() || undefined,
        vehicleCount: vc,
      };
      let saved;
      if (lot.id) {
        saved = await auctionsApi.updateLot(lot.id, body);
      } else {
        saved = await auctionsApi.addLot(auctionId, body);
      }
      const data = saved?.data ?? saved;
      updatedLots.push({
        ...lot,
        ...body,
        id: data?._id || data?.id || lot.id,
        vehicleCount: vc,
      });
    }
    setLots(updatedLots);
    setVehiclesByLotIndex((prev) => {
      const next = { ...prev };
      updatedLots.forEach((lot, idx) => {
        const count = Number(lot.vehicleCount || 1);
        const existing = Array.isArray(next[idx]) ? [...next[idx]] : [];
        while (existing.length < count) existing.push({ ...INITIAL_VEHICLE });
        next[idx] = existing.slice(0, count);
      });
      return next;
    });
    setImagesByLotIndex((prev) => {
      const next = { ...prev };
      updatedLots.forEach((lot, idx) => {
        const count = Number(lot.vehicleCount || 1);
        const existing = Array.isArray(next[idx]) ? [...next[idx]] : [];
        while (existing.length < count) existing.push({});
        next[idx] = existing.slice(0, count);
      });
      return next;
    });
    toast.success('Lots saved');
  };

  const saveVehiclesStep = async () => {
    if (!auctionId) throw new Error('Save auction first');
    for (let lotIdx = 0; lotIdx < lots.length; lotIdx += 1) {
      const lot = lots[lotIdx];
      if (!lot.id) throw new Error('Lots must be saved before vehicles');
      const count = Number(lot.vehicleCount || 1);
      const list = Array.isArray(vehiclesByLotIndex[lotIdx])
        ? vehiclesByLotIndex[lotIdx]
        : Array.from({ length: count }, () => ({ ...INITIAL_VEHICLE }));
      if (list.length !== count) {
        throw new Error(`Lot "${lot.lotNumber}": enter exactly ${count} vehicles`);
      }
      const payload = {
        vehicles: list.map((v) => {
          const plate = (v.vehicleNumber || '').trim() || undefined;
          return {
            vehicleType: v.vehicleType,
            make: v.make,
            model: v.model,
            variant: v.variant,
            vehicleNumber: plate,
            registrationNumber: plate,
            color: v.color,
            chassisLast5: v.chassisLast5?.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5),
            yearOfManufacture: v.yearOfManufacture ? Number(v.yearOfManufacture) : undefined,
          };
        }),
      };
      const batchRes = await auctionsApi.addVehiclesBatch(lot.id, payload);
      const savedList = Array.isArray(batchRes?.data) ? batchRes.data : Array.isArray(batchRes) ? batchRes : [];
      const imgsForLot = imagesByLotIndex[lotIdx] || [];
      for (let vi = 0; vi < savedList.length; vi += 1) {
        const vehicleId = savedList[vi]?._id || savedList[vi]?.id;
        const imgRow = imgsForLot[vi] || {};
        const fd = new FormData();
        let has = false;
        VEHICLE_PHOTO_FIELDS.forEach(({ key }) => {
          if (imgRow[key]) {
            fd.append(key, imgRow[key]);
            has = true;
          }
        });
        if (vehicleId && has) {
          await auctionsApi.uploadVehicleImages(vehicleId, fd);
        }
      }
    }
    toast.success('Vehicles and photos saved');
  };

  const handleCloseModal = () => {
    setOpenAuctionModal(false);
    resetWizardState();
  };

  const handlePrimaryAction = async () => {
    try {
      if (activeStep === 0) {
        await saveAuctionStep();
        setActiveStep(1);
        return;
      }
      if (activeStep === 1) {
        await saveLotsStep();
        lots.forEach((lot, idx) => ensureVehicleSlotsForLot(idx, Number(lot.vehicleCount || 1)));
        setActiveStep(2);
        return;
      }
      await saveVehiclesStep();
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      handleCloseModal();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Save failed');
    }
  };

  const handleBack = () => {
    if (activeStep <= 0) return;
    setActiveStep((s) => s - 1);
  };

  const selectedLot = lots[selectedLotIndex];
  const selectedLotVehicleCount = Number(selectedLot?.vehicleCount || 0);

  return (
    <>
      <NormalTable
        ref={tableRef}
        columns={[
          { field: 'auctionNumber', headerName: 'Auction Number', width: '16%' },
          {
            field: 'auctionDate',
            headerName: 'Date',
            width: '12%',
            render: (row) => (row.auctionDate ? new Date(row.auctionDate).toLocaleDateString() : '—'),
          },
          {
            field: 'vehicleLocation',
            headerName: 'Vehicle Location',
            width: '16%',
            render: (row) => row.vehicleLocation || row.auctionLocation || '—',
          },
          { field: 'status', headerName: 'Status', width: '12%' },
          {
            field: 'actions',
            headerName: 'Actions',
            width: '10%',
            render: (row) => (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    setMenuAnchorEl(e.currentTarget);
                    setMenuRow(row);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            ),
          },
        ]}
        data={rows}
        isLoading={isLoading}
        csvFilename="auctions"
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={auctionResult?.total ?? 0}
        onPageChange={setPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next);
          setPage(0);
        }}
        toolbar={
          <TableToolbar
            searchPlaceholder="Search auctions..."
            searchValue={query}
            onSearchChange={setQuery}
            onAdd={() => {
              resetWizardState();
              setOpenAuctionModal(true);
            }}
            showRefresh
            onRefresh={refetch}
            showFilter={false}
            showColumnToggle
            onToggleColumns={(e) => tableRef.current?.openColumnToggle(e)}
          />
        }
      />

      <Menu anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={() => setMenuAnchorEl(null)}>
        <MenuItem
          onClick={async () => {
            if (menuRow) {
              const res = await auctionsApi.getById(menuRow._id || menuRow.id);
              setViewAuction(res?.data || res);
              setOpenViewModal(true);
            }
            setMenuAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (menuRow) {
              try {
                const res = await auctionsApi.getById(menuRow._id || menuRow.id);
                hydrateFromAuction(res?.data || res, { startAtStep: 0, mode: 'edit' });
                setOpenAuctionModal(true);
              } catch {
                toast.error('Failed to load auction');
              }
            }
            setMenuAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={async () => {
            if (menuRow) {
              try {
                const res = await auctionsApi.getById(menuRow._id || menuRow.id);
                hydrateFromAuction(res?.data || res, {
                  startAtStep: 1,
                  mode: 'addLot',
                });
                setOpenAuctionModal(true);
              } catch {
                toast.error('Failed to load auction');
              }
            }
            setMenuAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <PlaylistAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Lot</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) {
              setStatusForm({
                status: menuRow.status || 'UPCOMING',
                dealDoneAt: menuRow.dealDoneAt
                  ? String(menuRow.dealDoneAt).slice(0, 16)
                  : '',
              });
              setOpenStatusModal(true);
            }
            setMenuAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <PlaylistAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Update Status</ListItemText>
        </MenuItem>
        <MenuItem
          sx={{ color: '#d32f2f' }}
          onClick={async () => {
            if (menuRow) {
              await auctionsApi.delete(menuRow._id || menuRow.id);
              queryClient.invalidateQueries({ queryKey: ['auctions'] });
              toast.success('Deleted');
            }
            setMenuAnchorEl(null);
          }}
        >
          <ListItemIcon sx={{ color: '#d32f2f' }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <NormalModal
        open={openStatusModal}
        onClose={() => setOpenStatusModal(false)}
        title="Update auction status"
        actions={(
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={() => setOpenStatusModal(false)} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  if (!menuRow) return;
                  if (statusForm.status === 'DEAL_DONE' && !statusForm.dealDoneAt) {
                    throw new Error('Closing date/time is required for deal done');
                  }
                  await auctionsApi.updateStatus(menuRow._id || menuRow.id, {
                    status: statusForm.status,
                    dealDoneAt:
                      statusForm.status === 'DEAL_DONE'
                        ? new Date(statusForm.dealDoneAt).toISOString()
                        : undefined,
                  });
                  toast.success('Status updated');
                  setOpenStatusModal(false);
                  queryClient.invalidateQueries({ queryKey: ['auctions'] });
                } catch (error) {
                  toast.error(
                    error?.response?.data?.message ||
                      error?.message ||
                      'Failed to update status',
                  );
                }
              }}
            >
              Save
            </Button>
          </Box>
        )}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Status"
              value={statusForm.status}
              onChange={(e) =>
                setStatusForm((p) => ({ ...p, status: e.target.value }))
              }
              sx={inputSx}
            >
              {AUCTION_STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {statusForm.status === 'DEAL_DONE' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Closing date & time"
                InputLabelProps={{ shrink: true }}
                value={statusForm.dealDoneAt}
                onChange={(e) =>
                  setStatusForm((p) => ({ ...p, dealDoneAt: e.target.value }))
                }
                sx={inputSx}
              />
            </Grid>
          )}
        </Grid>
      </NormalModal>

      <NormalModal
        open={openAuctionModal}
        onClose={handleCloseModal}
        title={wizardMode === 'addLot' ? 'Add lots & vehicles' : 'Auction'}
        maxWidth="lg"
        actions={
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseModal} color="inherit">
              Cancel
            </Button>
            {activeStep > 0 && (
              <Button variant="outlined" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="contained" onClick={handlePrimaryAction}>
              {activeStep === STEPS.length - 1
                ? 'Finish'
                : 'Save & next'}
            </Button>
          </Box>
        }
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Step {activeStep + 1} of {STEPS.length}
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 && wizardMode !== 'addLot' && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Auction details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Auctioner name"
                  value={auctionForm.auctionerName}
                  onChange={(e) => {
                    const nextAuctioner = e.target.value;
                    setAuctionForm((p) => ({ ...p, auctionerName: nextAuctioner }));
                    setOfficers((prev) =>
                      prev.map((officer) => {
                        if (officer.officerType === OFFICER_TYPE_SELLER) return officer;
                        return { ...officer, officerType: nextAuctioner };
                      }),
                    );
                  }}
                  sx={inputSx}
                >
                  <MenuItem value="MSTC">MSTC</MenuItem>
                  <MenuItem value="GEM">GEM</MenuItem>
                  <MenuItem value="OTHERS">Others</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Auction number"
                  value={auctionForm.auctionNumber}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, auctionNumber: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Auction date"
                  InputLabelProps={{ shrink: true }}
                  value={auctionForm.auctionDate}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, auctionDate: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Start time"
                  InputLabelProps={{ shrink: true }}
                  value={auctionForm.startTime}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, startTime: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="End time"
                  InputLabelProps={{ shrink: true }}
                  value={auctionForm.endTime}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, endTime: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Inspection from date"
                  InputLabelProps={{ shrink: true }}
                  value={auctionForm.inspectionFromDate}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, inspectionFromDate: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Inspection to date"
                  InputLabelProps={{ shrink: true }}
                  value={auctionForm.inspectionToDate}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, inspectionToDate: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Vehicle location"
                  value={auctionForm.vehicleLocation}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, vehicleLocation: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Seller details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Seller name"
                  value={auctionForm.sellerName}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, sellerName: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Seller mobile number"
                  value={auctionForm.sellerMobileNumber}
                  onChange={(e) =>
                    setAuctionForm((p) => ({
                      ...p,
                      sellerMobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                    }))
                  }
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Seller email (optional)"
                  value={auctionForm.sellerEmail}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, sellerEmail: e.target.value }))}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Seller account number (optional)"
                  value={auctionForm.sellerAccountNumber}
                  onChange={(e) =>
                    setAuctionForm((p) => ({
                      ...p,
                      sellerAccountNumber: e.target.value,
                      sellerTaxMode: e.target.value ? 'FCM' : 'RCM',
                    }))
                  }
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Tax mode"
                  value={auctionForm.sellerTaxMode}
                  onChange={(e) => setAuctionForm((p) => ({ ...p, sellerTaxMode: e.target.value }))}
                  sx={inputSx}
                >
                  <MenuItem value="FCM">FCM</MenuItem>
                  <MenuItem value="RCM">RCM</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Officer details
            </Typography>
            {officers.map((officer, idx) => (
              <Box key={`off-${idx}`} sx={{ mb: 2 }}>
                {idx > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="Remove officer"
                      onClick={() => setOfficers((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      select
                      fullWidth
                      label="Officer type"
                      value={officer.officerType || auctionForm.auctionerName}
                      onChange={(e) =>
                        setOfficers((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, officerType: e.target.value } : item,
                          ),
                        )
                      }
                      sx={inputSx}
                    >
                      <MenuItem value={auctionForm.auctionerName}>
                        {auctionForm.auctionerName}
                      </MenuItem>
                      <MenuItem value={OFFICER_TYPE_SELLER}>Seller type</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={officer.name}
                      onChange={(e) =>
                        setOfficers((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, name: e.target.value } : item)),
                        )
                      }
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Email (optional)"
                      value={officer.email}
                      onChange={(e) =>
                        setOfficers((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, email: e.target.value } : item)),
                        )
                      }
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Phone (optional)"
                      value={officer.phoneNumber}
                      onChange={(e) =>
                        setOfficers((prev) =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, phoneNumber: e.target.value } : item,
                          ),
                        )
                      }
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={() =>
                setOfficers((prev) => [
                  ...prev,
                  {
                    name: '',
                    email: '',
                    phoneNumber: '',
                    officerType: auctionForm.auctionerName,
                  },
                ])
              }
            >
              Add more officer
            </Button>
          </>
        )}

        {activeStep === 0 && wizardMode === 'addLot' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Auction <strong>{auctionForm.auctionNumber}</strong> — add new lots below, then continue to vehicles.
            </Typography>
          </Box>
        )}

        {activeStep === 1 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Lot details
            </Typography>
            {lots.map((lot, idx) => (
              <Paper key={`lot-${lot.id || idx}`} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Lot {idx + 1}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Lot name"
                      value={lot.lotName}
                      onChange={(e) =>
                        setLots((prev) => prev.map((item, i) => (i === idx ? { ...item, lotName: e.target.value } : item)))
                      }
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Lot number"
                      value={lot.lotNumber}
                      onChange={(e) =>
                        setLots((prev) => prev.map((item, i) => (i === idx ? { ...item, lotNumber: e.target.value } : item)))
                      }
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Pre EMD"
                      value={lot.preEmdAmount}
                      onChange={(e) =>
                        setLots((prev) => prev.map((item, i) => (i === idx ? { ...item, preEmdAmount: e.target.value } : item)))
                      }
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Vehicle count"
                      value={lot.vehicleCount}
                      onChange={(e) => {
                        const n = Math.max(1, Number(e.target.value) || 1);
                        setLots((prev) => prev.map((item, i) => (i === idx ? { ...item, vehicleCount: n } : item)));
                        ensureVehicleSlotsForLot(idx, n);
                      }}
                      sx={inputSx}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={lot.lotDescription}
                      onChange={(e) =>
                        setLots((prev) => prev.map((item, i) => (i === idx ? { ...item, lotDescription: e.target.value } : item)))
                      }
                      sx={inputSx}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button variant="outlined" onClick={() => setLots((prev) => [...prev, { ...INITIAL_LOT }])}>
              Add another lot
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Vehicles & photos (per vehicle)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Pick a lot, then fill each vehicle. Under each vehicle, upload all photos in one place before moving to the next vehicle.
            </Typography>
            <TextField
              select
              fullWidth
              label="Lot"
              value={selectedLotIndex}
              onChange={(e) => setSelectedLotIndex(Number(e.target.value))}
              sx={{ ...inputSx, mb: 2 }}
            >
              {lots.map((lot, idx) => (
                <MenuItem key={`sel-${lot.id || idx}`} value={idx}>
                  {lot.lotName || lot.lotNumber || `Lot ${idx + 1}`} ({lot.vehicleCount} vehicles)
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={<Checkbox checked={copyCommon} onChange={(e) => setCopyCommon(e.target.checked)} />}
              label="Same make / model / variant / colour / year / type for all vehicles in this lot (vehicle number and chassis stay separate)"
            />
            {copyCommon && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {Object.keys(commonVehicle).map((field) => (
                  <Grid item xs={12} sm={4} md={3} key={field}>
                    <TextField
                      fullWidth
                      label={field}
                      value={commonVehicle[field]}
                      onChange={(e) => {
                        const next = { ...commonVehicle, [field]: e.target.value };
                        setCommonVehicle(next);
                        const li = selectedLotIndex;
                        const cnt = Number(lots[li]?.vehicleCount || 1);
                        setVehiclesByLotIndex((prev) => {
                          const list = Array.isArray(prev[li])
                            ? [...prev[li]]
                            : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                          const merged = list.map((row) => ({
                            ...row,
                            vehicleType: next.vehicleType,
                            make: next.make,
                            model: next.model,
                            variant: next.variant,
                            color: next.color,
                            yearOfManufacture: next.yearOfManufacture,
                            vehicleNumber: row.vehicleNumber,
                            chassisLast5: row.chassisLast5,
                          }));
                          return { ...prev, [li]: merged };
                        });
                      }}
                      sx={inputSx}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {Array.from({ length: selectedLotVehicleCount }).map((_, vehicleIndex) => {
              const li = selectedLotIndex;
              const cnt = Number(lots[li]?.vehicleCount || 1);
              const list = Array.isArray(vehiclesByLotIndex[li])
                ? [...vehiclesByLotIndex[li]]
                : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
              const vehicle = list[vehicleIndex] || { ...INITIAL_VEHICLE };
              const imgRow = (imagesByLotIndex[li] && imagesByLotIndex[li][vehicleIndex]) || {};

              return (
                <Paper key={`veh-${li}-${vehicleIndex}`} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                    Vehicle {vehicleIndex + 1} of {selectedLotVehicleCount}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        select
                        fullWidth
                        label="Vehicle type"
                        value={vehicle.vehicleType || 'CAR'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVehiclesByLotIndex((prev) => {
                            const cur = Array.isArray(prev[li])
                              ? [...prev[li]]
                              : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                            cur[vehicleIndex] = { ...cur[vehicleIndex], vehicleType: val };
                            return { ...prev, [li]: cur };
                          });
                        }}
                        sx={inputSx}
                      >
                        {VEHICLE_TYPES.map((t) => (
                          <MenuItem key={t} value={t}>
                            {t}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Make"
                        value={vehicle.make ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVehiclesByLotIndex((prev) => {
                            const cur = Array.isArray(prev[li])
                              ? [...prev[li]]
                              : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                            cur[vehicleIndex] = { ...cur[vehicleIndex], make: val };
                            return { ...prev, [li]: cur };
                          });
                        }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Model"
                        value={vehicle.model ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVehiclesByLotIndex((prev) => {
                            const cur = Array.isArray(prev[li])
                              ? [...prev[li]]
                              : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                            cur[vehicleIndex] = { ...cur[vehicleIndex], model: val };
                            return { ...prev, [li]: cur };
                          });
                        }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Variant"
                        value={vehicle.variant ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVehiclesByLotIndex((prev) => {
                            const cur = Array.isArray(prev[li])
                              ? [...prev[li]]
                              : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                            cur[vehicleIndex] = { ...cur[vehicleIndex], variant: val };
                            return { ...prev, [li]: cur };
                          });
                        }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Vehicle number"
                        value={vehicle.vehicleNumber ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVehiclesByLotIndex((prev) => {
                            const cur = Array.isArray(prev[li])
                              ? [...prev[li]]
                              : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                            cur[vehicleIndex] = { ...cur[vehicleIndex], vehicleNumber: val };
                            return { ...prev, [li]: cur };
                          });
                        }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Colour"
                        value={vehicle.color ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVehiclesByLotIndex((prev) => {
                            const cur = Array.isArray(prev[li])
                              ? [...prev[li]]
                              : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                            cur[vehicleIndex] = { ...cur[vehicleIndex], color: val };
                            return { ...prev, [li]: cur };
                          });
                        }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Last 5 chassis"
                        value={vehicle.chassisLast5 ?? ''}
                        inputProps={{ maxLength: 5 }}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
                          setVehiclesByLotIndex((prev) => {
                            const cur = Array.isArray(prev[li])
                              ? [...prev[li]]
                              : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                            cur[vehicleIndex] = { ...cur[vehicleIndex], chassisLast5: val };
                            return { ...prev, [li]: cur };
                          });
                        }}
                        sx={inputSx}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        label="Year of manufacture"
                        type="number"
                        value={vehicle.yearOfManufacture ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVehiclesByLotIndex((prev) => {
                            const cur = Array.isArray(prev[li])
                              ? [...prev[li]]
                              : Array.from({ length: cnt }, () => ({ ...INITIAL_VEHICLE }));
                            cur[vehicleIndex] = { ...cur[vehicleIndex], yearOfManufacture: val };
                            return { ...prev, [li]: cur };
                          });
                        }}
                        sx={inputSx}
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Photos for this vehicle
                  </Typography>
                  <Grid container spacing={1.5}>
                    {VEHICLE_PHOTO_FIELDS.map(({ key, label }) => (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <Button
                          component="label"
                          variant="outlined"
                          fullWidth
                          size="small"
                          sx={{ py: 1.25, textTransform: 'none' }}
                        >
                          {label}
                          {imgRow[key] ? ` — ${imgRow[key].name}` : ''}
                          <input
                            hidden
                            accept="image/jpeg,image/png,application/pdf"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setImagesByLotIndex((prev) => {
                                const lotImgs = Array.isArray(prev[li])
                                  ? [...prev[li]]
                                  : Array.from({ length: cnt }, () => ({}));
                                const cell = { ...(lotImgs[vehicleIndex] || {}) };
                                if (file) cell[key] = file;
                                lotImgs[vehicleIndex] = cell;
                                return { ...prev, [li]: lotImgs };
                              });
                              e.target.value = '';
                            }}
                          />
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              );
            })}
          </>
        )}
      </NormalModal>

      <NormalModal open={openViewModal} onClose={() => setOpenViewModal(false)} title="Auction details">
        {viewAuction && (
          <Box>
            <Typography variant="body2">Auction number: {viewAuction.auctionNumber || '—'}</Typography>
            <Typography variant="body2">
              Date: {viewAuction.auctionDate ? new Date(viewAuction.auctionDate).toLocaleDateString() : '—'}
            </Typography>
            <Typography variant="body2">
              Vehicle Location: {viewAuction.vehicleLocation || viewAuction.auctionLocation || '—'}
            </Typography>
            <Typography variant="body2">Status: {viewAuction.status || '—'}</Typography>
          </Box>
        )}
      </NormalModal>
    </>
  );
};

export default AuctionTable;
