import React from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { Email } from "@mui/icons-material";

const ForgotPasswordEmailForm = ({ email, setEmail, onSubmit, inputSx }) => (
  <Box component="form" noValidate autoComplete="off" onSubmit={onSubmit}>
    <Box className="flex justify-center mb-4">
      <Box
        sx={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "var(--color-secondary-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Email sx={{ fontSize: 32, color: "var(--color-secondary-main)" }} />
      </Box>
    </Box>
    <Typography
      variant="h5"
      sx={{
        color: "var(--color-grey-900)",
        fontWeight: "bold",
        textAlign: "center",
        mb: 1,
      }}
    >
      Forgot Password?
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "var(--color-grey-500)",
        textAlign: "center",
        mb: 4,
      }}
    >
      Enter your email address and we'll send you an OTP to reset your password.
    </Typography>
    <TextField
      fullWidth
      label="Email Address"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      type="email"
      variant="outlined"
      sx={{ ...inputSx, mb: 2 }}
      required
    />
    <Button
      fullWidth
      variant="contained"
      size="large"
      type="submit"
      sx={{
        backgroundColor: "var(--color-secondary-main)",
        color: "#fff",
        py: 1,
        borderRadius: "8px",
        fontSize: "0.875rem",
        textTransform: "none",
        boxShadow: "none",
        "&:hover": {
          backgroundColor: "var(--color-secondary-dark)",
          boxShadow: "none",
        },
      }}
    >
      Send OTP
    </Button>
  </Box>
);

export default ForgotPasswordEmailForm;
