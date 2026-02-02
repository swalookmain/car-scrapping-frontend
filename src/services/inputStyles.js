const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "var(--color-grey-50)",
    "& fieldset": {
      borderColor: "var(--color-grey-200)",
    },
    "&:hover fieldset": {
      borderColor: "var(--color-secondary-main)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--color-secondary-main)",
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "var(--color-secondary-main)",
  },
};

export default inputSx;
