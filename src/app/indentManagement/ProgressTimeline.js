import React, { useEffect, useState } from "react";
import { Steps } from "antd";
import { Card, Grid, Typography } from "@mui/material";
import service from "@/utils/timeService";

const ProgressTimeline = ({data,index}) => {
  const [open, setOpen] = useState(false);
  const [animateChart, setAnimateChart] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);


  useEffect(() => {
    const plantPageData = localStorage.getItem('plantPageData');
    if (plantPageData) {
      const data = JSON.parse(plantPageData);
    }
  }, []);

  useEffect(() => {
    let lastStep = -1;
    const stepKeys = [
      'allocated',
      'accepted',
      'assigned',
      'reported',
      'load_in',
      'load_out',
      'gate_out',
    ];

    for(let i = stepKeys.length - 1;i >= 0;i--) {
      const key = stepKeys[i];
      if(data.stats[key] && data.stats[key]?.on) {
        lastStep = i;
        break;
      }
    }
    setCurrentStep(lastStep == -1 ? 0 : lastStep);
  }, [data])

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

  const steps = [
    { title: 'Allocated', description: data.stats.allocated.on ? service.utcToist(data.stats.allocated.on, 'dd-MMM-yyyy hh:mm a') : '--' },
    { title: 'Accepted', description: data.stats.accepted.on ? service.utcToist(data.stats.accepted.on, 'dd-MMM-yyyy hh:mm a') : '--' },
    { title: 'Assigned', description: data.stats.assigned.on ? service.utcToist(data.stats.assigned.on, 'dd-MMM-yyyy hh:mm a') : '--' },
    { title: 'Reported', description: data.stats.reported.on ? service.utcToist(data.stats.reported.on, 'dd-MMM-yyyy hh:mm a') : '--' },
    { title: 'Load_in', description: data.stats.load_in.on ? service.utcToist(data.stats.load_in.on, 'dd-MMM-yyyy hh:mm a') : '--' },
    { title: 'Load_out', description: data.stats.load_out.on ? service.utcToist(data.stats.load_out.on, 'dd-MMM-yyyy hh:mm a') : '--' },
    { title: 'Gate_out', description: data.stats.gate_out.on ? service.utcToist(data.stats.gate_out.on, 'dd-MMM-yyyy hh:mm a') : '--' },
    { title: 'Last Location', description: data.last_location_address || '--' }
  ];

  const leftPercentages = [
    12.2857, 25.2857, 37.571, 50.1429, 62.4286, 74.7143,
  ];

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
            Weight: {data.weight || '--'} Kgs
          </Typography>
        </Grid>

        <Grid item xs={12}>
           <div className="timeline-container" style={{ position: 'relative', marginTop: '5px' }}>
                      
            <Steps
              current={currentStep}
              // status="error"
              size="small"
              progressDot
              items={steps}
            />

            {Object.entries(data.stats).map((entry, idx, array) => {
              if (idx < array.length - 1) {
                const [key, value] = entry;
                const timeTaken = value.time_taken || "--";
                const leftPercentage = leftPercentages[idx];
                
                return (
                  <div 
                    key={`time-${index}-${idx}`} 
                    className="time-taken-indicator"
                    style={{
                      position: 'absolute',
                      left: `${leftPercentage}%`,
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