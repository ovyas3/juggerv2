'use client'

import BillingDashboard from "@/components/BillingDashboard/BillingDashboard"
import Header from "@/components/Header/header"
import SideDrawer from "@/components/Drawer/Drawer"
import MobileDrawer from "@/components/Drawer/mobile_drawer"
import MobileHeader from "@/components/Header/mobileHeader"
import { useMediaQuery, useTheme } from '@mui/material'

export default function BillingDashboardPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  return (
    <div>
      <div 
        className="dashboardContainer"
        style={{
          marginBottom: !isMobile ? '0px' : '60px',
          paddingTop: isMobile ? '56px' : '0px',
        }}
      >
        <div style={{ width: '100%' }}>
          {!isMobile ? <Header /> : <MobileHeader />}
        </div>
        <div>
          <BillingDashboard />
        </div>
      </div>
      {!isMobile ? <SideDrawer /> : <div>
        <MobileDrawer />
      </div>}
    </div>
  )
}
