// components/ui/CustomDatePicker.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import Image from "next/image";
import calenderIcon from "@/assets/calender_icon_filters.svg";

interface CustomDatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  defaultDate?: Date;
  minSelectableDate?: Date;
  maxSelectableDate?: Date;
  onDateValidation?: (isValid: boolean) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  defaultDate,
  minSelectableDate,
  maxSelectableDate,
  onDateValidation,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultDate || value);
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedDate(value || defaultDate || null);
  }, [value, defaultDate]);

  const handleDateChange = (newDate: Dayjs | null) => {
    const newDateValue = newDate ? newDate.toDate() : null;

    // Validation Logic
    if (minDate && newDateValue && newDateValue < minDate) {
      setError(`${label} cannot be before the minimum date`);
      onDateValidation && onDateValidation(false);
      return;
    }

    if (maxDate && newDateValue && newDateValue > maxDate) {
      setError(`${label} cannot be after the maximum date`);
      onDateValidation && onDateValidation(false);
      return;
    }

    setError("");
    setSelectedDate(newDateValue);
    onChange(newDateValue);
    onDateValidation && onDateValidation(true);

    // Close DatePicker after selecting a valid date
    if (newDateValue) {
      setOpen(false);
    }
  };

  return (
    <div
      style={{
        height: 36,
        width: 132,
        border: "1px solid #E9E9EB",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        paddingLeft: 8,
        cursor: "pointer",
      }}
      onClick={() => !open && setOpen(true)} // Ensure it only opens when closed
    >
      <div style={{ height: 16, width: 16, marginBottom: 4 }}>
        <Image src={calenderIcon} alt="calendar icon" />
      </div>
      <div style={{ flex: 1, marginTop: 6, marginLeft: 10 }}>
        <div style={{ fontSize: 10, color: "#44475B" }}>{label}</div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            format="DD/MM/YYYY"
            value={selectedDate ? dayjs(selectedDate) : null}
            onChange={handleDateChange}
            minDate={minSelectableDate ? dayjs(minSelectableDate) : undefined}
            maxDate={maxSelectableDate ? dayjs(maxSelectableDate) : undefined}
            slotProps={{
              textField: {
                placeholder: selectedDate ? dayjs(selectedDate).format("DD/MM/YYYY") : "",
                fullWidth: true,
                InputProps: {
                  endAdornment: null,
                },
              },
            }}
            sx={{
              ".MuiInputBase-input": {
                padding: "0 !important",
                fontSize: "12px !important",
              },
              ".MuiInputBase-root": {
                padding: 0,
                border: "none",
                "& fieldset": { border: "none" },
              },
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": { border: "none" },
                "&.Mui-focused fieldset": { border: "none" },
              },
            }}
          />
        </LocalizationProvider>
        {error && <div style={{ color: "red", fontSize: 10 }}>{error}</div>}
      </div>
    </div>
  );
};

export default CustomDatePicker;
