'use client'
import { Box, Button, CardContent, Grid } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from "@mui/lab";
import service from "@/utils/timeService";
import ShareLocationOutlinedIcon from '@mui/icons-material/ShareLocationOutlined';
import {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';

export const ActivityTimeLineChart = (props: any) => {
    // const dateConvertor = (date) => DateTime.fromISO(date).plus({minutes: 330}).toFormat("dd-MM-yyyy HH:mm");
    // const isMobile = props.mobile ? true : false;
    const numberOfStops = props.trackingDetails.length;
    const [startingPings, setStartingPings] = useState([]);
    const [endingPings, setEndingPings] = useState([]);
    const [pings, setPings] = useState([]);
    const [showPings, setShowPings] = useState(true);
    const [lowPings, setLowPings] = useState(true);
  
    useEffect(() => {
      const data = props.trackingDetails;
      if (numberOfStops > 8) {
        setStartingPings(data.slice(0, 4))
        setEndingPings(data.slice(numberOfStops - 3, numberOfStops))
      } else {
        setLowPings(true)
      }
      setPings(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numberOfStops])
    const handleLoadMore = (e: any) => {
      e.preventDefault();
      setShowPings(!showPings);
    }
    return (<React.Fragment>
      <CardContent className={props.className} style={{height: '70%'}} >
        <Grid style={
          {
                display: 'flex',
                marginTop: '-8px',
                marginBottom: '5px',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '80px',
                padding: '0px'
          }
        } container spacing={2}>
          <Grid item xs={12} style={
              {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }
            } >
            <Box style={
              {
                display: "flex",
                height: '24px',
                width: showPings ? '80%' :'100%',
                padding: '16px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px',
                fontSize: '20px',
              }
            }>
              FOIS Timeline
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={2} direction={"row"} color={"#42454E"} maxHeight={"100%"} justifyContent={"flex-start"} overflow={"scroll"} marginTop={"5px"}>
          <Timeline
           sx={{
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.4,
            },
          }}
          >
            {
              pings && pings.length && pings.map((ping: any) => {
                return (
                  <TimelineItem key={ping._id} style={{fontSize: '17px'}} >
                    <TimelineOppositeContent color="text.secondary" fontSize={"small"} marginTop={"20px"} >
                      { service.utcToistTime(ping.time_stamp, 'dd-MM-yyyy hh:mm') }
                    </TimelineOppositeContent>
                    <TimelineSeparator >
                      <TimelineConnector />
                        <TimelineDot>
                          <ShareLocationOutlinedIcon fontSize="small" />
                        </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent fontSize={"small"}  marginTop={"20px"} >{ ping.currentStatus.split(/ on /i)[0] }</TimelineContent>
                  </TimelineItem>
                )
              })
            }
          </Timeline>
        </Grid>
      </CardContent>
    </React.Fragment>)
  }