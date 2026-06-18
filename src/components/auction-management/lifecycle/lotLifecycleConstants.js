export const LOT_OUTCOME_OPTIONS = ['PENDING', 'DEAL_DONE', 'STA', 'REJECTED', 'LEFT'];

export const LIFECYCLE_ACTIONS = {
  UPDATE_LOT_STATUS: 'UPDATE_LOT_STATUS',
  UPDATE_PAYMENT: 'UPDATE_PAYMENT',
  UPDATE_DELIVERY: 'UPDATE_DELIVERY',
  ADD_GATE_PASS: 'ADD_GATE_PASS',
  ADD_RCM: 'ADD_RCM',
};

export const ACTION_LABELS = {
  [LIFECYCLE_ACTIONS.UPDATE_LOT_STATUS]: 'Update Lot Status',
  [LIFECYCLE_ACTIONS.UPDATE_PAYMENT]: 'Update Payment',
  [LIFECYCLE_ACTIONS.UPDATE_DELIVERY]: 'Update Delivery',
  [LIFECYCLE_ACTIONS.ADD_GATE_PASS]: 'Add Gate Pass',
  [LIFECYCLE_ACTIONS.ADD_RCM]: 'Add RCM Detail',
};

export const OUTCOME_COLORS = {
  PENDING: { bg: '#f5f5f5', color: '#616161' },
  DEAL_DONE: { bg: '#e8f5e9', color: '#2e7d32' },
  STA: { bg: '#fff3e0', color: '#e65100' },
  REJECTED: { bg: '#ffebee', color: '#c62828' },
  LEFT: { bg: '#eceff1', color: '#455a64' },
};

export const PAYMENT_STATUS_COLORS = {
  NOT_PAID: { bg: '#ffebee', color: '#c62828' },
  PARTIALLY_PAID: { bg: '#fff3e0', color: '#e65100' },
  PAID: { bg: '#e8f5e9', color: '#2e7d32' },
};

export const defaultPaymentDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
};

export const minFutureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export const hasAction = (actions, key) => Array.isArray(actions) && actions.includes(key);
