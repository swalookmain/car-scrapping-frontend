import React from "react";
import { Box, Typography, TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { CheckCircle, Visibility, VisibilityOff } from "@mui/icons-material";

const ForgotPasswordNewPasswordForm = ({
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  onSubmit,
  inputSx,
}) => (
  <Box component="form" noValidate autoComplete="off" onSubmit={onSubmit}>
    <Box className="flex justify-center mb-4">
      <Box
        sx={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "var(--color-success-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckCircle sx={{ fontSize: 40, color: "var(--color-success-dark)" }} />
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
      Create New Password
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "var(--color-grey-500)",
        textAlign: "center",
        mb: 4,
      }}
    >
      Your new password must be different from previously used passwords.
    </Typography>
    <TextField
      fullWidth
      label="New Password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      type={showNewPassword ? "text" : "password"}
      variant="outlined"
      sx={{ ...inputSx, mb: 3 }}
      required
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowNewPassword((show) => !show)}
              edge="end"
              size="large"
              sx={{ color: "var(--color-grey-500)" }}
            >
              {showNewPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
    <TextField
      fullWidth
      label="Confirm Password"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      type={showConfirmPassword ? "text" : "password"}
      variant="outlined"
      sx={{ ...inputSx, mb: 3 }}
      required
      error={confirmPassword && newPassword !== confirmPassword}
      helperText={
        confirmPassword && newPassword !== confirmPassword
          ? "Passwords do not match"
          : ""
      }
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => setShowConfirmPassword((show) => !show)}
              edge="end"
              size="large"
              sx={{ color: "var(--color-grey-500)" }}
            >
              {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
    <Button
      fullWidth
      variant="contained"
      size="large"
      type="submit"
      disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
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
        "&.Mui-disabled": {
          backgroundColor: "var(--color-grey-200)",
          color: "var(--color-grey-500)",
        },
      }}
    >
      Reset Password
    </Button>
  </Box>
);

export default ForgotPasswordNewPasswordForm;
