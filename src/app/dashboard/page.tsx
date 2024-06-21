'use client'
import React from "react";
import Tabsection from "../../components/dashboard/tabSection/tabSection";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import Header from "@/components/Header/header";
import { useWindowSize } from "@/utils/hooks";
import {useTranslations} from 'next-intl';

const Page = () => {
  const mobile = useWindowSize(600);
  const t = useTranslations('HEADER');

  return (
   <div>
      <div className="dashboardContainer">
        <div style={{ width: '100%', overflowX: 'auto' }}>
            {
              mobile ? <Header title={t('dashboard')} /> : <MobileHeader />
            }
        </div>
        <div>
          <Tabsection/>
        </div>
      </div>
      {mobile ? <SideDrawer /> : <div className="bottom_bar">
        <MobileDrawer />
      </div>} 
   </div>
  );
};

Page.displayName = 'DashboardPage';

export default Page;
