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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            textAlign: 'center',
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            backgroundColor: '#fff',
            boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          }}
        >
          <ErrorOutlineIcon
            sx={{
              fontSize: 80,
              color: 'var(--color-secondary-main)',
              mb: 2,
            }}
          />

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', sm: '6rem' },
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
            size="large"
            onClick={handleGoHome}
            sx={{
              backgroundColor: 'var(--color-secondary-main)',
              borderRadius: 2,
              px: 4,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: 'var(--color-secondary-dark)',
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
