'use client'

import OwnVehicleUsage from "@/components/TransporterPerformance/OwnVehicleUsage/OwnVehicleUsage";
import React from "react";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import Header from "@/components/Header/header";
import { useMediaQuery, useTheme } from '@mui/material';

export default function TransporterPerformancePage() {
    const theme = useTheme();
    const mobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (<div>
        <div
            style={{
                marginBottom: !mobile ? '0px' : '60px',
            }}
        >
            <div style={{ width: '100%', overflowX: 'auto' }}>
                {
                    !mobile ? <Header title={'eWayBill Dashboard'} isMapHelper={false} /> : <></>
                }
            </div>
            <div>
                <OwnVehicleUsage />
            </div>
        </div>
        {!mobile ? <SideDrawer /> : <div >
            <MobileDrawer />
        </div>}
    </div>)

}