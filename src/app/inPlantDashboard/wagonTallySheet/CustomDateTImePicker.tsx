import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import React from "react";
import './wagonTallySheet.css';

const dateTimePickerStyles = (disabled: boolean) => ({
  width: "100%",
  ".MuiInputBase-input": {
    padding: "4px 8px",
    fontFamily: "'Inter', sans-serif",
    fontSize: "12px ",
    color: "#42454E",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "default",
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
});

type CustomDateTimePickerProps = {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  open: boolean;
  onToggle: () => void;
  disabled: boolean;
};

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({ label, value, onChange, open, onToggle, disabled }) => (
  <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
    <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{label}</p>
    <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          open={open}
          onClose={onToggle}
          value={value ? dayjs(value) : null}
          sx={dateTimePickerStyles(disabled)}
          ampm={false}
          disabled={disabled}
          slotProps={{
            textField: {
              onClick: onToggle,
              fullWidth: true,
              placeholder: value ? undefined : "Pick a date and time",
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
            } else {
              onChange(null);
            }
          }}
          format="DD-MM-YYYY hh:mm A"
        />
      </LocalizationProvider>
    </div>
  </div>
);

export default CustomDateTimePicker;