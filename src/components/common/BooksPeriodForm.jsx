import { useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import inputSx from '../../services/inputStyles';
import { booksSettingsApi } from '../../services/api';
import { useBooksDateBounds } from '../../hooks/useBooksDateBounds';

export default function BooksPeriodForm() {
  const queryClient = useQueryClient();
  const bounds = useBooksDateBounds();
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    setStartDate(bounds.booksStartDate || '');
  }, [bounds.booksStartDate]);

  const saveStart = useMutation({
    mutationFn: (nextDate) => booksSettingsApi.update({
      booksStartDate: nextDate ?? null,
    }),
    onSuccess: () => {
      toast.success('Books start date saved');
      queryClient.invalidateQueries({ queryKey: ['books-settings'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Could not save books start date');
    },
  });

  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', mb: 2 }}>
        Choose how far back this organization can enter data. Leave this empty to keep today&apos;s behavior.
        A start of 1 Apr 2024 allows 2024 onward. A start of 1 Apr 2026 allows only this year.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Start date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          sx={{ ...inputSx, minWidth: 220 }}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: bounds.today || undefined }}
        />
        <Button
          variant="contained"
          onClick={() => saveStart.mutate(startDate || null)}
          disabled={saveStart.isPending}
          sx={{ textTransform: 'none' }}
        >
          Save start date
        </Button>
        {bounds.booksStartDate && (
          <Button
            variant="text"
            onClick={() => {
              setStartDate('');
              saveStart.mutate(null);
            }}
            disabled={saveStart.isPending}
            sx={{ textTransform: 'none' }}
          >
            Clear
          </Button>
        )}
      </Box>
    </Box>
  );
}
