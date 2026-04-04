import React from 'react';
import {
  AvailableCell,
  CategoryChip,
  InventoryActionsCell,
  InventoryConditionChip,
  InventoryStatusChip,
  InvoiceRefCell,
  IssuedCell,
  ItemCodeCell,
  OpeningCell,
  PartNameCell,
  ReceivedCell,
  VehicleCodeCell,
} from './inventoryColumns';

export function getInventoryColumns({
  canPerform,
  handleView,
  handleEdit,
  openDeleteConfirm,
  handleMarkDamaged,
}) {
  return [
    // { field: 'itemCode', headerName: 'Item Code', width: '9%', render: (row) => <ItemCodeCell row={row} /> },
    { field: 'partName', headerName: 'Part Name', width: '13%', render: (row) => <PartNameCell row={row} /> },
    { field: 'vehicleCode', headerName: 'Vehicle', width: '9%', render: (row) => <VehicleCodeCell row={row} /> },
    { field: 'invoiceId', headerName: 'Invoice', width: '9%', render: (row) => <InvoiceRefCell row={row} /> },
    { field: 'partType', headerName: 'Category', width: '9%', render: (row) => <CategoryChip row={row} /> },
    { field: 'condition', headerName: 'Condition', width: '8%', render: (row) => <InventoryConditionChip row={row} /> },
    { field: 'openingStock', headerName: 'Opening', width: '6%', render: (row) => <OpeningCell row={row} /> },
    { field: 'quantityReceived', headerName: 'Received', width: '6%', render: (row) => <ReceivedCell row={row} /> },
    { field: 'quantityIssued', headerName: 'Issued', width: '6%', render: (row) => <IssuedCell row={row} /> },
    { field: 'available', headerName: 'Remaining Qty', width: '7%', render: (row) => <AvailableCell row={row} /> },
    { field: 'status', headerName: 'Status', width: '9%', render: (row) => <InventoryStatusChip row={row} /> },
    {
      field: 'actions',
      headerName: 'Actions',
      width: '10%',
      render: (row) => (
        <InventoryActionsCell
          row={row}
          canPerform={canPerform}
          handleView={handleView}
          handleEdit={handleEdit}
          openDeleteConfirm={openDeleteConfirm}
          handleMarkDamaged={handleMarkDamaged}
        />
      ),
    },
  ];
}
