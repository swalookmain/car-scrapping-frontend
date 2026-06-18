export const todayIsoDate = () => new Date().toISOString().split('T')[0];

export const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const addMonths = (dateStr, months) => {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
};

export const addYears = (dateStr, years) => {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};

export const calculateEndDate = ({ type, plan, startDate }) => {
  if (!startDate) return '';
  if (type === 'TRIAL') return addDays(startDate, 7);
  switch (plan) {
    case 'MONTHLY':
      return addMonths(startDate, 1);
    case 'SIX_MONTH':
      return addMonths(startDate, 6);
    case 'YEARLY':
      return addYears(startDate, 1);
    default:
      return '';
  }
};

export const daysRemaining = (endDate) => {
  if (!endDate) return null;
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
};

export const formatPlanLabel = (type, plan) => {
  if (type === 'TRIAL') return '7-day trial';
  if (plan === 'MONTHLY') return 'Monthly';
  if (plan === 'SIX_MONTH') return '6 months';
  if (plan === 'YEARLY') return 'Yearly';
  return 'Paid';
};
