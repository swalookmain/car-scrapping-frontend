import React, { useState } from "react";

import { Typography, Box, Paper, Link } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ForgotPasswordEmailForm from "../../components/auth/ForgotPasswordEmailForm";
import ForgotPasswordOtpForm from "../../components/auth/ForgotPasswordOtpForm";
import ForgotPasswordNewPasswordForm from "../../components/auth/ForgotPasswordNewPasswordForm";
import inputSx from "../../services/inputStyles";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    // TODO: API call to send OTP to email
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // TODO: API call to verify OTP
    setStep(3);
  };

  const handleResendOtp = (e) => {
    e.preventDefault();
    // TODO: Resend OTP API
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    // TODO: API call to reset password
    navigate("/");
  };

  const renderStepIndicator = () => (
    <Box className="flex justify-center gap-1 mb-4">
      {[1, 2, 3].map((s) => (
        <Box
          key={s}
          sx={{
            width: step >= s ? "18px" : "6px",
            height: "6px",
            borderRadius: "3px",
            backgroundColor:
              step >= s
                ? "var(--color-secondary-main)"
                : "var(--color-grey-200)",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </Box>
  );


  return (
    <Box
      className="min-h-screen flex items-center justify-center"
      sx={{ backgroundColor: "var(--color-grey-100)" }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: "8px",
          border: "1px solid var(--color-grey-200)",
          maxWidth: "475px",
          width: "100%",
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: "var(--color-paper)",
        }}
      >
        {/* Back Button */}
        <Box className="mb-4">
          <Link
            href="#"
            underline="none"
            onClick={(e) => {
              e.preventDefault();
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigate("/");
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "var(--color-grey-500)",
              fontSize: "0.875rem",
              "&:hover": {
                color: "var(--color-secondary-main)",
              },
            }}
          >
            <ArrowBack sx={{ fontSize: 16 }} />
            {step > 1 ? "Back" : "Back to Login"}
          </Link>
        </Box>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {step === 1 && (
          <ForgotPasswordEmailForm
            email={email}
            setEmail={setEmail}
            onSubmit={handleSendOtp}
            inputSx={inputSx}
          />
        )}
        {step === 2 && (
          <ForgotPasswordOtpForm
            email={email}
            otp={otp}
            handleOtpChange={handleOtpChange}
            handleOtpKeyDown={handleOtpKeyDown}
            onSubmit={handleVerifyOtp}
            onResend={handleResendOtp}
          />
        )}
        {step === 3 && (
          <ForgotPasswordNewPasswordForm
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            onSubmit={handleResetPassword}
            inputSx={inputSx}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
