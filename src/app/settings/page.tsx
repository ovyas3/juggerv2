"use client";
import React, { useState, Suspense } from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useTranslations } from "next-intl";
import "./style.css";
import UpdateETA from '@/app/updateETA/page';
import WhatsAppNotify from "@/components/whatsAppNotify/whatsAppNotify";
import Preferences from "@/components/Preferences/preferences";
import { useMediaQuery, useTheme } from '@mui/material';
import CaptiveRakeSettings from "@/components/captiveRakeSettings/captiveRakeSettings";
import StationManagement from "@/components/stationManagement/stationManagement";
import HandlingAgent from "@/components/handlingAgent/handlingAgent";
import RakeFreeTimeSetting from "@/components/RakeFreeTimeSetting/RakeFreeTimeSetting";

function Settings() {
  const text = useTranslations("SETTINGS");
  const [activeOption, setActiveOption] = useState("captiveRakes");
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div>
      {!mobile ? (
        <Header title={"Settings"} isMapHelper={false} />
      ) : (
        <MobileHeader />
      )}

      <div className={`content_container_settings ${!mobile ? "adjustMargin" : "adjustMarginMobile"}`}>
        <div id="settings-container">
          <div id="left-section">
            <div 
              className={activeOption === 'captiveRakes' ? 'activeOptionSettings': "normalOptionSettings" } 
              onClick={()=>setActiveOption('captiveRakes')}>
                {text("captiveRakes")}
            </div>
            <div 
              className={activeOption === 'station&Contacts' ? 'activeOptionSettings': "normalOptionSettings" } 
              onClick={()=>setActiveOption('station&Contacts')}>
                {text("station&Contacts")}
            </div>
            <div 
              className={activeOption === 'hubRMS' ? 'activeOptionSettings': "normalOptionSettings" } 
              onClick={()=>setActiveOption('hubRMS')}>
                {text("hubRMS")}
            </div>
            <div 
              className={activeOption === 'updateETA' ? 'activeOptionSettings': "normalOptionSettings" } 
              onClick={()=>setActiveOption('updateETA')}>
                {text("updateETA")}
            </div>
            <div 
              className={activeOption === 'RakeFreeTime' ? 'activeOptionSettings': "normalOptionSettings" } 
              onClick={()=>setActiveOption('RakeFreeTime')}>
                {text("RakeFreeTime")}
            </div>
            <div 
              className={activeOption === 'notification' ? 'activeOptionSettings': "normalOptionSettings" } 
              onClick={()=>setActiveOption('notification')}>
                {text("notification")}
            </div>
            <div 
              className={activeOption === 'preferences' ? 'activeOptionSettings': "normalOptionSettings" } 
              onClick={()=>setActiveOption('preferences')}>
                {text("preferences")}
            </div>
          </div>
          <div id="right-section">
            <Suspense fallback={<div>Loading...</div>}>
              {activeOption === 'captiveRakes' && <CaptiveRakeSettings />}
              {activeOption === 'station&Contacts' && <StationManagement />}
              {activeOption === 'hubRMS' && <HandlingAgent />}
              {activeOption === 'updateETA' && <UpdateETA />}
              {activeOption === 'RakeFreeTime' && <RakeFreeTimeSetting />}
              {activeOption === 'notification' && <WhatsAppNotify />}
              {/* {activeOption === 'preferences' && <Preferences/>} */}
            </Suspense>
          </div>
        </div>
      </div>

      {!mobile ? (
        <SideDrawer />
      ) : (
        <div >
          <MobileDrawer />
        </div>
      )}
    </div>
  );
}

export default Settings;