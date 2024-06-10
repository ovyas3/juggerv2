'use client'
import en from "/Users/instavans/Desktop/lucy/lucy/messages/en.json"
import SideDrawer from '@/components/Drawer/Drawer';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header/header';
import './orders.css'
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ReplayIcon from '@mui/icons-material/Replay';
import Filters from '@/components/Filters/filters';
import TableData from '@/components/Table/table';
// import useMediaQuery from '@mui/material/useMediaQuery';
import { useMediaQuery } from '@mui/material';
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";


const useWindowSize = (width: number): Boolean => {
  const [isWide, setIsWide] = useState(window.innerWidth >= width);

  useEffect(() => {
    const handleResize = () => {
      setIsWide(window.innerWidth >= width);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width]);

  return isWide;
};


const OrdersPage = () => {

  const mobile = useWindowSize(600);
  console.log(mobile)

  return (
    <div  >
      <div className='orderContainer'>
        {mobile ? <SideDrawer /> : null}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          {
            mobile ? <Header></Header> : <MobileHeader />
          }

          <div style={{ paddingInline: 24, paddingTop: 24, paddingBottom: 65 }}>

            {/* ----search fnr---- */}
            <div className='input_fnr_reload'>
              <div className='void'></div>
              <div className='fnr_input'>
                <Box
                  sx={{
                    maxWidth: '100%',

                  }}
                >
                  <TextField
                    fullWidth
                    label=""
                    id="fullWidth"
                    placeholder="Search by FNR Number"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      sx: {
                        height: 40,
                        '& .MuiInputBase-input::placeholder': {
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#E9E9EB',
                          borderWidth: 1
                        },
                        '&:hover fieldset': {
                          borderColor: '#E9E9EB',
                          borderWidth: 1
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#E9E9EB',
                          borderWidth: 1
                        },
                      },
                    }}
                  />
                </Box>
              </div>
              <div className='reload'><ReplayIcon style={{ color: '#707070' }} /></div>
            </div>

            {/* ----otbound and inbound---- */}
            {mobile ?
              <div className='outbound_inbound'>
                <div style={{ width: 99, textAlign: 'center', alignContent: 'center', color: '#2962FF', borderBottomColor: '#2962FF', borderBottomWidth: 2, borderBottomStyle: 'solid' }}>{en.ORDERS.outbound}</div>
                <div style={{ width: 87, textAlign: 'center', alignContent: 'center', color: '#7C7E8C' }}>{en.ORDERS.inbound}</div>
              </div>
              :
              <div className='mobile_outbound_inbound'>
                <div className='mobile_outbound'>{en.ORDERS.outbound}</div>
                <div className='mobile_inbound'>{en.ORDERS.inbound}</div>
              </div>
            }


            {/* ----filter---- */}
            <div className='filters'>
              <Filters />
            </div>

            {/* ----table---- */}
            <div>
              <TableData />
            </div>

          </div>
        </div>
      </div>
      {mobile ? null :
        <div className="bottom_bar">
          <MobileDrawer />
        </div>}
    </div>
  );
};

OrdersPage.displayName = 'OrdersPage';

export default OrdersPage;
