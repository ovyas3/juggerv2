import { Box, Button, ButtonBase, CardContent, CardMedia, Grid } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import pickupIcon from '../../assets/pickup_icon.svg'

export const ActivityTimeLineChart = (props: any) => {
    // const dateConvertor = (date) => DateTime.fromISO(date).plus({minutes: 330}).toFormat("dd-MM-yyyy HH:mm");
    // const isMobile = props.mobile ? true : false;
    const numberOfStops = props.trackingDetails.length;
    const [startingPings, setStartingPings] = useState([]);
    const [endingPings, setEndingPings] = useState([]);
    const [showPings, setShowPings] = useState(false);
    const [lowPings, setLowPings] = useState(false);
  
    useEffect(() => {
      const data = props.trackingDetails;
      if (numberOfStops > 8) {
        setStartingPings(data.slice(0, 4))
        setEndingPings(data.slice(numberOfStops - 3, numberOfStops))
      } else {
        setLowPings(true)
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numberOfStops])
    const handleLoadMore = (e: any) => {
      e.preventDefault();
      setShowPings(!showPings);
    }
    return (<React.Fragment>
      <CardContent className={props.className} >
        <Grid style={
          {
                display: 'flex',
                marginTop: '-40px',
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
                padding: '4px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px',
                fontSize: '14px',
              }
            }>
              List of stations it has stopped at
            </Box>
            {showPings && <Button variant="outlined" style={
              {
                display: "flex",
                height: '24px',
                width: '20%',
                padding: '4px',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '5px',
                fontSize: '10px',
              }
            } onClick={handleLoadMore} >Show Less</Button>}
          </Grid>
        </Grid>
        <Grid container spacing={2} direction={"row"} color={"#42454E"} maxHeight={"70%"} justifyContent={"flex-start"} >
        {
            (lowPings || showPings) && props.trackingDetails.map((details: {currentStatus: string}, index: number) => {
              return (<Grid container spacing={2} item xs={12} key={index} >
                {/* <Grid justifyContent={"flex-end"} item xs={4} fontSize={"10px"} >
                  {dateConvertor(details.created_at)}
                </Grid> */}
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
                <Grid justifyContent={"flex-start"} item xs={10} fontSize={"10px"} >
                  {details.currentStatus}
                </Grid>
              </Grid>)
            })
          }
          {
            (!showPings && startingPings.length) ? startingPings.map((details: { currentStatus: string } , index: number) => {
              return (<Grid container spacing={2} item xs={12} key={index} >
                {/* <Grid justifyContent={"flex-end"} item xs={4} fontSize={"10px"} >
                  {dateConvertor(details.created_at)}
                </Grid> */}
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
                <Grid justifyContent={"flex-start"} item xs={10} fontSize={"10px"} >
                  {details.currentStatus}
                </Grid>
              </Grid>)
            }) : null
          }
          {!showPings && startingPings.length && endingPings.length ?
            <Grid item container spacing={2} display={"block"} xs={12} >
              <Grid item display={"flex"} margin-left={"20px"} justifyContent={"center"} height={'10px'}  alignItems={"center"} xs={10}>
                  <CardMedia
                    component={"img"}
                    src={pickupIcon}
                    sx={{
                      height: '8px',
                      width: '8px',
                      justifyContent: "center",
                    }}
                  />
              </Grid>
              <Grid item display={"flex"} justifyContent={"center"} height={'10px'}  alignItems={"center"} xs={10}>
                  {/* <CardMedia
                    component={"img"}
                    src={pickupIcon}
                    sx={{
                      height: '8px',
                      width: '8px',
                      justifyContent: "center",
                    }}
                  /> */}
                  <ButtonBase style={{fontSize:'10px'}} onClick={handleLoadMore} >Load More</ButtonBase>
              </Grid>
              <Grid item display={"flex"} margin-left={"20px"} justifyContent={"center"} height={'10px'}  alignItems={"center"} xs={10}>
                  <CardMedia
                    component={"img"}
                    src={pickupIcon}
                    sx={{
                      height: '8px',
                      width: '8px',
                      justifyContent: "center",
                    }}
                  />
              </Grid>
            </Grid>
            :null}
          {
            (!showPings && endingPings.length) ? endingPings.map(( details: {currentStatus: string}, index: number) => {
              return (<Grid container spacing={2} item xs={12} key={index} >
                {/* <Grid justifyContent={"flex-end"} item xs={4} fontSize={"10px"} >
                  {dateConvertor(details.created_at)}
                </Grid> */}
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
                <Grid justifyContent={"flex-start"} item xs={10} fontSize={"10px"} >
                  {details.currentStatus}
                </Grid>
              </Grid>)
            }) : null
          }
        </Grid>
      </CardContent>
    </React.Fragment>)
  }