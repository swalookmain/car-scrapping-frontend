import React, { useState } from 'react';
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  Link,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import inputSx from '../../services/inputStyles';
import { useAuth } from '../../context/AuthContext';
import useApiCall from '../../hooks/useApiCall';
import AuthCard, { authFieldVariants } from '../../components/auth/AuthCard';
import { primaryAuthButtonSx, authLinkSx } from '../../components/auth/authButtonSx';

const MotionBox = motion.create(Box);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { execute, loading } = useApiCall();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { redirectPath } = await execute(() => login(email, password));
      navigate(redirectPath);
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err?.response?.status === 403) {
        const msg = err?.response?.data?.message;
        const text = Array.isArray(msg) ? msg.join(', ') : msg;
        if (text?.toLowerCase().includes('subscription')) {
          setError('Your trial or subscription has expired. Contact support to upgrade.');
        } else {
          setError('Account deactivated or not assigned to organization');
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <AuthCard title="Welcome Back !!" subtitle="Enter your credentials to continue" compact>
      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        {error && (
          <MotionBox variants={authFieldVariants} sx={{ mb: 1.5 }}>
            <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>
          </MotionBox>
        )}

        <MotionBox variants={authFieldVariants}>
          <TextField
            fullWidth
            label="Email Address / Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ ...inputSx, mb: 1.5, mt: 0 }}
          />
        </MotionBox>

        <MotionBox variants={authFieldVariants}>
          <TextField
            fullWidth
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            size="small"
            sx={{ ...inputSx, mb: 0.75 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                    size="small"
                    sx={{ color: 'var(--color-grey-500)' }}
                  >
                    {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </MotionBox>

        <MotionBox variants={authFieldVariants} sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
          <Link
            href="#"
            underline="none"
            onClick={(e) => {
              e.preventDefault();
              navigate('/forgot-password');
            }}
            sx={{
              color: 'var(--color-secondary-main)',
              fontWeight: 500,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Forgot Password?
          </Link>
        </MotionBox>

        <MotionBox variants={authFieldVariants}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="medium"
            disabled={loading}
            sx={primaryAuthButtonSx}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>
        </MotionBox>

        <MotionBox variants={authFieldVariants} sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontSize: '0.8125rem' }}>
            Don&apos;t have an account?{' '}
            <Box
              component={motion.span}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              sx={{ display: 'inline-block' }}
            >
              <Link
                href="#"
                underline="none"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/signup');
                }}
                sx={authLinkSx}
              >
                Sign up
              </Link>
            </Box>
          </Typography>
        </MotionBox>
      </Box>
    </AuthCard>
  );
};

export default Login;
