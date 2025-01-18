'use client'
import React, { Suspense } from "react";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import Header from "@/components/Header/header";
import {useTranslations} from 'next-intl';
import { useMediaQuery, useTheme } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import ExternalParkingDashboard from "@/components/ExternalParking/Dashboard";

const DashboardContent = () => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

  
  return (
   <div>
      <div
        style={{
          marginBottom: !mobile ? '0px' : '60px',
        }}
      >
        <div style={{ width: '100%', overflowX: 'auto' }}>
            {
              !mobile ? <Header title={'SAP TMS Diagnostics Tool'} isMapHelper={false}/> : <MobileHeader />
            }
        </div>
        <div>
          <ExternalParkingDashboard />
        </div>
      </div>
      {!mobile ? <SideDrawer /> : <div >
        <MobileDrawer />
      </div>} 
   </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
};

Page.displayName = 'DashboardPage';

export default Page;
