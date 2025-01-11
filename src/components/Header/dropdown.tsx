'use client'
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Select, MenuItem, FormControl, SelectChangeEvent } from "@mui/material";
import dropdownIcon from "../../assets/dropdown_small_icon.svg";
import "./dropdown.css";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {setCookies} from '@/utils/storageService'
import CustomSelect from "../UI/CustomSelect/CustomSelect";
import { ShipperSettingsModal } from '../PlantSchedule/ShipperSettingsModal';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState(options.length > 0 ? options[0].value : '');
  const handleChange = (event: any) => {
    const newValue = event as string;
    setSelectedValue(newValue);
    localStorage.setItem('selected_shipper', newValue);
    setCookies("selected_shipper", newValue);
    window.location.reload();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  }, [shippers]);

  return (
    <div id='dropdownContainer' ref={selectRef}>
      <div id='dropdownLabel' onClick={() => setShowDropdown(!showDropdown)}>
        {options.map((option) => (selectedValue === option.value ? 
        (<div key={option.value}>{option.label}</div>) : null))}
        <div><Image src={dropdownIcon} alt="dropdownIcon" width={12} height={12} /></div>
      </div>
      {showDropdown && <div id="dropdownOptions">
        {options.map((option, index) => {
          return(
            <div key={index} id={option.value} className="dropdownOption" onClick={()=>{handleChange(option.value); setShowDropdown(false)}}>{option.label}</div>
          );
        })}
      </div>}
    </div>
  );
};

const AccountMenu = () => {
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);

  const handleSettingsClick = () => {
    setSettingsModalVisible(true);
  };

  return (
    <>
      <MenuItem key="settings" onClick={handleSettingsClick}>
        Settings
      </MenuItem>

      <ShipperSettingsModal 
        visible={isSettingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        // theme={themes[currentTheme]} // Assuming you have access to themes
      />
    </>
  );
};

export default Dropdown;
