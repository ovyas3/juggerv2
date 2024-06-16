'use client'

import Image from 'next/image';
import './Drawer.css'
import defaultLogo from '@/assets/logo_default_icon.svg';
// import fnrIcon from '@/assets/active_fnr_dashboard_icon.svg'
import contactIcon from '@/assets/inactive_contact_dashboard+icon.svg'
import { useState } from 'react';
import TrainIcon from '@mui/icons-material/Train';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DashboardIcon from '@mui/icons-material/Dashboard';

function SideDrawer ({active= {'shipments': true}}: any){

    const [open, setOpen] = useState(false);
    const [activeContact, setActiveContact] = useState(false);

    return(

        // <div className='containerDrawer' onMouseEnter={()=>{setOpen(true)}} onMouseLeave={()=>{setOpen(false)}} style={{alignItems:'start', width:open ?'218px':'70px', transition:'width 0.2s ease-in'}}>
        //     <div className='img'><Image src={defaultLogo} alt=''/></div>
        //     <div className='fnr-icon' style={{width:open?'190px':'42px',transition:'width 0.2s ease-in'}}><TrainIcon style={{marginLeft:'9px'}} /><div className={`${open?'fnr_text':'fnr_text_none'}`}>Shipments</div></div>
        //     <div onMouseEnter={()=>{setActiveContact(true)}} onMouseLeave={()=>{setActiveContact(false)}} className='contact-icon' style={{width:open?'190px':'42px',justifyContent:open?'start':'center', backgroundColor:activeContact?'white':''}}><Image src={contactIcon} alt='' style={{marginLeft:open?'9px':'', color:activeContact?'black':'white'}}  /><div className={`${open?'fnr_text':'fnr_text_none'}`} style={{color:activeContact?'black':'white'}} >Dashboard</div></div>
        // </div>
        
        <div className='containerDrawer' onMouseEnter={()=>{setOpen(true)}} onMouseLeave={()=>{setOpen(false)}} style={{alignItems:'start', width:open ?'218px':'70px', transition:'width 0.2s ease-in'}}>
            <div className='img'><Image src={defaultLogo} alt=''/></div>
            <div className='fnr-icon' style={{width:open?'190px':'42px',transition:'width 0.2s ease-in'}}>
                <TrainIcon style={{marginLeft:'9px', color: active['shipments' ? 'black' : 'white']}} /><div className={`${open?'fnr_text':'fnr_text_none'}`} style={{color:active['shipments']?'black':'white'}} >Shipments</div>
            </div>

            <div onMouseEnter={()=>{setActiveContact(true)}} onMouseLeave={()=>{setActiveContact(false)}} className='contact-icon' style={{width:open?'190px':'42px',justifyContent:open?'start':'center', backgroundColor: (active['dashboard'] || activeContact)?'white':''}}>
                <DashboardIcon style={{marginLeft:open?'9px':'', color: (active['dashboard'] || activeContact) ?'black':'white'}}  /><div className={`${open?'fnr_text':'fnr_text_none'}`} style={{color:(active['dashboard'] || activeContact)?'black':'white'}} >Dashboard</div>
            </div>
        </div>
    
    );

}

export default SideDrawer;