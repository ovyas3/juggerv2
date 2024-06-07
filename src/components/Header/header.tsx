'use client'

import { Container, Grid, Avatar, useMediaQuery, Box, CardMedia } from "@mui/material";

import './header.css'
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Dropdown from "./dropdown";
import ProfileDrop from "./proFileDrop";


const Header = () => {


  return (
    <div>
    <Box className='container'>
      <div className="shipment_text">Shipments</div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <div className='header_name'>JSPL</div>
        <div className='drop_down'><Dropdown /></div>
        <div className='divder'></div>
        <div className='bell_icon'><Badge badgeContent={4} color="error"
          sx={{ '& .MuiBadge-badge': { transform: 'scale(0.6)', top: -8, right: -7 } }}><NotificationsIcon color="action" sx={{width: 20,height: 18,}} /></Badge>
        </div>
        <div className='divder'></div>
        <div className='profile_pic'>
          <ProfileDrop />
        </div>
      </div>
    </Box>
    </div>
  );
};

export default Header;
