"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useTranslations } from "next-intl";
import "./style.css";
import { redirect, useRouter, useParams } from "next/navigation";
import UpdateETA from '@/app/updateETA/page';
import WhatsAppNotify from '@/app/whatsAppNotify/page';
import { useMediaQuery, useTheme } from '@mui/material';

function Settings() {
    const text = useTranslations("ETADASHBOARD");
    const route = useRouter();
    const [activeOption, setActiveOption] = useState("updateETA");
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('md'));
  
    return (
        <div>
          {!mobile ? (
            <Header title={"Settings"} isMapHelper={false} />
          ) : (
            <MobileHeader />
          )}
    
          <div
            className={`content_container_contact ${!mobile ? "adjustMargin" : "adjustMarginMobile"}`}
            style={{backgroundColor:'#F0F3F9'}}
          >

            <div style={{width:'100%', backgroundColor:'white', height:'100%', borderRadius:'12px', boxShadow:'0px 4px 12px rgba(0, 0, 0, 0.15)', display:'flex', }}>
                <div id="left-section">
                    <div className={activeOption === 'updateETA' ? 'activeOption':""} style={{paddingInline:'16px', paddingBlock:'10px', cursor:'pointer'}} onClick={()=>setActiveOption('updateETA')} >Update ETA</div>
                    <div className={activeOption === 'whatsAppNotify' ? 'activeOption':""} style={{paddingInline:'16px', paddingBlock:'10px', cursor:'pointer'}} onClick={()=>setActiveOption('whatsAppNotify')} >WhatsApp Notify</div>
                </div>
                <div id="right-section">
                    {activeOption === 'updateETA' && <UpdateETA />}
                    {activeOption === 'whatsAppNotify' && <WhatsAppNotify />}
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