'use client'
import { Box, CardContent, Grid } from "@mui/material";
import React from "react";
import pickupIcon from '../../../assets/pickup_icon.svg';
import wagonIcon from '../../../assets/wagons_icon.svg';
import dropIcon from '../../../assets/drop_icon.svg';
import currentTrainLocationIcon from '../../../assets/current_train_location_icon.svg';
import travelledIcon from '../../../assets/travelled_distance_icon.svg';
import totalDistanceIcon from '../../../assets/total_distance_icon.svg';
import { statusBuilder } from "../StatusBuilder/StatusBuilder";
import Image from 'next/image';
import service from "@/utils/timeService";
import { Tooltip } from "@mui/material";

export const FNRDetailsCard = (props: any) => {
  console.log("props",props)

    return(
    <React.Fragment>
      <CardContent className={props.className} >
        <Grid container spacing={2} direction={"row"} color={"#42454E"} paddingLeft={"15px"}>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={1} marginTop={1.7} >
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
                alt="PickUp Icon"
                width={10}
                height={10}
              />
            </Grid>
            <Grid item xs={10} fontSize={"12px"} marginTop={"13px"}>
                {/* {props.fnr_data?.pickup_location?.code}-
                {props.fnr_data?.pickup_location?.name} */}
                { props.fnr_data?.pickup_location && props.fnr_data?.pickup_location?.code ? props.fnr_data?.pickup_location?.code: "" } 
                { props.fnr_data?.pickup_location && props.fnr_data?.pickup_location?.shipper ? " - " + props.fnr_data?.pickup_location?.shipper?.parent_name: " - " +  props.fnr_data?.pickup_location?.name }
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
                alt="Drop Icon"
                width={12}
                height={12}
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
                No of Wagons: <b>{props.fnr_data && props.fnr_data.received_no_of_wagons ? props.fnr_data.received_no_of_wagons : props.fnr_data.no_of_wagons}</b>
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={1}>
               <Image
                src={ totalDistanceIcon }
                alt="Total Distance Icon"
                width={18}
                height={18}
              />
            </Grid>
            <Grid item xs={10} fontSize={"12px"} >
                Total Distance: <b>{props.fnr_data?.estimated?.distance}</b> km
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={1}>
               <Image
                src={ travelledIcon }
                alt="Travelled Distance Icon"
                width={18}
                height={18}
              />
            </Grid>
            <Grid item xs={10} fontSize={"12px"} >
                Travelled Distance: <b>{props.travelledDistance}</b> km
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
                alt="Current Train Location Icon"
                width={14}
                height={14}
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
                 <div style={{marginLeft: "20px", cursor: "hover"}}>
                 <Tooltip
                    title={`ETA - Estimated Time of Arrival or Expected Time of Arrival`}
                    arrow
                    placement="bottom"
                  >
                    <p style={{cursor: 'pointer'}}>ETA : <b>{service.utcToist(props.fnr_data?.eta, 'dd-MM-yyyy HH:mm')}</b></p>
                  </Tooltip>
                 </div>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
    );
};