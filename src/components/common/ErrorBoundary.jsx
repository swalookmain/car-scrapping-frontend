import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to an error reporting service if available
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: this.props.fullScreen ? '100vh' : '400px',
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 480,
              borderRadius: '12px',
              border: '1px solid var(--color-grey-200)',
            }}
          >
            <ErrorOutlineIcon
              sx={{ fontSize: 64, color: '#e53935', mb: 2 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: 'var(--color-grey-900)', mb: 1 }}
            >
              Something went wrong
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'var(--color-grey-500)', mb: 3 }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={this.handleReset}
                sx={{
                  borderColor: 'var(--color-grey-300)',
                  color: 'var(--color-grey-700)',
                }}
              >
                Try Again
              </Button>
              <Button
                variant="contained"
                onClick={this.handleReload}
                sx={{
                  backgroundColor: 'var(--color-secondary-main)',
                  '&:hover': { backgroundColor: 'var(--color-secondary-dark)' },
                }}
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
