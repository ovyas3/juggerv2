// components/ui/CustomDatePicker.tsx
"use client";

import React, { useState, useEffect } from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import Image from "next/image";
import calenderIcon from "@/assets/calender_icon_filters.svg";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

interface CustomDatePickerProps {
  label: string | null;
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
  label = null,
  value,
  onChange,
  minDate,
  maxDate,
  defaultDate,
  minSelectableDate,
  maxSelectableDate,
  onDateValidation,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    defaultDate || value
  );
  const [error, setError] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const currentDate = new Date();

  useEffect(() => {
    setSelectedDate(value || defaultDate || null);
  }, [value, defaultDate]);


  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        border: "1px solid #E9E9EB",
        borderRadius: "6px",
        display: "flex",
        alignItems: "center",
        paddingLeft: 8,
        cursor: "pointer",
      }}
    >
      <div style={{ height: 16, width: 16, marginBottom: 4 }}>
        <Image src={calenderIcon} alt="calendar icon" />
      </div>
      <div style={{display:'flex',flexDirection:'column',paddingLeft:10}}>
        {label && <div style={{ fontSize: 10, color: "#44475B" }}>{label}</div>}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            open={open}
            onClose={() => setOpen(false)}
            value={selectedDate ? dayjs(selectedDate) : null}
            maxDate={dayjs(currentDate)}
            sx={{
              width: "100%",
              height: "100%",

              ".MuiInputBase-input": {
                fontSize: "12px ",
                color: "#42454E",
                padding:0
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
                position: "relative",
              },
            }}
            ampm={false}
            slotProps={{
              textField: {
                onClick: () => {
                  setOpen(!open);
                },
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
            onChange={(newDate)=>{
              if(newDate){
                setSelectedDate(newDate.toDate());
                onChange(newDate.toDate());
              }
            }}
            format="DD-MM-YYYY  HH:mm"
          />
        </LocalizationProvider>
       
        {error && <div style={{ color: "red", fontSize: 10 }}>{error}</div>}
      </div>
    </div>
  );
};

export default CustomDatePicker;
