'use client'
import { AppBar, Box, Toolbar } from '@mui/material'
import React from 'react';
import './TripTrackerNavbar.css';
import Image from 'next/image'
import logoDefaultIcon from '../../../assets/logo_default_icon.svg';

export const TripTrackerNavbar = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
        <AppBar className="appBar" position="fixed">
            <Toolbar className="toolbar">
            {/* <CardMedia
              component={"img"}
              src={logoDefaultIcon}
              style={{
                border: "2px solid green",
                width: "30px",
                height: "30px"
              }}
              ></CardMedia> */}
               <Image
                    src={ logoDefaultIcon }
                    alt="Map Path Icon"
                    width={60}
                    height={60} 
                />
                TRIP TRACKER
            </Toolbar>
        </AppBar>
    </Box>

  )
}

export default TripTrackerNavbar