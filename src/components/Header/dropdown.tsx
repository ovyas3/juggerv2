import { useState } from "react";
import Image from "next/image";
import { Select, MenuItem, FormControl, SelectChangeEvent } from "@mui/material";
import dropdownIcon from "@/assets/dropdown_small_icon.svg";
import "./dropdown.css";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const options = [
  { value: "raigarh", label: "Raigarh" },
  { value: "angul", label: "Angul" },
];
interface event {
  target: {
    value: string;
  };
}

const Dropdown = () => {
  const [selectedValue, setSelectedValue] = useState("raigarh");

  const handleChange = (event: event) => {
    setSelectedValue(event.target.value as string);
  };

  return (
    <FormControl sx={{ minWidth: 166 }}>
      <Select
        className="dropdown-select"
        sx={{ color: "black", background: "#F0F3F9" , '& .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          border: 'none',
        }, fontSize:14 }}
        label="Choose an option"
        value={selectedValue}
        onChange={(event: SelectChangeEvent<string>) => handleChange(event)}
        IconComponent={() => (<ArrowDropDownIcon/>)}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Dropdown;
