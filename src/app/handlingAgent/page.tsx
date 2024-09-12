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
import { HANDLING_AGENT_INVITE, EXISTING_AGENT_INVITE } from "@/utils/helper";
import { httpsGet, httpsPost } from "@/utils/Communication";
import InviteBox from './invite';
import searchIcon from '@/assets/search_icon.svg'
import ArrowDropDownSharpIcon from '@mui/icons-material/ArrowDropDownSharp';
import { useTranslations } from 'next-intl';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from '@/hooks/snackBar';
import ActiveAgentList from '@/app/handlingAgent/activeHAtable';

interface SkipAndLimit {
    skip: number,
    limit: number
}

async function inviteAgent({ payload }: any) {
    const response = await httpsPost(HANDLING_AGENT_INVITE, payload);
    return response;
}


function HandlingAgent() {

    const { showMessage } = useSnackbar();
    const [agentList, setAgentList] = useState([]);
    const [originalAgentList, setOriginalAgentList] = useState([]);
    const mobile = useWindowSize(500);
    const [openModalInvite, setOpenModalInvite] = useState(false);
    const [skipAndLimit, setSkipAndLimit] = useState<SkipAndLimit>({
        skip: 0,
        limit: 0
    })
    const [count, setCount] = useState(0);
    const t = useTranslations("HANDLING_AGENT")
    const [selectedHeading, setSelectedHeading] = useState('activeHA');
    const [refresh, setRefresh] = useState(false);

    const [activeSkipAndLimit, setActiveSkipAndLimit] = useState<SkipAndLimit>({
        skip: 0,
        limit: 0,
    })
    const [activeCount, setActiveCount] = useState(0);
    const [activeAgentList, setActiveAgentList] = useState([]);
    const [activeOriginalAgentList, setActiveOriginalAgentList] = useState([]);

    async function reload() {
        getHandlingAgents({ skipAndLimit });
        getAllActiveHandlingAgents({ activeSkipAndLimit });
        showMessage('Refreshed successfully', 'success');
    }

    async function getHandlingAgents({ skipAndLimit }: { skipAndLimit: SkipAndLimit }) {
        try {
            const response = await httpsGet(`get/invited/handling_agent?skip=${skipAndLimit.skip}&limit=${skipAndLimit.limit}`)
                .then((response) => {
                    setCount(response?.data?.count);
                    setAgentList(response?.data?.data);
                    setOriginalAgentList(response?.data?.data);
                })
        } catch (error) {
            console.log(error)
        }
    }

    async function getAllActiveHandlingAgents({ activeSkipAndLimit }: { activeSkipAndLimit: SkipAndLimit }) {
        try {
            await httpsGet(`get/associatedHAs?limit=${activeSkipAndLimit.limit}&skip=${activeSkipAndLimit.skip}`).then((response) => {
                setActiveCount(response?.data?.count);
                setActiveAgentList(response?.data?.data);
                setActiveOriginalAgentList(response?.data?.data);
            }).catch((error) => {
                console.log(error);
            })
        } catch (error) {

        }
    }

    useEffect(() => {
        if(skipAndLimit.limit>0)
        getHandlingAgents({ skipAndLimit });
    }, [skipAndLimit])

    useEffect(() => {
        if(activeSkipAndLimit.limit>0)
        getAllActiveHandlingAgents({ activeSkipAndLimit });
    }, [activeSkipAndLimit])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const targetValue = e.target.value.toLowerCase();
        if (targetValue === '') {
            setAgentList(originalAgentList);
        } else {
            const filteredAgentList = originalAgentList.filter((agent: any) => {
                const parentName = agent?.handling_agent?.parent_name?.toLowerCase();
                return parentName?.includes(targetValue);
            });
            setAgentList(filteredAgentList);
        }
    };

    const handleChangeActiveAgents =(e: React.ChangeEvent<HTMLInputElement>) => {
        const targetValue = e.target.value.toLowerCase();
        if (targetValue === '') {
            setActiveAgentList(activeOriginalAgentList);
        } else {
            const filteredAgentList = activeOriginalAgentList.filter((agent: any) => {
                const parentName = agent?.name?.toLowerCase();
                return parentName?.includes(targetValue);
            });
            setActiveAgentList(filteredAgentList);
        }
    }

    return (
        <div className='handlingAgent_Container'>
            {/* ------------header ----------- */}
            {mobile ? <Header title={'Handling Agent'} isMapHelper={false} /> : <MobileHeader />}

            {/* ---------- pageContent---------- */}
            <div className={`content_container ${mobile ? 'adjustMargin' : 'adjustMarginMobile'}`}  >

                <div className='handlingAgent_title'>
                    <div className='handlingAgent_title_container'>
                        <div className={`handlingAgent_heading ${selectedHeading === 'activeHA' ? 'active' : ''} `} onClick={() => setSelectedHeading('activeHA')}>{t('activeHA')}</div>
                        <div className={`handlingAgent_heading ${selectedHeading === 'invitedHA' ? 'active' : ''} `} onClick={() => setSelectedHeading('invitedHA')} >{t('invitedHA')}</div>
                    </div>
                    <div
                        className={`refresh_icon ${refresh ? 'reload' : ''} `}
                        onClick={
                            () => {
                                reload();
                                setRefresh(true);
                                setTimeout(() => { setRefresh(false); }, 1500);
                            }}><RefreshIcon /></div>
                </div>

                <div style={{ marginTop: 24, display: selectedHeading === 'invitedHA' ? 'block' : 'none', height: '90%' }}>
                    {/* -------------other than table content ------------------- */}
                    <div className='search_invite'>
                        <div></div>
                        <div className='search_container'>
                            <div className='dropDown_agentName' >
                                <div>Agent Name</div>
                            </div>
                            <div><input placeholder='Search for handling agent' className='search-input-agent' type='text' onChange={e => handleChange(e)} /></div>
                            <div style={{ cursor: 'pointer', height: 24, width: 24, position: 'absolute', right: 10 }}><img src={searchIcon.src} alt='searchIcon' style={{ width: '100%', height: '100%' }} /></div>
                        </div>
                        <div className='invite_button_container'>
                            <div className='invite_button' onClick={(e) => { e.stopPropagation(); setOpenModalInvite(true) }}>Invite Agent</div>
                        </div>
                    </div>
                    {/* --------------- Table content -------------- */}
                    <AgentTable agentList={agentList} count={count} setSkipAndLimit={setSkipAndLimit} getHandlingAgents={getHandlingAgents} />
                </div>

                <div style={{ display: selectedHeading === 'activeHA' ? 'block' : 'none', height: '90%', marginTop:24 }} >
                    <div className='search_invite1'>
                    <div></div>
                        <div className='search_container'>
                            <div className='dropDown_agentName' >
                                <div>Agent Name</div>
                            </div>
                            <div><input placeholder='Search for handling agent' className='search-input-agent' type='text' onChange={e => handleChangeActiveAgents(e)} /></div>
                            <div style={{ cursor: 'pointer', height: 24, width: 24, position: 'absolute', right: 10 }}><img src={searchIcon.src} alt='searchIcon' style={{ width: '100%', height: '100%' }} /></div>
                        </div>
                    </div>
                    {/* --------------- Table content -------------- */}
                    <ActiveAgentList activeAgentList={activeAgentList} activeCount={activeCount} setActiveSkipAndLimit={setActiveSkipAndLimit} getAllActiveHandlingAgents={getAllActiveHandlingAgents} />
                </div>

            </div>

            {/* -------modals--------- */}
            <div className='modal_background'
                style={{ display: openModalInvite ? 'flex' : 'none' }}
                onClick={(e) => { e.stopPropagation(); setOpenModalInvite(false) }}
            >
                <div className='modal_inner_box'>
                    <div className='invite_box_carriers'>
                        <InviteBox setOpenModalInvite={setOpenModalInvite} getHandlingAgents={getHandlingAgents} />
                    </div>

                </div>
            </div>

            {/* ----------sildeDrawer ------------- */}
            {mobile ? <SideDrawer /> : <div className="bottom_bar"><MobileDrawer /></div>}
        </div>
    )
}

export default HandlingAgent;