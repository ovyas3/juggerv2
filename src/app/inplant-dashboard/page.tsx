'use client'

import dynamic from 'next/dynamic';
const SideDrawer = dynamic(() => import('@/components/Drawer/Drawer'));
const MobileDrawer = dynamic(() => import('@/components/Drawer/mobile_drawer'));
const MobileHeader = dynamic(() => import('@/components/Header/mobileHeader'));
const Header = dynamic(() => import('@/components/Header/header'));
import { useMediaQuery, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';

const InPlantDashboard = dynamic(
  () => import('@/components/InPlantDashboard/InPlantDashboard'),
  { ssr: false }
);

export default function InPlantDashboardPage() {
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
                        !mobile ? <Header title={'InPlant Dashboard'} isMapHelper={false} /> : <></>
                    }
                </div>
                <div>
                    <InPlantDashboard />
                </div>
            </div>
            {!mobile ? <SideDrawer /> : <div>
                <MobileDrawer />
                <MobileHeader />
            </div>}
        </div>
    );
}