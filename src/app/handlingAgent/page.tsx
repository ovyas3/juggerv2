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
                <div style={{ height: '10%' }}>
                    <div className='invite_button_container'>
                        <div
                            className='invite_button'
                            onClick={(e) => { e.stopPropagation(); setOpenModalInvite(true) }}
                        >Invite Agent</div>
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

function InviteBox({ setOpenModalInvite }: any) {
    const [toggleCloseButton, setToggleCloseButton] = useState(false)
    const [toggleAddAgent, setToggleAddAgent] = useState(false)

    const [panNumber, setPanNumber] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');

    return (
        <div className='invite_container'
            onClick={(e) => { e.stopPropagation(); }}
        >
            <div className='invite-heading'>Invite</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div className="form-container">
                    <form>
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="text"
                                id="pan"
                                value={panNumber}
                                onChange={(e) => setPanNumber(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label className="form-label" htmlFor="pan">PAN Number</label>
                        </div>
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label className="form-label" htmlFor="email">Email</label>
                        </div>
                        <div className="form-group">
                            <input
                                className="form-control"
                                type="tel"
                                id="mobile"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder=" "
                                required
                            />
                            <label className="form-label" htmlFor="mobile">Mobile</label>
                        </div>
                    </form>
                </div>
            </div>
            <div className='invite_button_send'
                onClick={(e)=>{e.stopPropagation(); setToggleAddAgent(true)}}
            >invite</div>

            <div className='close_modal_button'
                onMouseEnter={() => { setToggleCloseButton(true) }}
                onMouseLeave={() => { setToggleCloseButton(false) }}
                onClick={(e) => { e.stopPropagation(); setOpenModalInvite(false) }}
                style={{ transform: toggleCloseButton ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'all 1s ease-in-out',
                    
                 }}
            >
                <CloseIcon />
            </div>

            <div className='addAgentBox' style={{display:toggleAddAgent?'block':'none',}}>
                <div className='invite-heading-agent'>Add Agent</div>
                <div className='unitStation'>Units Stations :</div>
                <div className='input_station_box'>input</div>

                <div className='close_modal_button'
                onMouseEnter={() => { setToggleCloseButton(true) }}
                onMouseLeave={() => { setToggleCloseButton(false) }}
                onClick={(e) => { e.stopPropagation(); setToggleAddAgent(false) }}
                style={{  transform: toggleCloseButton ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'all 1s ease-in-out' }}
                ><CloseIcon />
                </div>
                <div style={{display:'flex', justifyContent:'right',position:'absolute', bottom:'5%', right:'5%', gap:10 }}>
                <div className='cancel_button_invite'>cancel</div>
                <div className='add_agent_button'>add</div>
                </div>
            </div>

        </div>
    );
}



