import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import CountUp from 'react-countup';

function InboundDashboard({setInBoundPayload, countInbound}:any) {
  const [status, setStatus] = useState(['ITNS', 'Delivered']);
  const t = useTranslations("ORDERS");

  const getStatusColor = (statuses: string[], div: string) => {
    let backgroundColor = '#FFFFFF';
    let countTextColor = '#42454E';
    let textTextColor = '#7C7E8C';
  
    switch (div) {
      case 'INPL':
        if (statuses.includes('INPL')) {
          backgroundColor = '#a3dfe11f';
          countTextColor = '#134d68'; 
          textTextColor = '#134d68'; 
        }
        break;
      case 'ITNS':
        if (statuses.includes('ITNS')) {
          backgroundColor = '#FF98001F';
          countTextColor = '#FF9800'; 
          textTextColor = '#FF9800'; 
        }
        break;
      case 'Delivered':
        if (statuses.includes('Delivered')) {
          backgroundColor = '#18BE8A1F';
          countTextColor = '#18BE8A'; 
          textTextColor = '#18BE8A'; 
        }
        break;
        case 'AVE':
          if (statuses.includes('AVE') ) {
            backgroundColor = '#E6EAFF';
            countTextColor = '#536AFE'; 
            textTextColor = '#536AFE'; 
          }
          break;
      case 'ALL':
        if (statuses.includes('ITNS') && statuses.includes('Delivered')) {
            backgroundColor = 'black';
            countTextColor = 'white'; 
            textTextColor = 'white'; 
        }
        break;
      default:
        backgroundColor = '#FFFFFF';
        countTextColor = '#42454E';
        textTextColor = '#7C7E8C';
    }
  
    return { backgroundColor, countTextColor, textTextColor };
  };

  useEffect(()=>{
    setInBoundPayload((previous:any)=>{
      return {...previous, status}
    })
  },[status])
  return (
    <div id="inboundDashboardForStatus">
      <div className="display_status_inner_box" onClick={()=>{
        setStatus((previous :any)=>{
            if (previous.length > 0) {
              return []
            }else{
                return ['ITNS', 'Delivered', 'INPL', 'AVE',];
            }
        })
      }}
      style={{
        backgroundColor: getStatusColor(status, 'ALL').backgroundColor,
        color: getStatusColor(status, 'ALL').textTextColor
      }}
      >
        <div style={{ fontSize: 20, fontWeight: 500 }}><CountUp end={countInbound.total} duration={1.2}/></div>
        <div style={{ fontSize: 12 }}>{t("Total")}</div>
      </div>
      {/* <div className="display_status_inner_box" onClick={()=>{
        setStatus((previous :any)=>{
            if(previous.includes('AVE')) return status.filter((item: string) => item !== 'AVE');
            return ['AVE', ...status];
        })
      }} 
      style={{
        backgroundColor: getStatusColor(status, 'AVE').backgroundColor,
        color: getStatusColor(status, 'AVE').textTextColor
      }}
      >
        <div style={{ fontSize: 20, fontWeight: 500 }}>0</div>
        <div style={{ fontSize: 12 }}>{t("Indent")}</div>
      </div> */}
      {/* <div className="display_status_inner_box" onClick={()=>{
        setStatus((previous :any)=>{
            if(previous.includes('INPL')) return status.filter((item: string) => item !== 'INPL');
            return ['INPL', ...status];
        })
      }}
      style={{
        backgroundColor: getStatusColor(status, 'INPL').backgroundColor,
        color: getStatusColor(status, 'INPL').textTextColor
      }}
      >
        <div style={{ fontSize: 20, fontWeight: 500 }}>0</div>
        <div style={{ fontSize: 12 }}>{t("In Plant")}</div>
      </div> */}
      <div className="display_status_inner_box" onClick={()=>{
        setStatus((previous :any)=>{
            if(previous.includes('ITNS')) return status.filter((item: string) => item !== 'ITNS');
            return ['ITNS', ...status];
        })
      }}
      style={{
        backgroundColor: getStatusColor(status, 'ITNS').backgroundColor,
        color: getStatusColor(status, 'ITNS').textTextColor
      }}
      >
        <div style={{ fontSize: 20, fontWeight: 500 }}><CountUp end={countInbound.ITNS} duration={1.2}/></div>
        <div style={{ fontSize: 12 }}>{t("In Transit")}</div>
      </div>
      <div className="display_status_inner_box" onClick={()=>{
        setStatus((previous :any)=>{
            if(previous.includes('Delivered')) return status.filter((item: string) => item !== 'Delivered');
            return ['Delivered', ...status];
        })
      }}
      style={{
        backgroundColor: getStatusColor(status, 'Delivered').backgroundColor,
        color: getStatusColor(status, 'Delivered').textTextColor
      }}
      >
        <div style={{ fontSize: 20, fontWeight: 500 }}><CountUp end={countInbound.Delivered} duration={1.2}/></div>
        <div style={{ fontSize: 12 }}>{t("Delivered")}</div>
      </div>
    </div>
  );
}
export default InboundDashboard;
