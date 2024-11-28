"use client";

import React, { useState, useEffect, Suspense } from "react";
import Header from "@/components/Header/header";
import { useWindowSize as useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import "./page.css";
import { useTranslations } from "next-intl";
import { useMediaQuery, useTheme } from '@mui/material';
import MobileDrawer from '@/components/Drawer/mobile_drawer';
import MobileHeader from '@/components/Header/mobileHeader';
import { ThreeCircles } from "react-loader-spinner";
import WagonTallySheet from "./wagonSheet";
import WagonAssignSheet from "./wagonAssignSheet";


function Page() {
  return (
    <Suspense fallback={<ThreeCircles />}>
      <PageContext />
    </Suspense>
  );
}

const PageContext = () => {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const text = useTranslations("WAGONTALLYSHEET");
  return (
      <div className="">
        { !mobile ?
          <Header title={text("in-plant-Dashboard")} isMapHelper={false} /> 
          : <MobileHeader />
        }
        <div 
          id="pageInsideContent"
          style={{
            marginTop: !mobile ? '56px' : '0px',
            marginLeft: !mobile ? '70px' : '0px',
          }}
        >
          <WagonTallySheet />
        </div>
        { !mobile ?
          <SideDrawer /> : <MobileDrawer />
        }
      </div>
  );
};

export default Page;
