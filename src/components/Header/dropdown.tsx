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

const Dropdown = ({ shippers, reload }:{shippers: shipper[], reload: any, getAllShipment:any}) => {

  const [options, setOptions] = useState<option[]>([{
    value: '',
    label: ''
  }]);
  const [selectedValue, setSelectedValue] = useState(options.length > 0 ? options[0].value : '');
  const handleChange = (event: event) => {
    const newValue = event.target.value as string;
    setSelectedValue(newValue);
    localStorage.setItem('selected_shipper', newValue);
    setCookies("selected_shipper", newValue);
    window.location.reload();
    };

  useEffect(() => {
    const selected_shipper = localStorage.getItem('selected_shipper') as string;
    const optionsData = shippers.map((shipper) => {
      return { value: shipper._id, label: shipper.name };
    });
    setOptions(optionsData);
    if (selected_shipper) {
      setSelectedValue(selected_shipper);
    } else if (optionsData.length > 0) {
      setSelectedValue(optionsData[0].value);
    }
    console.log({options, selectedValue, shippers})
  }, [shippers]);


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
