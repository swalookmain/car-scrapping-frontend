import { Box, Typography } from '@mui/material';
import AdminLayout from '../../layout/AdminLayout';
import Breadcrumb from '../../ui/Breadcrumb';
import BooksPeriodForm from '../../components/common/BooksPeriodForm';
import { useAuth } from '../../context/AuthContext';

export default function AccountSettings() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 overflow-hidden">
        <Breadcrumb
          title="Account Settings"
          items={[{ label: 'Account Settings' }]}
        />
        <Box
          sx={{
            p: 3,
            borderRadius: '12px',
            border: '1px solid var(--color-grey-200)',
            bgcolor: '#fff',
            maxWidth: 760,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Books period
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--color-grey-600)', mb: 3 }}>
            Controls how far back this organization can enter historical dates.
          </Typography>
          {isAdmin ? (
            <BooksPeriodForm />
          ) : (
            <Typography variant="body2" sx={{ color: 'var(--color-grey-600)' }}>
              Books period is set by an organization admin.
            </Typography>
          )}
        </Box>
      </div>
    </AdminLayout>
  );
}
