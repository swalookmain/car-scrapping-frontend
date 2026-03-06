import React, { lazy, Suspense } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isRouteAllowed } from '../../config/roleConfig';
import { Box, CircularProgress } from '@mui/material';

const NotFound = lazy(() => import('../../pages/NotFound'));

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user role doesn't have access to this route, show 404 page
  const userRole = user?.role;
  if (!userRole || !isRouteAllowed(location.pathname, userRole)) {
    return (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    );
  }

  return children;
};

export default ProtectedRoute;
