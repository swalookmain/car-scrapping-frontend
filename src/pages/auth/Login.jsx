import React, { useState } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  Paper,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import inputSx from "../../services/inputStyles";
import { useAuth } from "../../context/AuthContext";
import useApiCall from '../../hooks/useApiCall';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const { execute, loading } = useApiCall();
  const [error, setError] = useState("");

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { redirectPath } = await execute(() => login(email, password));
      navigate(redirectPath);
    } catch (err) {
      if (err?.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err?.response?.status === 403) {
        setError("Account deactivated or not assigned to organization");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Box
      className="min-h-screen flex items-center justify-center"
      sx={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e8e0f0 50%, #ddd6f3 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(103,58,183,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(33,150,243,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.6)',
          maxWidth: '475px',
          width: '100%',
          p: { xs: 3, sm: 4, md: 5 },
          backgroundColor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.04)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo Section */}
          <Box className="mb-6 flex flex-col items-center justify-center">
          <Box className="flex items-center gap-2 mb-4">
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#121926' }}>
               RVSF
            </Typography>
          </Box>
          
          <Typography
            variant="h3"
            sx={{
              color: "var(--color-secondary-main)",
              fontWeight: "bold",
              fontSize: "1.25rem",
              marginBottom: "6px",
            }}
          >
            Hi, Welcome Back
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "var(--color-grey-500)", fontSize: "0.875rem" }}
          >
            Enter your credentials to continue
          </Typography>
        </Box>

        {/* Form Section */}
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography
            variant="subtitle1"
            sx={{
              mb: 1,
              display: "none",
            }}
          >
            Email Address / Username
          </Typography>
          <TextField
            fullWidth
            label="Email Address / Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{ ...inputSx, mb: 2, mt: 0 }}
          />

          <TextField
            fullWidth
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            variant="outlined"
            sx={{ ...inputSx, mb: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                    <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="medium"
                    sx={{ color: "var(--color-grey-500)" }}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Checkbox and Forgot Password */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            {/* Keep me logged in checkbox removed */}
            <Link
              href="#"
              underline="none"
              onClick={(e) => {
                e.preventDefault();
                navigate("/forgot-password");
              }}
              sx={{
                color: "var(--color-secondary-main)",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          {/* Sign In Button */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              backgroundColor: "var(--color-secondary-main)",
              color: "#fff",
              py: 1.25,
              borderRadius: "12px",
              fontSize: "0.875rem",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(103,58,183,0.3)",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "var(--color-secondary-dark)",
                boxShadow: "0 6px 20px rgba(103,58,183,0.4)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;