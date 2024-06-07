import { Box, CardContent, CardMedia, Grid } from "@mui/material";
import React from "react";
import pickupIcon from '../../assets/pickup_icon.svg';
import wagonIcon from '../../assets/wagons_icon.svg';
import dropIcon from '../../assets/drop_icon.svg';
import currentTrainLocationIcon from '../../assets/current_train_location_icon.svg';
import { statusBuilder } from "../StatusBuilder/StatusBuilder";

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
                height: '24px',
                width: '100%',
                padding: '4px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px',
                fontSize: '14px',
              }
            }>
              FNR No: #{props.fnr_data.FNR}
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box style={
            {
              display: "flex",
              backgroundColor: '#53F6AA',
              color: '#008E27',
              height: '24px',
              width: '85px',
              maxWidth: '100px',
              padding: '2px',
              float: "right",
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              fontSize: '14px',
            }
          }>
           {statusBuilder(props.fnr_data.status)}
          </Box>
          </Grid>
        </Grid>
        <hr></hr>
        <Grid container spacing={2} direction={"row"} color={"#42454E"} >
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
              <CardMedia
                component={"img"}
                src={pickupIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={10} fontSize={"10px"} >
                {props.firstTrackingDetails.stationFrom}
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
              <CardMedia
                component={"img"}
                src={dropIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={10} fontSize={"10px"} >
                {props.firstTrackingDetails.stationTo}
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
              <CardMedia
                component={"img"}
                src={wagonIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={10} fontSize={"10px"} >
                No of Wagons: <b>{props.fnr_data.no_of_wagons}</b>
            </Grid>
          </Grid>
          <Grid container spacing={2} item xs={12} >
            <Grid item display={"flex"} justifyContent={"center"} alignItems={"center"} xs={2}>
              <CardMedia
                component={"img"}
                src={currentTrainLocationIcon}
                sx={{
                  height: '10px',
                  width: '10px',
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={10} fontSize={"10px"} >
                Current Location: <b>{props.lastTrackingDetails.lastReportedLocn}</b>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </React.Fragment>
  );