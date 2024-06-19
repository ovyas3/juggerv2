import React from "react";
import Tabsection from "../../components/dashboard/tabSection/tabSection";
import SideDrawer from "@/components/Drawer/Drawer";
import Header from "@/components/Header/header";
import {useTranslations} from 'next-intl';

const page = () => {
   const t = useTranslations('HEADER');
  return (
   <div>
      <Header title={t('dashboard')}/>
     <div>
        <Tabsection/>
     </div>
     <SideDrawer/>
   </div>
  );
};

page.displayName = 'DashboardPage';

export default page;
