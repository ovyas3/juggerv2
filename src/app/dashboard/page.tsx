'use client'
'use client'
import React from "react";
import Tabsection from "../../components/dashboard/tabSection/tabSection";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import Header from "@/components/Header/header";
import { useWindowSize } from "@/utils/hooks";
import {useTranslations} from 'next-intl';
import { useMediaQuery, useTheme } from '@mui/material';

const Page = () => {
  const t = useTranslations('HEADER');
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          <Tabsection/>
        </div>
      </div>
      {!mobile ? <SideDrawer /> : <div >
        <MobileDrawer />
      </div>} 
   </div>
  );
};

Page.displayName = 'DashboardPage';

export default Page;
