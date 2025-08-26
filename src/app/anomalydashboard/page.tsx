'use client'

import AnomalyDashboard from "@/components/anomalydashboard/anomalydashboard";
import React from "react";
import { useMediaQuery, useTheme } from '@mui/material';

// Assuming you have a layout with a header and drawer for mobile/desktop.
// I've included placeholders to mimic your sample page.tsx structure.
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import Header from "@/components/Header/header";

export default function AnomalyDashboardPage() {
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
                        !mobile ? <Header title={'Anomaly Dashboard'} isMapHelper={false} /> : <></>
                    }
                </div>
                {/* The main AnomalyDashboard component is rendered here */}
                <AnomalyDashboard />
            </div>
            {!mobile ? <SideDrawer /> : <div>
                <MobileDrawer />
            </div>}
        </div>
    );
}