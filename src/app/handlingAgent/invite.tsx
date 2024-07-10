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
import { useSnackbar } from '@/hooks/snackBar';

function InviteBox({ setOpenModalInvite }: any) {
    const [toggleCloseButton, setToggleCloseButton] = useState(false)

    const [inviteForm, setInviteForm] = useState({
        email_id: '',
        pan: '',
        mobile: '',
    })

    async function submitInvite(e: any) {
        if (inviteForm.email_id === '' || inviteForm.mobile === '' || inviteForm.mobile === '') {
            alert('Please fill all the fields')
        } else {
            await httpsPost(HANDLING_AGENT_INVITE, inviteForm)
            .then((res) => {
                    if (res && res.statusCode === 200) {
                        // popup 
                        setInviteForm({
                            email_id: '',
                            pan: '',
                            mobile: '',
                        });
                        setOpenModalInvite(false);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

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
                                value={inviteForm.pan}
                                onChange={(e) => setInviteForm(prevState => ({
                                    ...prevState,
                                    pan: e.target.value
                                }))}
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
                                value={inviteForm.email_id}
                                onChange={(e) => setInviteForm(prevState => ({
                                    ...prevState,
                                    email_id: e.target.value
                                }))}
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
                                value={inviteForm.mobile}
                                onChange={(e) => setInviteForm(prevState => ({
                                    ...prevState,
                                    mobile: e.target.value
                                }))}
                                placeholder=" "
                                required
                            />
                            <label className="form-label" htmlFor="mobile">Mobile</label>
                        </div>
                    </form>
                </div>
            </div>
            <div className='invite-button-container' style={{display:'hidden'}}>
                <div className='invite_button_send'
                    onClick={(e) => { submitInvite(e); e.stopPropagation(); }}
                >invite</div>
            </div>
            {/* <div className='divider'>
                <div>----- Agent Is Already Present -----</div>
            </div> */}


            {/* <div className='addAgentBox' style={{display:toggleAddAgent?'block':'none',}}>
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
                <div className='add_agent_button' onSubmit={(e)=>{addAgent(e); }}>add</div>
                </div>
            </div> */}



            <div className='close_modal_button'
                onMouseEnter={() => { setToggleCloseButton(true) }}
                onMouseLeave={() => { setToggleCloseButton(false) }}
                onClick={(e) => { e.stopPropagation(); setOpenModalInvite(false) }}
                style={{
                    transform: toggleCloseButton ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'all 1s ease-in-out',

                }}
            >
                <CloseIcon />
            </div>

        </div>
    );
}

export default InviteBox;
