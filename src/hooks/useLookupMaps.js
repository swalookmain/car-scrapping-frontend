import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi, inventoryApi } from '../services/api';

/**
 * Fetches all invoices + all vehicles and builds lookup maps.
 * Returns { invoiceMap, vehicleMap, allInvoices, allVehicles, isLoading }
 *
 * invoiceMap:  invoiceId  -> { invoiceNumber, sellerName, ... }
 * vehicleMap:  vehicleId  -> { registration_number, make, model_name, ... }
 * vehicleByInvoiceMap: invoiceId -> vehicle data
 */
export function useLookupMaps(enabled = true) {
  // Fetch all invoices (paginated)
  const { data: allInvoices = [], isLoading: invLoading } = useQuery({
    queryKey: ['lookup-all-invoices'],
    queryFn: async () => {
      let all = [];
      let pg = 1;
      const limit = 100;
      const res = await invoicesApi.getAll(pg, limit, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : [];
      all = items;
      const totalPages = res?.meta?.totalPages || 1;
      while (pg < totalPages) {
        pg++;
        const nextRes = await invoicesApi.getAll(pg, limit, { useCache: false });
        const nextItems = Array.isArray(nextRes?.data) ? nextRes.data : [];
        all = [...all, ...nextItems];
      }
      return all;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all vehicles (paginated)
  const { data: allVehicles = [], isLoading: vehLoading } = useQuery({
    queryKey: ['lookup-all-vehicles'],
    queryFn: async () => {
      let all = [];
      let pg = 1;
      const limit = 100;
      const res = await invoicesApi.getAllVehicles(pg, limit);
      const items = Array.isArray(res?.data) ? res.data : [];
      all = items;
      const totalPages = res?.meta?.totalPages || 1;
      while (pg < totalPages) {
        pg++;
        const nextRes = await invoicesApi.getAllVehicles(pg, limit);
        const nextItems = Array.isArray(nextRes?.data) ? nextRes.data : [];
        all = [...all, ...nextItems];
      }
      return all;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all parts (paginated)
  const { data: allParts = [], isLoading: partsLoading } = useQuery({
    queryKey: ['lookup-all-parts'],
    queryFn: async () => {
      let all = [];
      let pg = 1;
      const limit = 100;
      const res = await inventoryApi.getAll({ page: pg, limit }, { useCache: false });
      const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      all = items;
      // In some responses res.meta might be missing if it's just an array
      const totalPages = res?.meta?.totalPages || (res?.total ? Math.ceil(res.total / limit) : 1);
      while (pg < totalPages) {
        pg++;
        const nextRes = await inventoryApi.getAll({ page: pg, limit }, { useCache: false });
        const nextItems = Array.isArray(nextRes?.data) ? nextRes.data : Array.isArray(nextRes) ? nextRes : [];
        all = [...all, ...nextItems];
      }
      return all;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Build maps
  const partMap = useMemo(() => {
    const map = {};
    allParts.forEach((part) => {
      const id = part._id || part.id;
      if (id) map[id] = part;
    });
    return map;
  }, [allParts]);
  const invoiceMap = useMemo(() => {
    const map = {};
    allInvoices.forEach((inv) => {
      const id = inv._id || inv.id;
      if (id) map[id] = inv;
    });
    return map;
  }, [allInvoices]);

  const vehicleMap = useMemo(() => {
    const map = {};
    allVehicles.forEach((veh) => {
      const id = veh._id || veh.id;
      if (id) map[id] = veh;
    });
    return map;
  }, [allVehicles]);

  // Also build invoiceId -> vehicle map (for when data has invoiceId but not vehicleId)
  const vehicleByInvoiceMap = useMemo(() => {
    const map = {};
    allVehicles.forEach((veh) => {
      if (veh.invoiceId) map[veh.invoiceId] = veh;
    });
    return map;
  }, [allVehicles]);

  return {
    invoiceMap,
    vehicleMap,
    vehicleByInvoiceMap,
    partMap,
    allInvoices,
    allVehicles,
    allParts,
    isLoading: invLoading || vehLoading || partsLoading,
  };
}

/**
 * Enriches a row with resolved invoice and vehicle data from lookup maps.
 * Adds `_invoiceNumber`, `_vehicleDisplay` fields to show in cells.
 */
export function enrichRow(row, invoiceMap, vehicleMap, vehicleByInvoiceMap, partMap = {}) {
  const enriched = { ...row };

  // Resolve part references if IDs are missing
  let invId = row.invoiceId;
  let vehId = row.vehicleId || row.vechileId;

  // Use partId as fallback to find missing IDs
  const pId = row.partId || row.part?._id || row.part?.id;
  if (pId && partMap[pId]) {
    const p = partMap[pId];
    if (!invId) invId = p.invoiceId;
    if (!vehId) vehId = p.vehicleId || p.vechileId;
  }

  // Resolve invoice
  if (invId && invoiceMap[invId]) {
    enriched.invoiceNumber = invoiceMap[invId].invoiceNumber || '';
    enriched.invoice = invoiceMap[invId];
  }

  // Resolve vehicle
  if (vehId && vehicleMap[vehId]) {
    enriched.vehicle = vehicleMap[vehId];
    enriched.registrationNumber = vehicleMap[vehId].registration_number || vehicleMap[vehId].registrationNumber || '';
  } else if (invId && vehicleByInvoiceMap[invId]) {
    // Fallback: resolve vehicle via invoiceId
    enriched.vehicle = vehicleByInvoiceMap[invId];
    enriched.registrationNumber = vehicleByInvoiceMap[invId].registration_number || vehicleByInvoiceMap[invId].registrationNumber || '';
  }

  return enriched;
}
