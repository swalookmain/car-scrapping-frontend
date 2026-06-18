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
  Chip,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import inputSx from '../../services/inputStyles';
import { useAuth } from '../../context/AuthContext';
import useApiCall from '../../hooks/useApiCall';
import AuthCard, { authFieldVariants } from '../../components/auth/AuthCard';
import { primaryAuthButtonSx, authLinkSx } from '../../components/auth/authButtonSx';
import { TRIAL_DAYS, TRIAL_PERKS } from '../../config/trialCopy';

const MotionBox = motion.create(Box);

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromLanding = searchParams.get('from') === 'landing';
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { execute, loading } = useApiCall();
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = {};
    if (!organizationName.trim()) err.organizationName = 'Organization name is required';
    if (password !== confirmPassword) err.confirmPassword = 'Passwords do not match';
    setFieldErrors(err);
    if (Object.keys(err).length > 0) {
      if (err.confirmPassword) setError(err.confirmPassword);
      return;
    }

    try {
      const { redirectPath } = await execute(() =>
        signup({
          email,
          password,
          confirmPassword,
          organizationName: organizationName.trim(),
        })
      );
      navigate(redirectPath);
    } catch (err) {
      if (err?.response?.status === 409) {
        const msg = err?.response?.data?.message;
        const text = Array.isArray(msg) ? msg.join(', ') : msg || '';
        if (text.toLowerCase().includes('organization')) {
          setError('This organization name is already taken. Choose a different name.');
        } else {
          setError('An account with this email already exists. Please log in.');
        }
      } else if (err?.response?.data?.message) {
        const msg = err.response.data.message;
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  };

  const subtitle = fromLanding
    ? `From ScrapNiti.com — ${TRIAL_DAYS}-day free trial included`
    : `${TRIAL_DAYS} days free on the full ERP`;

  return (
    <AuthCard title="Sign Up" subtitle={subtitle} compact>
      <MotionBox
        variants={authFieldVariants}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          mb: 1.5,
        }}
      >
        {TRIAL_PERKS.map((perk) => (
          <Chip
            key={perk}
            label={perk}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.6875rem',
              fontWeight: 500,
              bgcolor: 'rgba(103,58,183,0.08)',
              color: 'var(--color-grey-700)',
              border: '1px solid rgba(103,58,183,0.14)',
              '& .MuiChip-label': { px: 1 },
            }}
          />
        ))}
      </MotionBox>

      <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
        {error && (
          <MotionBox variants={authFieldVariants} sx={{ mb: 1.5 }}>
            <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>
          </MotionBox>
        )}

        <MotionBox variants={authFieldVariants}>
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            size="small"
            required
            sx={{ ...inputSx, mb: 1.5, mt: 0 }}
          />
        </MotionBox>

        <MotionBox variants={authFieldVariants}>
          <TextField
            fullWidth
            label="Organization Name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="e.g. ABC Scrap Yard"
            required
            size="small"
            sx={{ ...inputSx, mb: 1.5 }}
            error={Boolean(fieldErrors.organizationName)}
            helperText={fieldErrors.organizationName}
            FormHelperTextProps={{ sx: { mt: 0.5, fontSize: '0.7rem' } }}
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
            sx={{ ...inputSx, mb: 1.5 }}
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

        <MotionBox variants={authFieldVariants}>
          <TextField
            fullWidth
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            size="small"
            sx={{ ...inputSx, mb: 1.5 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    edge="end"
                    size="small"
                    sx={{ color: 'var(--color-grey-500)' }}
                  >
                    {showConfirmPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
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
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign Up'}
          </Button>
        </MotionBox>

        <MotionBox variants={authFieldVariants} sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'var(--color-grey-500)', fontSize: '0.8125rem' }}>
            Already have an account?{' '}
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
                  navigate('/');
                }}
                sx={authLinkSx}
              >
                Log in
              </Link>
            </Box>
          </Typography>
        </MotionBox>
      </Box>
    </AuthCard>
  );
};

export default Signup;
