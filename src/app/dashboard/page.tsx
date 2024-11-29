'use client'
import React, { Suspense } from "react";
import Tabsection from "../../components/dashboard/tabSection/tabSection";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import Header from "@/components/Header/header";
import { useWindowSize } from "@/utils/hooks";
import {useTranslations} from 'next-intl';
import { useMediaQuery, useTheme } from '@mui/material';
import { useSearchParams } from 'next/navigation';

const DashboardContent = () => {
  const t = useTranslations('HEADER');
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const searchParams = useSearchParams();
  const fromWelcome = searchParams.get('fromWelcome');
  
  return (
   <div>
      <div 
        className="dashboardContainer"
        style={{
          marginBottom: !mobile ? '0px' : '60px',
        }}
      >
        <div style={{ width: '100%', overflowX: 'auto' }}>
            {
              !mobile ? <Header title={'Captive Rakes'} isMapHelper={false}/> : <MobileHeader />
            }
        </div>
        <div>
          <Tabsection initialTab={"1"}/>
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
