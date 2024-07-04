'use client'
import React, { useEffect, useState } from 'react';
import './style.css'
import Header from '@/components/Header/header';
import MobileHeader from '@/components/Header/mobileHeader';
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from '@/components/Drawer/Drawer';
import MobileDrawer from '@/components/Drawer/mobile_drawer';
import AgentTable from './agentTable';




function HandlingAgent() {
    const mobile = useWindowSize(500);


    return (
        <div className='handlingAgent_Container'>
            {/* -----header ------- */}
            { mobile ? <Header title={'Handling Agent'} isMapHelper={false}/> : <MobileHeader/> }


            {/* -------- pageContent--------- */}
            <div className={`content_container ${mobile ? 'adjustMargin': 'adjustMarginMobile'}`}  >
                <div style={{height:'10%', backgroundColor:'red'}}>content</div>
                <AgentTable/>
            </div>

            {/* -------sildeDrawer ----------- */}
            {mobile ? <SideDrawer/> : 
                <div className="bottom_bar">
                    <MobileDrawer />
            </div>}
        </div>
    )
}

export default HandlingAgent;