'use client'
import React, { useEffect, useState } from 'react';
import './style.css'

import CloseIcon from '@mui/icons-material/Close';
import { HANDLING_AGENT_INVITE, EXISTING_AGENT_INVITE } from "@/utils/helper";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useSnackbar } from '@/hooks/snackBar';

interface InviteForm {
    email_id: string;
    pan: string;
    mobile: string;
}

function InviteBox({ setOpenModalInvite ,getHandlingAgents}: any) {
    const { showMessage } = useSnackbar();
    const [toggleCloseButton, setToggleCloseButton] = useState(false)
    const [alreadyRegistered, setAlreadyRegistered] = useState(false)
    const [inviteForm, setInviteForm] = useState({
        email_id: '',
        pan: '',
        mobile: '',
    })

    const validation = (inviteForm: InviteForm): Boolean => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if (!panRegex.test(inviteForm.pan)) {
            showMessage('Invalid PAN number', 'error');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteForm.email_id)) {
            showMessage('Invalid email address', 'error');
            return false;
        }
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(inviteForm.mobile)) {
            showMessage('Invalid mobile number', 'error');
            return false;
        }
        return true;
    }


    async function submitInvite(e: any) {
        e.preventDefault();
        if (!inviteForm.pan) showMessage('Please Enter Pan Number', 'error');
        else if (!inviteForm.email_id) showMessage('Please Enter Email Id', 'error');
        else if (!inviteForm.mobile) showMessage('Please Enter Mobile Number', 'error');
        const valid = validation(inviteForm);
        if(valid){
            await httpsPost(HANDLING_AGENT_INVITE, inviteForm)
            .then((res) => {
                    if (res && res.statusCode === 200) {
                        setInviteForm({
                            email_id: '',
                            pan: '',
                            mobile: '',
                        });
                        getHandlingAgents({skipAndLimit: {skip: 0, limit:10 }});
                        showMessage('Invitation Sent Successfully', 'success');
                        setOpenModalInvite(false);
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    }

    async function handlePanChange(e: any) {
        e.preventDefault();
        setInviteForm(prevState => ({ ...prevState, pan: e.target.value }));
        let validForPan = false;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        if(e.target.value.length === 10){
            if(!panRegex.test(e.target.value)){
                showMessage('Invalid PAN number', 'error');
                return;
            }
            validForPan = true;
            if(e.target.value.length === 10 && validForPan){
                try {
                    await httpsGet(`get/pan?pan=${e.target.value}`).then((res) => {
                        setAlreadyRegistered(true);
                        if(res?.data) setInviteForm(prevState => ({ ...prevState, email_id: res?.data?.email_id, mobile: res?.data?.mobile }));
                    }).catch((err) => {console.log(err)})
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }

    return (
        <div className='invite_container'
            onClick={(e) => { e.stopPropagation(); }}
        >
            <div className='invite-heading'>Invite</div>

            <div style={{ marginTop: 36 }}>
                <div>
                    <label className='lable_name'>PAN Number</label>
                    <div><input type="text" className='inputBox' value={inviteForm.pan} onChange={(e) => {handlePanChange(e)}} /></div>
                </div>
                {alreadyRegistered && <div>
                    <label className='lable_name'>Email Id</label>
                    <div><input type="text" className='inputBox' style={{cursor:'text'}} disabled={false} value={inviteForm.email_id} onChange={(e) => setInviteForm(prevState => ({ ...prevState, email_id: e.target.value }))} /></div>
                </div> }
                
                {alreadyRegistered && <div>
                    <label className='lable_name'>Mobile Number</label>
                    <div><input type="text" className='inputBox' value={inviteForm.mobile} onChange={(e) => setInviteForm(prevState => ({ ...prevState, mobile: e.target.value }))} /></div>
                </div> }
                
            </div>
            <div className='invite-button-container' style={{ display: 'hidden' }}>
                <div className='invite_button_send'
                    onClick={(e) => { submitInvite(e); e.stopPropagation(); }}
                >Invite</div>
            </div>

            <div className='close_modal_button'
                onMouseEnter={() => { setToggleCloseButton(true) }}
                onMouseLeave={() => { setToggleCloseButton(false) }}
                onClick={(e) => { e.stopPropagation(); setOpenModalInvite(false), setInviteForm({ email_id: '', pan: '', mobile: '' }); setAlreadyRegistered(false) }}
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
