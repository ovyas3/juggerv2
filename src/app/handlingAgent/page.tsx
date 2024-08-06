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

interface SkipAndLimit {
    skip: number,
    limit: number
}

async function inviteAgent ({payload}:any){
    const response = await httpsPost(HANDLING_AGENT_INVITE, payload);
    return response;
}
async function getHandlingAgents ({skipAndLimit}: {skipAndLimit: SkipAndLimit}){
    const response = await httpsGet(`get/invited/handling_agent?skip=${skipAndLimit.skip}&limit=${skipAndLimit.limit}`);
    return response;
}

function HandlingAgent() {

    const [agentList, setAgentList] = useState([]);
    const [originalAgentList, setOriginalAgentList] = useState([]);
    const mobile = useWindowSize(500);
    const [openModalInvite, setOpenModalInvite] = useState(false);
    const [skipAndLimit, setSkipAndLimit] = useState<SkipAndLimit>({
        skip: 0,
        limit: 10
    })
    const [count, setCount] = useState(0);

    useEffect(()=>{
        getHandlingAgents({skipAndLimit}).then((response)=>{
            setAgentList(response?.data?.data)
            setCount(response?.data?.count)
            setOriginalAgentList(response?.data?.data)
        }).catch((error)=>{
            console.log(error)
        })
    },[skipAndLimit])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const targetValue = e.target.value.toLowerCase();
        
        if (targetValue === '') {
            setAgentList(originalAgentList); // Assuming you have the original list stored
        } else {
            const filteredAgentList = originalAgentList.filter((agent :any) => 
                agent?.handling_agent?.name.toLowerCase().includes(targetValue)
            );
            setAgentList(filteredAgentList);
        }
    };

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
                            {/* <div><ArrowDropDownSharpIcon/></div> */}
                        </div>
                        <div><input placeholder='Search for handling agent' className='search-input-agent' type='text' onChange={e => handleChange(e)} /></div>
                        <div style={{ cursor: 'pointer', height:24, width:24, position: 'absolute', right: 10 }}><img src={searchIcon.src} alt='searchIcon' style={{ width: '100%', height: '100%' }} /></div>
                    </div>
                    <div className='invite_button_container'>
                        <div className='invite_button' onClick={(e) => { e.stopPropagation(); setOpenModalInvite(true) }}>Invite Agent</div>
                    </div>
                </div>

                {/* --------------- Table content -------------- */}
               <AgentTable agentList={agentList} count={count} setSkipAndLimit={setSkipAndLimit}/>
            </div>

            {/* -------modals--------- */}
            <div className='modal_background'
                style={{ display: openModalInvite ? 'flex' : 'none' }}
                onClick={(e) => { e.stopPropagation(); setOpenModalInvite(false) }}
            >
                <div className='modal_inner_box'>
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





