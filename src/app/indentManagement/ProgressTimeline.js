import React, { useEffect, useState } from "react";
import { Steps } from "antd";
import { Card, Grid, Typography } from "@mui/material";
import service from "@/utils/timeService";

const ProgressTimeline = ({data,index}) => {
  const [open, setOpen] = useState(false);
  const [animateChart, setAnimateChart] = useState(false);


  useEffect(() => {
    const plantPageData = localStorage.getItem('plantPageData');
    if (plantPageData) {
      const data = JSON.parse(plantPageData);
    }
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => {
      setAnimateChart(true);
    }, 300);
  };

  const handleClose = () => {
    setAnimateChart(false);
    setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  const steps = Object.keys(data.stats).map((key) => ({
    title: key.charAt(0).toUpperCase() + key.slice(1),
    description: data.stats[key].on ? service.utcToist(data.stats[key].on, 'dd-MMM-yyyy hh:mm a') : "--",
  }));


  return (
    <Card
      sx={{
        padding: 2,
        borderRadius: 2,
        width:"92%",
        minHeight:"max-content",
        boxShadow:
          "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
      }}
    >
      <Grid container spacing={2} onClick={handleOpen}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" style={{fontWeight: 'bold'}}>
            Rail Mill • {data.sin || '--'} • {data.transporter || '--'}
          </Typography>
          <Typography variant="body2" color="text.secondary" style={{fontWeight: 'bold'}}>
            Weight: {data.weight} Kgs
          </Typography>
        </Grid>

        <Grid item xs={12}>
           <div className="timeline-container" style={{ position: 'relative', marginTop: '5px' }}>
                      
            <Steps
              current={4}
              status="error"
              size="small"
              progressDot
              items={steps}
            />

            {Object.entries(data.stats).map((entry, idx, array) => {
              if (idx < array.length - 1) {
                const [key, value] = entry;
                const timeTaken = value.time_taken || "--";
                
                return (
                  <div 
                    key={`time-${index}-${idx}`} 
                    className="time-taken-indicator"
                    style={{
                      position: 'absolute',
                      left: `${(idx + 1) * (100 / array.length)}%`,
                      top: '-25px',
                      transform: 'translateX(-50%)',
                      color: '#52c41a',
                      fontSize: '14px',
                      fontWeight: '500',
                      zIndex: 1
                    }}
                  >
                    {timeTaken}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </Grid>
      </Grid>
    </Card>
  );
};


export default ProgressTimeline;