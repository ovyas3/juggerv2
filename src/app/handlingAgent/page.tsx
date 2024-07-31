'use client'
import React, { useEffect, useState } from 'react';
import './style.css'
import Header from '@/components/Header/header';
import MobileHeader from '@/components/Header/mobileHeader';
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from '@/components/Drawer/Drawer';
import MobileDrawer from '@/components/Drawer/mobile_drawer';
import AgentTable from './agentTable';
import CloseIcon from '@mui/icons-material/Close';
import { HANDLING_AGENT_INVITE, EXISTING_AGENT_INVITE} from "@/utils/helper";
import { httpsGet, httpsPost } from "@/utils/Communication";
import InviteBox from './invite';
import searchIcon from '@/assets/search_icon.svg'
import ArrowDropDownSharpIcon from '@mui/icons-material/ArrowDropDownSharp';

async function inviteAgent ({payload}:any){
    const response = await httpsPost(HANDLING_AGENT_INVITE, payload);
    return response;
}


function HandlingAgent() {
    const mobile = useWindowSize(500);
    const [openModalInvite, setOpenModalInvite] = useState(false);


    return (
        <div className='handlingAgent_Container'>
            {/* ------------header ----------- */}
            {mobile ? <Header title={'Handling Agent'} isMapHelper={false} /> : <MobileHeader />}


            {/* ---------- pageContent---------- */}
            <div className={`content_container ${mobile ? 'adjustMargin' : 'adjustMarginMobile'}`}  >

                {/* -------------other than table content ------------------- */}
                <div className='search_invite'>
                    <div></div>
                    <div className='search_container'>
                        <div className='dropDown_agentName' >
                            <div>Agent Name</div>
                            <div><ArrowDropDownSharpIcon/></div>
                        </div>
                        <div><input placeholder='Search for handling agent' className='search-input-agent' type='text'/></div>
                        <div style={{ cursor: 'pointer', height:24, width:24, position: 'absolute', right: 10 }}><img src={searchIcon.src} alt='searchIcon' style={{ width: '100%', height: '100%' }} /></div>
                    </div>
                    <div className='invite_button_container'>
                        <div className='invite_button' onClick={(e) => { e.stopPropagation(); setOpenModalInvite(true) }}>Invite Agent</div>
                    </div>
                </div>

                {/* --------------- Table content -------------- */}
                {/* <AgentTable/> */}
            </div>

            {/* -------modals--------- */}
            <div className='modal_background'
                style={{ display: openModalInvite ? 'flex' : 'none' }}
                onClick={(e) => { e.stopPropagation(); setOpenModalInvite(false) }}
            >
                <div className='modal_inner_box' onClick={(e) => { console.log('modal is clicking') }}>
                    <div className='invite_box_carriers'>
                        <InviteBox setOpenModalInvite={setOpenModalInvite} />
                    </div>

                </div>
            </div>

            {/* ----------sildeDrawer ------------- */}
            {mobile ? <SideDrawer /> :
                <div className="bottom_bar">
                    <MobileDrawer />
                </div>}
        </div>
    )
}

export default HandlingAgent;





