import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '../services/api';

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

  // Build maps
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
    allInvoices,
    allVehicles,
    isLoading: invLoading || vehLoading,
  };
}

/**
 * Enriches a row with resolved invoice and vehicle data from lookup maps.
 * Adds `_invoiceNumber`, `_vehicleDisplay` fields to show in cells.
 */
export function enrichRow(row, invoiceMap, vehicleMap, vehicleByInvoiceMap) {
  const enriched = { ...row };

  // Resolve invoice
  const invId = row.invoiceId;
  if (invId && invoiceMap[invId]) {
    enriched.invoiceNumber = invoiceMap[invId].invoiceNumber || '';
    enriched.invoice = invoiceMap[invId];
  }

  // Resolve vehicle
  const vehId = row.vehicleId || row.vechileId;
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
