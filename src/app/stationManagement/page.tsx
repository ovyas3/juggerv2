'use client'

import Header from "@/components/Header/header";
import StationHeader from "@/components/Station/StationHeader";
import SideDrawer from "@/components/Drawer/Drawer"
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useWindowSize } from "@/utils/hooks";
import MobileHeader from "@/components/Header/mobileHeader";
import { useState } from "react";
import './page.css'

const Page = () => {
  const mobile = useWindowSize(600);
  const [count,setCount] = useState(0)

  return (
    <div >
      <div className="station-container">
        <div style={{ width: '100%', overflowX: 'auto' }}>
            {
            mobile ? <Header title={'Station Management'} /> : <div className="mobile-head">  <MobileHeader /> </div>
            }
        </div>
        <div className="station-head">
            < StationHeader count={count}/>
        </div>
      </div>
      {mobile ? <div className="side-bar"><SideDrawer /></div> : <div className="bottom_bar">
        <MobileDrawer />
      </div>} 
    </div>
  )
}

export default Page;