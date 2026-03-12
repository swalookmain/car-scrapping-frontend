import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRoute } from '../config/roleConfig';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleGoHome = () => {
    if (isAuthenticated && user?.role) {
      navigate(getDefaultRoute(user.role), { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8e0f0 50%, #ddd6f3 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(103,58,183,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            p: { xs: 4, sm: 6 },
            borderRadius: '24px',
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 64,
              color: 'var(--color-secondary-main)',
              mb: 2,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3rem', sm: '4.5rem' },
              fontWeight: 800,
              color: 'var(--color-secondary-dark)',
              lineHeight: 1,
              mb: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#333',
              mb: 1,
            }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#666',
              mb: 4,
              maxWidth: 360,
              mx: 'auto',
            }}
          >
            The page you are looking for doesn't exist or you don't have permission to access it.
          </Typography>

          <Button
            variant="contained"
            size="medium"
            onClick={handleGoHome}
            sx={{
              backgroundColor: 'var(--color-secondary-main)',
              borderRadius: '12px',
              px: 4,
              py: 1.25,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.875rem',
              boxShadow: '0 4px 14px rgba(103,58,183,0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: 'var(--color-secondary-dark)',
                boxShadow: '0 6px 20px rgba(103,58,183,0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Go to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;
