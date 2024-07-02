'use client'
import { AppBar, Box, Grid, Toolbar } from '@mui/material'
import React from 'react';
import './TripTrackerNavbar.css';
import Image from 'next/image'
import logoDefaultIcon from '../../../assets/logo_default_icon.svg';
import { statusBuilder } from '../StatusBuilder/StatusBuilder';

const getStatusStyle = (status: string) => {
  switch(status.toLowerCase()){
    case "delivered":
      return{
        backgroundColor: '#90dcc4',
        color: '#0e9167'
      };
    case "in transit":
      return{
        backgroundColor: '#ff98001f',
        color: '#ff9800'
      }
    case "in plant": 
      return{
        backgroundColor: '#334ffc1f',
        color: '#334ffc'
      }  
  }
}

export const TripTrackerNavbar = (props: any) => {
  const statusText = statusBuilder(props.fnr_data?.status);
  const statusStyle = getStatusStyle(statusText);
  return (
    <Box sx={{ flexGrow: 1 }}>
        <AppBar className="appBar" position="fixed">
            <Toolbar className="toolbar">
               <Image
                    src={ logoDefaultIcon }
                    alt="Map Path Icon"
                    width={60}
                    height={60} 
                />
                TRIP TRACKER  <h2 className="head"> RAKE MANAGEMENT SYSTEM</h2>
                <Grid style={
                  {
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: '60%',
                        padding: '0px',
                        width: '30%'
          
                  }
                } container spacing={2}>
                <Grid item xs={6} >
                  <Box style={
                    {
                      display: "flex",
                      height: '20px',
                      width: '300px',
                      paddingLeft: '20px',
                      alignItems: 'center',
                      justifyContent: 'start',
                      borderRadius: '5px',
                      fontSize: '14px',
                      marginBottom: "42px",
                      color: "white",
                    }
                  }>
                    FNR No: #{props.fnr_data?.FNR}
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box style={
                  {
                    display: "flex",
                    color: '#008E27',
                    height: '24px',
                    width: '75px',
                    maxWidth: '100px',
                    padding: '2px',
                    float: "right",
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '5px',
                    fontSize: '12px',
                    marginBottom: "42px",
                    marginRight: "5px",
                    ...statusStyle
                  }
                }>
                {statusBuilder(statusText)}
                </Box>
                </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
    </Box>

  )
}

export default TripTrackerNavbar