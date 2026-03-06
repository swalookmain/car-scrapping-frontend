import React from "react";
import { Box, Typography, TextField, Button, Link } from "@mui/material";
import { LockReset } from "@mui/icons-material";

const ForgotPasswordOtpForm = ({ email, otp, handleOtpChange, handleOtpKeyDown, onSubmit, onResend }) => (
  <Box component="form" noValidate autoComplete="off" onSubmit={onSubmit}>
    <Box className="flex justify-center mb-4">
      <Box
        sx={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "var(--color-secondary-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LockReset sx={{ fontSize: 40, color: "var(--color-secondary-main)" }} />
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
      Enter OTP
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "var(--color-grey-500)",
        textAlign: "center",
        mb: 1,
      }}
    >
      We've sent a 6-digit OTP to
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: "var(--color-secondary-main)",
        fontWeight: 600,
        textAlign: "center",
        mb: 4,
      }}
    >
      {email}
    </Typography>
    <Box className="flex justify-center gap-2 mb-4">
      {otp.map((digit, index) => (
        <TextField
          key={`otp-${email || 'anon'}-${index}`}
          id={`otp-${email || 'anon'}-${index}`}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value)}
          onKeyDown={(e) => handleOtpKeyDown(index, e)}
          inputProps={{
            maxLength: 1,
            style: {
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
              padding: "12px",
            },
          }}
          sx={{
            width: "48px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "var(--color-grey-50)",
              "& fieldset": {
                borderColor: digit
                  ? "var(--color-secondary-main)"
                  : "var(--color-grey-200)",
              },
              "&:hover fieldset": {
                borderColor: "var(--color-secondary-main)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "var(--color-secondary-main)",
              },
            },
          }}
        />
      ))}
    </Box>
    <Box className="text-center mb-4">
      <Typography
        variant="body2"
        sx={{ color: "var(--color-grey-500)", display: "inline" }}
      >
        Didn't receive OTP?{" "}
      </Typography>
      <Link
        href="#"
        underline="none"
        onClick={onResend}
        sx={{
          color: "var(--color-secondary-main)",
          fontWeight: 600,
          cursor: "pointer",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        Resend
      </Link>
    </Box>
    <Button
      fullWidth
      variant="contained"
      size="large"
      type="submit"
      disabled={otp.some((d) => !d)}
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
      Verify OTP
    </Button>
  </Box>
);

export default ForgotPasswordOtpForm;
