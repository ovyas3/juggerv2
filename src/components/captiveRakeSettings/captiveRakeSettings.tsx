"use client";

import React, { useState, useEffect } from "react";
import { httpsGet } from "@/utils/Communication";
import { Tab, Box } from "@mui/material";
import "./captiveRakeSettings.css";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import TrackingStatus from "../dashboard/status/trackingStatus";
import { Popup } from "@/components/Popup/popup";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import uploadIcon from '@/assets/uploadIcon.svg';
import UploadModel from "./captiveRakeSettingsAction/UploadModel";
import UpdateAgreementID from "./captiveRakeSettingsAction/UpdateAgreementID";
import dynamic from 'next/dynamic';
import Placeholder from '@/components/MapView/Skeleton/placeholder';
import { useMediaQuery, useTheme } from '@mui/material';

const CaptiveRakeSettings = () => {
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState<any>([]);
    const [statusInfo, setStatusInfo] = useState<string>('');
    const [statusNumber, setStatusNumber] = useState<number>(0);
    const [helpCenterBtnHovered, setHelpCenterBtnHovered] = useState(false);
    const [openUploadModel, setOpenUploadModel] = useState(false);
    const [updateAgreementModel, setUpdateAgreementModel] = useState(false);
    const t = useTranslations("DASHBOARD");

    const handleAllRakesAndTable = async (props: any) => {
        const getProps = props.toLowerCase().replace(/\s/g, ""); 
        if(getProps === "totalrakes"){
          const res = await httpsGet("all_captive_rakes_details", 0, router);
          setData(res);
        } else if (getProps === "trackingwithgps"){
          const res = await httpsGet("all_captive_rakes_details?tracking=true", 0, router);
          setData(res);
        } else if (getProps === "nontracking"){
          const res = await httpsGet("all_captive_rakes_details?tracking=false", 0, router);
          setData(res);
        }
        setStatusInfo("all");
        setStatusNumber(1);
    };
    
    const handleSchemeTypeAndTable = async (props: any) => {
      console.log(props,'propssvsbjfdfck')
      const getSchemeType = props;
      const validSchemes = ["SFTO", "GPWIS", "BFNV"];
    
      if (validSchemes.includes(getSchemeType)) {
        const res = await httpsGet(`all_captive_rakes_details?scheme=${getSchemeType}`, 0, router);
        setData(res);
        if(getSchemeType === "SFTO"){
          setStatusInfo("sfto");
          setStatusNumber(2);
        } else if(getSchemeType === "GPWIS"){
          setStatusInfo("gpwis");
          setStatusNumber(3);
        } else if(getSchemeType === "BFNV"){
          setStatusInfo("bfnv");
          setStatusNumber(4);
        }
      }
    }

    const handleTrackingAndNonTracking = async (props: any) => {
      const getProps = props;
      if(getProps === "trackingWithLoad"){
        const res = await httpsGet("all_captive_rakes_details?tracking=true&withLoad=true", 0, router);
        setData(res);
        setStatusInfo("trackingWithLoad");
        setStatusNumber(5);
      } else if(getProps === "trackingWithoutLoad"){
        const res = await httpsGet("all_captive_rakes_details?tracking=true&withLoad=false", 0, router);
        setData(res);
        setStatusInfo("trackingWithoutLoad");
        setStatusNumber(6);
      } else if(getProps === "nonTrackingWithLoad"){
        const res = await httpsGet("all_captive_rakes_details?tracking=false&withLoad=true", 0, router);
        setData(res);
        setStatusInfo("nonTrackingWithLoad");
        setStatusNumber(7);
      } else if(getProps === "nonTrackingWithoutLoad"){
        const res = await httpsGet("all_captive_rakes_details?tracking=false&withLoad=false", 0, router);
        setData(res);
        setStatusInfo("nonTrackingWithoutLoad");
        setStatusNumber(8);
      }
    };
    
    return (
        <>
            <div 
                onClick={()=>setOpenUploadModel(!openUploadModel)} 
                id='uploadFiles' 
                style={{paddingInline:'10px', cursor:'pointer' , gap:'8px', borderRadius:'6px' ,display:'flex', alignItems:'center', position:'absolute', top:8, right:30, width:'fit-content', height:'fit-content', zIndex:'1', backgroundColor:'#E6EAFF', color:"#3351FE", fontSize:'12px'}}>
                <div>
                    <Image src={uploadIcon.src} height={24} width={24} alt='upload' style={{marginTop:'4px'}} />
                </div>
                <div>
                    Upload Files
                </div>
            </div>
            <div 
                onClick={()=>{setUpdateAgreementModel(!updateAgreementModel)}} 
                style={{paddingInline:'10px', paddingBlock:'8px',fontSize:'12px', cursor:'pointer' , gap:'8px', borderRadius:'6px' ,display:'flex', alignItems:'center', position:'absolute', top:8, right:160, width:'fit-content', height:'fit-content', zIndex:'1', backgroundColor:'#E6EAFF', color:"#3351FE"}}>
              <text>{t("updateAgreementID")}</text>
            </div>
            <div>
              <div className="tracking-status-dashboard">
                <TrackingStatus 
                    handleAllRakesAndTable={handleAllRakesAndTable}
                    handleSchemeTypeAndTable={handleSchemeTypeAndTable}
                    handleTrackingAndNonTracking={handleTrackingAndNonTracking}
                    statusInfo={statusInfo}
                    statusNumber={statusNumber}
                />
              </div>
              <div className="popup-container">
                {data && <Popup data={data} handleSchemeTypeAndTable={handleSchemeTypeAndTable}/>}
                {openUploadModel && <UploadModel  setOpenUploadModel={setOpenUploadModel}/>}
                {updateAgreementModel && <UpdateAgreementID  setUpdateAgreementModel={setUpdateAgreementModel}/>}
              </div>
            </div>
        </>
    )
};

export default CaptiveRakeSettings; 