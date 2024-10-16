import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import React, { useState } from "react";
import './wagonTallySheet.css';

// Styles for the DateTimePicker
const dateTimePickerStyles = {
  width: "100%",
  ".MuiInputBase-input": {
    padding: "4px 8px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px ",
    color: "#42454E",
    fontWeight: 600,
  },
  ".MuiInputBase-root": {
    padding: 0,
    border: "none",
    "& fieldset": { border: "none" },
  },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": {
      border: "none",
    },
    "&.Mui-focused fieldset": {
      border: "none",
    },
  },
  "& .MuiIconButton-root": {
    left: -720,
    position: "relative",
  },
};

// Custom DateTimePicker component
type CustomDateTimePickerProps = {
  label: string;
  value: Date;
  onChange: (date: Date | null) => void;
  open: boolean;
  onToggle: () => void;
};

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({ label, value, onChange, open, onToggle }) => (
  <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
    <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{label}</p>
    <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          open={open}
          onClose={onToggle}
          value={dayjs(value)}
          sx={dateTimePickerStyles}
          ampm={false}
          slotProps={{
            textField: {
              onClick: onToggle,
              fullWidth: true,
              InputProps: {
                endAdornment: null,
              },
            },
          }}
          viewRenderers={{
            hours: renderTimeViewClock,
            minutes: renderTimeViewClock,
            seconds: renderTimeViewClock,
          }}
          onChange={(newDate) => {
            if (newDate) {
              onChange(newDate.toDate());
            }
          }}
          format="DD-MM-YYYY hh:mm A"
        />
      </LocalizationProvider>
    </div>
  </div>
);

export default CustomDateTimePicker;