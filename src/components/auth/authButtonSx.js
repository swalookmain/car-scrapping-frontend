export const primaryAuthButtonSx = {
  backgroundColor: 'var(--color-secondary-main)',
  color: '#fff',
  py: 1.1,
  borderRadius: '12px',
  fontSize: '0.875rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: '0 4px 14px rgba(103,58,183,0.3)',
  transition: 'all 0.25s ease',
  '&:hover': {
    backgroundColor: 'var(--color-secondary-dark)',
    boxShadow: '0 8px 28px rgba(103,58,183,0.45)',
    transform: 'translateY(-2px)',
  },
};

export const authLinkSx = {
  color: 'var(--color-secondary-main)',
  fontWeight: 600,
  cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' },
};
