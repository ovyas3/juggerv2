import React from "react";
import Tabsection from "../../components/dashboard/tabSection/tabSection";
import SideDrawer from "@/components/Drawer/Drawer";
import Header from "@/components/Header/header";


const page = () => {

  return (
   <div>
      <Header title="Dashboard"/>
     <div>
        <Tabsection/>
     </div>
     <SideDrawer/>
     </div>
  );
};

page.displayName = 'DashboardPage';

export default page;
