'use client';

import DayRun from '@/components/DayRun/DayRun';
import React from "react";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import Header from "@/components/Header/header";
import { useMediaQuery, useTheme } from '@mui/material';

export default function DayRunPage() {
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
          {!mobile ? <Header title={'Day Run'} isMapHelper={false} /> : <></>}
        </div>
        <div>
          <DayRun />
        </div>
      </div>
      {!mobile ? <SideDrawer /> : <div><MobileDrawer /></div>}
    </div>
  );
}