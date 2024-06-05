import { useState } from "react";
import Image from "next/image";
import { Select, MenuItem, FormControl, SelectChangeEvent } from "@mui/material";
import dropdownIcon from "./../../assets/dropdown_small_icon.svg";
import styles from "./dropdown.module.css";

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
    <FormControl sx={{ minWidth: 150 }}>
      <Select
        className={styles["dropdown-select"]}
        sx={{ color: "black", background: "#F0F3F9" }}
        label="Choose an option"
        value={selectedValue}
        onChange={(event: SelectChangeEvent<string>) => handleChange(event)}
        IconComponent={() => (
          <Image
            style={{ paddingRight: "12px", cursor: "pointer" }}
            src={dropdownIcon}
            alt="dropdown"
          />
        )}>
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
