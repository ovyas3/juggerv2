'use client'

import Image from 'next/image';
import './Drawer.css'
import defaultLogo from '@/assets/logo_default_icon.svg';
// import fnrIcon from '@/assets/active_fnr_dashboard_icon.svg'
import contactIcon from '@/assets/inactive_contact_dashboard+icon.svg'
import { useEffect, useState } from 'react';
import TrainIcon from '@mui/icons-material/Train';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useRouter, usePathname } from 'next/navigation';
import fullLogo from '@/assets/Smartruck_hover_logo.svg'

function SideDrawer() {
    const [open, setOpen] = useState(false);
    const [activeContact, setActiveContact] = useState(false);
    const [active, setActive] = useState('orders')
    const router = useRouter();
    const pathName = usePathname();
    const handleRouting = (route: string) => {
        console.log(route)
        router.push('/' + route)
        setActive(route)
    };

    useEffect(() => {
        const currentRoute = pathName.split('/')[1]
        setActive(currentRoute)
    }, []);

    return (
        <div 
            className='containerDrawer' 
            onMouseEnter={() => { setOpen(true) }} 
            onMouseLeave={() => { setOpen(false) }} 
            style={{ 
                alignItems: 'start', 
                width: open ? '218px' : '70px', 
                transition: 'width 0.2s ease-in'
             }}>
            <div className='img'><Image src={open ? fullLogo : defaultLogo} alt='' style={{ height:'56px', marginLeft:open ? '23px' : '0px'}} /></div>
            <div 
                className='fnr-icon' onClick={() => handleRouting('orders')} 
                style={{ 
                    width: open ? '190px' : '42px', 
                    transition: 'width 0.2s ease-in', 
                    backgroundColor: (active == 'orders' || active == 'shipment_map_view') ? 'white' : '', 
                    cursor: 'pointer' 
                }}>
                <TrainIcon style={{ marginLeft: '9px', color: (active == 'orders' || active == 'shipment_map_view') ? 'black' : 'white' }} />
                <div className={`${open ? 'fnr_text' : 'fnr_text_none'}`} 
                    style={{ color: (active == 'orders' || active == 'shipment_map_view') ? 'black' : 'white' }} >Shipments
                </div>
            </div>

            <div onMouseEnter={() => { setActiveContact(true) }} onMouseLeave={() => { setActiveContact(false) }} onClick={() => handleRouting('dashboard')} className='contact-icon' style={{ width: open ? '190px' : '42px', justifyContent: open ? 'start' : 'center', backgroundColor: ((active == 'dashboard') || (active=="MapsHelper") || activeContact) ? 'white' : '', cursor: 'pointer' }}>
                <DashboardIcon style={{ marginLeft: open ? '9px' : '', color: ((active == 'dashboard')  || (active=="MapsHelper") || activeContact) ? 'black' : 'white' }} /><div className={`${open ? 'fnr_text' : 'fnr_text_none'}`} style={{ color: ((active == 'dashboard')  || (active=="MapsHelper") || activeContact) ? 'black' : 'white' }} >Captive Rakes</div>
            </div>
        </div>

    );

}

export default SideDrawer;