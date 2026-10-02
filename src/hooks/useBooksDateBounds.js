import { useQuery } from '@tanstack/react-query';
import { booksSettingsApi } from '../services/api';

export function useBooksDateBounds() {
  const { data } = useQuery({
    queryKey: ['books-settings'],
    queryFn: () => booksSettingsApi.get(),
    staleTime: 60_000,
  });

  const min = data?.booksStartDate || undefined;
  return {
    min,
    max: min ? data?.today : undefined,
    booksStartDate: data?.booksStartDate || '',
    today: data?.today || '',
  };
}

export function booksDateInputProps(bounds) {
  const inputProps = {};
  if (bounds?.min) inputProps.min = bounds.min;
  if (bounds?.max) inputProps.max = bounds.max;
  return inputProps;
}
