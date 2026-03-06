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
      sx={{ backgroundColor: "var(--color-grey-100)" }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid var(--color-grey-200)",
          maxWidth: "475px",
          width: "100%",
          p: { xs: 3, sm: 4, md: 5 },
          backgroundColor: "var(--color-paper)",
        }}
      >
        {/* Logo Section */}
        <Box className="mb-8 flex flex-col items-center justify-center">
          <Box className="flex items-center gap-2 mb-6">
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
              }}
            />
            <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.6rem', color: '#121926' }}>
               RVSF
            </Typography>
          </Box>
          
          <Typography
            variant="h3"
            sx={{
              color: "var(--color-secondary-main)",
              fontWeight: "bold",
              fontSize: "1.5rem",
              marginBottom: "8px",
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
            sx={{ ...inputSx, mb: 3, mt: 0 }}
          />

          <TextField
            fullWidth
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            variant="outlined"
            sx={{ ...inputSx, mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                    size="large"
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
              mb: 3,
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
              py: 1.5,
              borderRadius: "12px",
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "var(--color-secondary-dark)",
                boxShadow: "none",
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