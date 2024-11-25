"use client";

import React, { useState, useEffect } from "react";
import { httpsGet } from "@/utils/Communication";
import { Tab, Box } from "@mui/material";
import "./tabSection.css";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import TrackingStatus from "../status/trackingStatus";
import { Popup } from "@/components/Popup/popup";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import uploadIcon from '@/assets/uploadIcon.svg';
import UploadModel from "./tabSectionAction/UploadModel";
import dynamic from 'next/dynamic';
import Placeholder from '@/components/MapView/Skeleton/placeholder';

// Dynamic imports with loading placeholder
const MapView = dynamic(
  () => import('../mapView/mapView'),
  { 
    loading: () => <Placeholder />,
    ssr: false 
  }
);

const CaptiveRakeMapView = dynamic(
  () => import('@/components/captiveRakeMapView/captiveRakeMapView'),
  { 
    loading: () => <Placeholder />,
    ssr: false 
  }
);

interface TabSectionProps {
  initialTab?: string;
}

const Tabsection: React.FC<TabSectionProps> = ({ initialTab }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialTab || "1");
  const [data, setData] = useState<any>([]);
  const [statusInfo, setStatusInfo] = useState<string>('');
  const [statusNumber, setStatusNumber] = useState<number>(0);
  const [helpCenterBtnHovered, setHelpCenterBtnHovered] = useState(false);
  const [openUploadModel, setOpenUploadModel] = useState(false);
  const t = useTranslations("DASHBOARD");

  useEffect(() => {
    // Check for tab parameter in URL
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      setValue(tabFromUrl);
    } else if (initialTab) {
      setValue(initialTab);
    }
  }, [initialTab, searchParams]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setValue(newValue);
    // Update URL with new tab value
    const url = new URL(window.location.href);
    url.searchParams.set('tab', newValue);
    window.history.pushState({}, '', url);
  };

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
    <div className="wrapper">
      <div>
        <div>
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider"}}>
                <TabList onChange={handleChange}>
                  <Tab label={t("railOverview")} value="1" />
                  <Tab label={t("mapView")} value="2" />
                  <Tab label={t("foisDetails")} value="3" />
                </TabList>
              </Box>
             <TabPanel value="1" className="tabpanel-container" style={{position:'relative'}}>
                <div onClick={()=>setOpenUploadModel(!openUploadModel)} id='uploadFiles' style={{paddingInline:'10px', cursor:'pointer' , gap:'8px', borderRadius:'6px' ,display:'flex', alignItems:'center', position:'absolute', top:8, right:30, width:'fit-content', height:'fit-content', zIndex:'1', backgroundColor:'#E6EAFF', color:"#3351FE"}}>
                <div><Image src={uploadIcon.src} height={24} width={24} alt='upload' style={{marginTop:'8px'}} /></div>
                <div>Upload Files</div>
                </div>
                <div className="tabpanel-contents">
                  <div className="tracking-status-dashboard">
                    <TrackingStatus 
                          handleAllRakesAndTable={handleAllRakesAndTable}
                          handleSchemeTypeAndTable={handleSchemeTypeAndTable}
                          handleTrackingAndNonTracking={handleTrackingAndNonTracking}
                          statusInfo={statusInfo}
                          statusNumber={statusNumber}
                          />
                  </div>
                  <div className="vertical-line"/>
                  <div className="popup-container">
                  {data && <Popup data={data} handleSchemeTypeAndTable={handleSchemeTypeAndTable}/>}
                  {openUploadModel && <UploadModel  setOpenUploadModel={setOpenUploadModel}/>}
                  </div>
                </div>
              </TabPanel>
              <TabPanel value="2" className="tabpanel-container">
                <div style={{
                  width: '100%',
                  height: '80vh',
                  overflow: 'auto',
                }}>
                  <MapView />
                </div>
              </TabPanel>
              <TabPanel value="3" className="tabpanel-container">
                <div style={{
                  width: '100%',
                  height: '80vh',
                  overflow: 'auto',
                }}>
                  <CaptiveRakeMapView />
                </div>
              </TabPanel>
            </TabContext>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Tabsection;
