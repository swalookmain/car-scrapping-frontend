import { Box, Typography, Container } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import AdminLayout from '../layout/AdminLayout';

const NoAccess = () => {
  return (
    <AdminLayout>
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <BlockIcon sx={{ fontSize: 56, color: 'var(--color-secondary-main)', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          No modules assigned
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--color-grey-600)' }}>
          Your account does not have access to any modules yet. Ask an admin to grant module access.
        </Typography>
      </Container>
    </AdminLayout>
  );
};

export default NoAccess;
