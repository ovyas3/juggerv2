'use client';

import React, {useState, useEffect} from "react";
import { httpsGet } from "@/utils/Communication";
import { LAST_FOIS_PING } from "@/utils/helper";
import { useRouter } from "next/navigation";
import service from "@/utils/timeService";
import Tooltip from "@mui/material/Tooltip";
import { TooltipProps } from "@mui/material/Tooltip";
import { styled } from '@mui/material/styles';
import './LastFOISPing.css';

interface StyledTooltipProps extends TooltipProps {
    className?: string;
    color?: string;
}
  
const CustomTooltip = styled(({ className, color, ...props }: StyledTooltipProps & { color: string }) => (
    <Tooltip 
      {...props} 
      classes={{ popper: className }} 
      PopperProps={{
        popperOptions: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [2, -8],
              },
            },
          ],
        },
      }}
    />
  ))(({ color }) => ({
    '& .MuiTooltip-tooltip': {
      backgroundColor: color, // Use the color prop here
      color: '#fff',
      width: '100%',
      height: '36px',
      boxShadow: '0px 0px 2px rgba(0,0,0,0.1)',
      fontSize: '8px',
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      fontWeight: 600,
    },
    '& .MuiTooltip-arrow': {
      color: color, // Also set the arrow color
    },
}));
  

const LastFOISPing = () => {
    const [lastFOISPingDate, setLastFOISPingDate] = useState<any>('');
    const router = useRouter();

    async function lastFOISPing () {
        try {
          const lastFoisPing = await httpsGet(LAST_FOIS_PING, 0, router);
          if(lastFoisPing.data){
            if(lastFoisPing.data.time_stamp === null){
              setLastFOISPingDate('');
            } else{
              const lastFOISPingDate = new Date(lastFoisPing.data.time_stamp);
              setLastFOISPingDate(lastFOISPingDate);
            }
          } else {
            setLastFOISPingDate('');
          }
        } catch (error) {
          console.log(error);
        }
    }

    useEffect(() => {
        lastFOISPing(); 
    }, [])

    const getTimeDifferenceAndColor = (lastFoisPingDate: Date | string) => {
        const now = new Date();
    
        // Check if lastFoisPingDate is a valid date
        if (!lastFoisPingDate || !(lastFoisPingDate instanceof Date) || isNaN(lastFoisPingDate.getTime())) {
            return { timeAgo: 'No Date Found', color: '#CCCCCC' }; 
        }
    
        const diffInMs = now.getTime() - new Date(lastFoisPingDate).getTime();
        const diffInSeconds = Math.floor(diffInMs / 1000); 
    
        let color = '';
        let timeAgo = '';
    
        if (diffInSeconds < 60) { 
            timeAgo = `${diffInSeconds} seconds ago`;
            color = '#18BE8A';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            timeAgo = `${minutes} min${minutes > 1 ? 's' : ''} ago`;
            color = '#18BE8A';
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            const minutes = Math.floor((diffInSeconds % 3600) / 60); 
            timeAgo = `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min${minutes > 1 ? 's' : ''}` : ''} ago`;
            color = '#FF9800';
        } else { 
            const days = Math.floor(diffInSeconds / 86400);
            const hours = Math.floor((diffInSeconds % 86400) / 3600);
            timeAgo = `${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours} hour${hours > 1 ? 's' : ''}` : ''} ago`;
            color = '#FF5C5C';
        }
    
        return { timeAgo, color };
    };
    
    const { timeAgo, color } = getTimeDifferenceAndColor(lastFOISPingDate);

    return (
        <CustomTooltip 
          arrow 
          color={color}
          title={
              <div style={{
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  fontSize: '10px',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 600,
                  paddingTop: '2px',
                  gap: '2px'
              }}>
                  <div>{service.utcToist(lastFOISPingDate, "dd-MMM-yy HH:mm") || ''}</div>
                  <div>{timeAgo}</div>
              </div>
          }>
          <div className="fois-indication-circle" style={{ 
            backgroundColor: color
          }}>
              <div className="fois-indication-text">
                  FOIS
              </div>
          </div>
        </CustomTooltip>
    );
};  

export default LastFOISPing;