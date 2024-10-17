'use client'
import { AppBar, Box, CardContent, Grid, Toolbar, useMediaQuery } from '@mui/material'
import React from 'react';
import './TripTrackerNavbar.css';
import Image from 'next/image'
import logoDefaultIcon from '../../../assets/logo_default_icon.svg';
import { statusBuilder } from '../StatusBuilder/StatusBuilder';

const getStatusStyle = (status: string) => {
  switch(status.toLowerCase()){
    case "delivered":
      return{
        backgroundColor: 'white',
        color: '#18BE8A'
      };
    case "in transit":
      return{
        backgroundColor: 'white',
        color: '#FF9800'
      }
    case "in plant": 
      return{
        backgroundColor: 'white',
        color: '#334FFC'
      }  
  }
}


export const TripTrackerNavbar = (props: any) => {
  const mobile = useMediaQuery("(max-width:650px)");
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
                    className='img'
                />
                <CardContent className= 'card'>      
                  <Grid className='head1' style={{fontSize:mobile ? '16px' : '20px', marginTop:'10px'}}>
                    TRIP TRACKER
                    </Grid>
                    <Grid className='head2' style={{fontSize:mobile ? '16px' : '22px', marginTop:'10px'}}>
                    RAKE MANAGEMENT SYSTEM
                    </Grid>           
                  <Grid style={
                    {
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          maxWidth:'220px',
                          maxHeight: '70px',
                          padding: '0px',
                    }
                  } container spacing={2}>
                  <Grid item xs={6} >
                    <Box className='box1' style={
                      {
                        display: "flex",
                        height: '20px',
                        width: '200px',
                        paddingLeft: '0px',
                        alignItems: 'center',
                        justifyContent: 'start',
                        borderRadius: '5px',
                        fontSize: mobile? '12px' : '15px',
                        marginBottom: "50px",
                        marginTop: "8px",
                        color: "white"
                      }
                    }>
                      FNR No: #{props.fnr_data?.FNR}
                    </Box>
                  </Grid>
                  <Grid item xs={6} >
                    <Box className='box2' style={
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
                      marginRight: mobile? "95px" : "75px",
                      marginTop: "12px",
                      ...statusStyle
                    }
                  }>
                  {statusText}
                  </Box>
                  </Grid>
                  </Grid>
                </CardContent>
            </Toolbar>
        </AppBar>
    </Box>

  )
}

export default TripTrackerNavbar