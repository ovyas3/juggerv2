'use client'
import { Box, CardContent, Grid } from "@mui/material";
import React from "react";
import pickupIcon from '../../../assets/pickup_icon.svg';
import wagonIcon from '../../../assets/wagons_icon.svg';
import dropIcon from '../../../assets/drop_icon.svg';
import currentTrainLocationIcon from '../../../assets/current_train_location_icon.svg';
import { statusBuilder } from "../StatusBuilder/StatusBuilder";
import Image from 'next/image';

export const FNRDetailsCard = (props: any) => ( 
    <React.Fragment>
      <CardContent className={props.className} >
        <Grid style={
          {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
                padding: '0px'
  
          }
        } container spacing={2}>
          <Grid item xs={6} >
            <Box style={
              {
                display: "flex",
                height: '20px',
                width: '200px',
                paddingLeft: '20px',
                alignItems: 'center',
                justifyContent: 'start',
                borderRadius: '5px',
                fontSize: '14px',
                marginBottom: "22px",
                color: "#42454E"
              }
            }>
              FNR No: #{props.fnr_data.FNR}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box style={
            {
              display: "flex",
              backgroundColor: '#D6F6DD',
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
              marginBottom: "22px",
              marginRight: "5px",
            }
          }>
           {statusBuilder(props.fnr_data.status)}
          </Box>
          </Grid>
        </Grid>
        <hr style={{ marginTop: "-3px", width:"100%", height: "1px",backgroundColor: "#DFE3EB" }} />
        <Grid container spacing={2} direction={"row"} color={"#42454E"} paddingLeft={"15px"}>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={1} marginTop={2} >
              {/* <CardMedia
                component={"img"}
                src={pickupIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              /> */}
              <Image
                src={ pickupIcon }
                alt="Map Path Icon"
                width={8}
                height={8}
              />
            </Grid>
            <Grid item xs={10} fontSize={"12px"} marginTop={"10px"}>
                {/* {props.fnr_data?.pickup_location?.code}-
                {props.fnr_data?.pickup_location?.name} */}
                { props.fnr_data?.pickup_location && props.fnr_data?.pickup_location?.code ? props.fnr_data?.pickup_location?.code: "" }
                { props.fnr_data?.pickup_location && props.fnr_data?.pickup_location?.name ? " - " + props.fnr_data?.pickup_location?.name : "" }
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={1}>
              {/* <CardMedia
                component={"img"}
                src={dropIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              /> */}
               <Image
                src={ dropIcon }
                alt="Map Path Icon"
                width={10}
                height={10}
              />
            </Grid>
            <Grid item xs={10} fontSize={"12px"}>
                {/* {props.fnr_data?.delivery_location?.code}-
                {props.fnr_data?.delivery_location?.name} */}
                { props.fnr_data?.delivery_location && props.fnr_data?.delivery_location?.code ? props.fnr_data?.delivery_location?.code: "" }
                { props.fnr_data?.delivery_location && props.fnr_data?.delivery_location?.name ? " - " + props.fnr_data?.delivery_location?.name : "" }
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={1}>
              {/* <CardMedia
                component={"img"}
                src={wagonIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              /> */}
               <Image
                src={ wagonIcon }
                alt="Map Path Icon"
                width={16}
                height={16}
              />
            </Grid>
            <Grid item xs={10} fontSize={"12px"} >
                No of Wagons: <b>{props.fnr_data.no_of_wagons}</b>
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={1}>
              {/* <CardMedia
                component={"img"}
                src={currentTrainLocationIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              /> */}
               <Image
                src={ currentTrainLocationIcon }
                alt="Map Path Icon"
                width={12}
                height={12}
              />
            </Grid>
            <Grid item xs={10} fontSize={"12px"}>
                 <b>Current Status:</b>
                 <br></br> 
                 <div style={{marginLeft: "20px"}}>
                  GPS: <b>{props.fnr_data?.trip_tracker?.gps_last_location || 'N/A'} </b>
                 </div>    
                 <div style={{marginLeft: "20px"}}>
                  FOIS: <b>{props.fnr_data?.trip_tracker?.fois_last_location || 'N/A'}</b>
                 </div>
                 <div style={{marginLeft: "20px"}}>
                  ETA: <b>{props.fnr_data?.eta || 'N/A'}</b>
                 </div>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  );