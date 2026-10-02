import { useState } from 'react';

export function useDateRange(setPage) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const onFromDateChange = (value) => {
    setFromDate(value);
    setPage?.(0);
  };
  const onToDateChange = (value) => {
    setToDate(value);
    setPage?.(0);
  };

  const dateParams = {};
  if (fromDate) dateParams.fromDate = fromDate;
  if (toDate) dateParams.toDate = toDate;

  return { fromDate, toDate, onFromDateChange, onToDateChange, dateParams };
}
