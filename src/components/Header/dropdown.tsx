'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import { Select, MenuItem, FormControl, SelectChangeEvent } from "@mui/material";
import dropdownIcon from "../../assets/dropdown_small_icon.svg";
import "./dropdown.css";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {setCookies} from '@/utils/storageService'


interface shipper {
  _id: string,
  name: string
}
interface option {
  value: string,
  label: string
}
interface event {
  target: {
    value: string;
  };
}

const Dropdown = ({ shippers, reload }:{shippers: shipper[], reload: any}) => {

  const [selectedValue, setSelectedValue] = useState<string>('');
  const [options, setOptions] = useState<option[]>([{
    value: '',
    label: ''
  }]);
  const handleChange = (event: event) => {
    const newValue = event.target.value as string;
    setSelectedValue(newValue);
    localStorage.setItem('selected_shipper', newValue);
    setCookies("selected_shipper", newValue);
    reload(true)
    setTimeout(()=>{reload(false)}, 1)
  };

  useEffect(() => {
    const selected_shipper = localStorage.getItem('selected_shipper') as string;
    const optionsData = shippers.map((shipper) => {
      return { value: shipper._id, label: shipper.name };
    });
    setOptions(optionsData);
    setSelectedValue(selected_shipper);
    console.log({options, selectedValue, shippers})
  }, []);

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
