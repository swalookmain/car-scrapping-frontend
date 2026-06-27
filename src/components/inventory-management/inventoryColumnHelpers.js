export const inventoryStatusColor = {
  AVAILABLE: { bg: '#e8f5e9', color: '#2e7d32', label: 'Available' },
  PARTIAL_SOLD: { bg: '#fff3e0', color: '#e65100', label: 'Partial Sold' },
  SOLD_OUT: { bg: '#ffebee', color: '#c62828', label: 'Sold Out' },
  DAMAGE_ONLY: { bg: '#fce4ec', color: '#ad1457', label: 'Damaged' },
};

export const inventoryConditionColor = {
  GOOD: { bg: '#e8f5e9', color: '#2e7d32', label: 'Good' },
  DAMAGED: { bg: '#ffebee', color: '#c62828', label: 'Damaged' },
};

export const inventoryCategoryColor = {
  engine: { bg: '#e3f2fd', color: '#1565c0' },
  transmission: { bg: '#f3e5f5', color: '#6a1b9a' },
  brakes: { bg: '#ede7f6', color: '#4527a0' },
  suspension: { bg: '#e8eaf6', color: '#3949ab' },
  body: { bg: '#fff3e0', color: '#e65100' },
  metal: { bg: '#e0f2f1', color: '#00695c' },
  plastic: { bg: '#fce4ec', color: '#ad1457' },
  electrical: { bg: '#fff9c4', color: '#f57f17' },
  exhaust: { bg: '#efebe9', color: '#5d4037' },
  other: { bg: '#f5f5f5', color: '#616161' },
  // legacy uppercase keys
  ENGINE: { bg: '#e3f2fd', color: '#1565c0' },
  TRANSMISSION: { bg: '#f3e5f5', color: '#6a1b9a' },
  BODY: { bg: '#fff3e0', color: '#e65100' },
  METAL: { bg: '#e0f2f1', color: '#00695c' },
  PLASTIC: { bg: '#fce4ec', color: '#ad1457' },
  ELECTRICAL: { bg: '#fff9c4', color: '#f57f17' },
  OTHER: { bg: '#f5f5f5', color: '#616161' },
};

export function calcAvailable(row) {
  const opening = Number(row.openingStock) || 0;
  const received = Number(row.quantityReceived) || 0;
  const issued = Number(row.quantityIssued) || 0;
  return opening + received - issued;
}
