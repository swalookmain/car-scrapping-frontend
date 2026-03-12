const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "var(--color-grey-50)",
    transition: "all 0.2s ease",
    "& fieldset": {
      borderColor: "var(--color-grey-200)",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: "var(--color-secondary-200)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--color-secondary-main)",
      borderWidth: "1.5px",
      boxShadow: "0 0 0 3px rgba(103, 58, 183, 0.06)",
    },
    "&.Mui-focused": {
      backgroundColor: "#fff",
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.875rem",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--color-secondary-main)",
  },
};

export default inputSx;
