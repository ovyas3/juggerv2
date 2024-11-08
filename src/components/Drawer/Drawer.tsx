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
import StationManagementActive from '../../assets/station_management_active_icon.svg';
import StationManagementInactive from '../../assets/station_management_inactive_icon.svg';
import { useRouter, usePathname } from 'next/navigation';
import fullLogo from '@/assets/Smartruck_hover_logo.svg'
import HandlingAgentInactive from '@/assets/handling_agent_inactive_icon.svg';
import handlingAgentActive from '@/assets/handling_agent_active_icon.svg'
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

function SideDrawer() {
    const [open, setOpen] = useState(false);
    const [activeContact, setActiveContact] = useState(false);
    const [station, setStation] = useState(false);
    const [active, setActive] = useState('orders')
    const router = useRouter();
    const [handleAgent, setHandleAgent] = useState(false);
    const [etaReport, setEtaReport] = useState(false);
    const [dashboard, setDashboard] = useState(false);
    const  [setting,setSetting] = useState(false);
    const [showSubMenu, setShowSubMenu] = useState(false);
    const [inPlantWagonDashboard, setInPlantWagonDashboard] = useState(false);
    const [contactDashboard, setContactDashboard] = useState(false);
 
    const pathName = usePathname();
    const handleRouting = (route: string) => {
        console.log(route)
        router.push('/' + route)
        setActive(route)
    };

    useEffect(() => {
        const currentRoute = pathName.split('/')[1]
        console.log(currentRoute)
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

            <div 
                onMouseEnter={() => { setActiveContact(true) }} 
                onMouseLeave={() => { setActiveContact(false) }} 
                onClick={() => handleRouting('dashboard')} 
                className='contact-icon' 
                style={{ 
                    width: open ? '190px' : '42px',
                    justifyContent: open ? 'start' : 'center',
                    backgroundColor: ((active == 'dashboard') || activeContact) ? 'white' : '',
                    cursor: 'pointer' }}
            >
                <DashboardIcon style={{ marginLeft: open ? '9px' : '', color: ((active == 'dashboard') || activeContact) ? 'black' : 'white' }} />
                <div 
                    className={`${open ? 'fnr_text' : 'fnr_text_none'}`} 
                    style={{ color: ((active == 'dashboard') || activeContact) ? 'black' : 'white' }} >
                        Captive Rakes
                </div>
            </div>

            <div 
                onMouseEnter={() => { setStation(true) }}
                onMouseLeave={() => { setStation(false) }}
                onClick={() => handleRouting('stationManagement')}
                className='station-code'
                style={{ 
                    width: open ? '190px' : '42px',
                    justifyContent: open ? 'start' : 'center',
                    backgroundColor: ((active === 'stationManagement') || station) ? 'white' : '',
                    cursor: 'pointer'
                }}
            >
                <Image 
                    src={ (active === 'stationManagement' || station) ?  StationManagementActive : StationManagementInactive} alt='stationManagementIcon'  
                    style={{ marginLeft: open ? '9px' : '', color: ((active == 'stationManagement') || station) ? 'black' : 'white' }}/>
                <div 
                    className={`${open ? 'fnr_text' : 'fnr_text_none'}`}
                    style={{ color: ((active === 'stationManagement') || station) ? 'black' : 'white' }} >
                        Station Management
                </div>
            </div>

            <div 
                onMouseEnter={() => { setHandleAgent(true) }}
                onMouseLeave={() => { setHandleAgent(false) }}
                onClick={() => handleRouting('handlingAgent')}
                className='station-code'
                style={{ 
                    width: open ? '190px' : '42px',
                    justifyContent: open ? 'start' : 'center',
                    backgroundColor: ((active === 'handlingAgent') || handleAgent) ? 'white' : '',
                    cursor: 'pointer'
                }}
            >
                <Image 
                    src={ (active === 'handlingAgent' || handleAgent) ?  handlingAgentActive : HandlingAgentInactive} alt='stationManagementIcon'  
                    style={{ marginLeft: open ? '10px' : '2px', color: ((active == 'handlingAgent') || handleAgent) ? 'black' : 'white'}}/>
                <div 
                    className={`${open ? 'fnr_text' : 'fnr_text_none'}`}
                    style={{ color: ((active === 'handlingAgent') || handleAgent) ? 'black' : 'white' }} >
                        Handling Agent
                </div>
            </div>

            <div
                onMouseEnter={()=>{ setEtaReport(true) }}
                onMouseLeave={()=>{ setEtaReport(false) }}
                onClick={() => handleRouting('etaReport')}
                className='station-code'
                style={{
                    width: open ? '190px' : '42px',
                    justifyContent: open ? 'start' : 'center',
                    backgroundColor: ((active == 'etaReport') || etaReport) ? 'white' : '',
                    cursor: 'pointer'
                }}
            >
                <AssessmentIcon style={{ marginLeft: open ? '9px' : '', color: ((active == 'etaReport') || etaReport) ? 'black' : 'white' }}/>
                <div
                    className={`${open ? 'fnr_text' : 'fnr_text_none'}`}
                    style={{ color: ((active == 'etaReport') || etaReport) ? 'black' : 'white' }} 
                >Reports</div>
            </div>
            <div
                onMouseEnter={() => { setSetting(true); setShowSubMenu(true); }}
                onMouseLeave={() => { setSetting(false); }}
                // onClick={() => handleRouting('tools')}
                className="station-code"
                style={{
                    width: open ? '190px' : '42px',
                    justifyContent: open ? 'start' : 'center',
                    backgroundColor: ((active == 'updateETA') 
                    || (active == 'whatsAppNotify')
                    || setting) ? 'white' : '',
                    cursor: 'pointer',
                    position: 'relative'
                }}
            >
                <SettingsIcon style={{ 
                    marginLeft: open ? '9px' : '', 
                    color: ((active == 'updateETA') 
                    || (active == 'whatsAppNotify')
                    || setting) ? 'black' : 'white' }}
                />
                <div 
                    className={`${open ? 'fnr_text' : 'fnr_text_none'}`}
                    style={{ 
                        color: ((active == 'updateETA') 
                        || (active == 'whatsAppNotify')
                        || setting) ? 'black' : 'white' }} 
                >Settings</div>
                {setting && <ArrowRightIcon style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }} />}
                {/* Submenu */}
                {(showSubMenu && setting) && (
                    <div
                        className="submenu"
                        onMouseEnter={() => { setShowSubMenu(true); }}
                        onMouseLeave={() => { setShowSubMenu(false); }}
                    >
                        <div
                            className="submenu-option"
                            onClick={() => handleRouting('updateETA')}
                            style={{
                                color: (active == 'updateETA') ? 'black' : '',
                                backgroundColor: (active == 'updateETA') ? 'white' : ''
                            }}
                        >Update ETA</div>
                        <div
                            className="submenu-option"
                            onClick={() => handleRouting('whatsAppNotify')}
                            style={{
                                color: (active == 'whatsAppNotify') ? 'black' : '',
                                backgroundColor: (active == 'whatsAppNotify') ? 'white' : ''
                            }}
                        >WhatsApp Notify</div>
                    </div>
                )}
            </div>

            <div
                onMouseEnter={()=>{ setDashboard(true) }}
                onMouseLeave={()=>{ setDashboard(false) }}
                onClick={() => handleRouting('etaDashboard')}
                className='station-code'
                style={{
                    width: open ? '190px' : '42px',
                    justifyContent: open ? 'start' : 'center',
                    backgroundColor: ((active == 'etaDashboard') || dashboard) ? 'white' : '',
                    cursor: 'pointer'
                }}
            >
                <AllInboxIcon style={{ marginLeft: open ? '9px' : '', color: ((active == 'etaDashboard') || dashboard) ? 'black' : 'white' }}/>
                <div
                    className={`${open ? 'fnr_text' : 'fnr_text_none'}`}
                    style={{ color: ((active == 'etaDashboard') || dashboard) ? 'black' : 'white' }} 
                >Dashboard</div>
            </div>

            <div
                 onMouseEnter={()=>{ setInPlantWagonDashboard(true) }}
                 onMouseLeave={()=>{ setInPlantWagonDashboard(false) }}
                 onClick={() => handleRouting('inPlantDashboard')}
                 className='station-code'
                 style={{
                     width: open ? '190px' : '42px',
                     justifyContent: open ? 'start' : 'center',
                     backgroundColor: ((active == 'inPlantDashboard') || inPlantWagonDashboard) ? 'white' : '',
                     cursor: 'pointer'
                 }}
            >
                <WarehouseIcon style={{ marginLeft: open ? '9px' : '', color: ((active == 'inPlantDashboard') || inPlantWagonDashboard) ? 'black' : 'white' }}/>
                <div
                    className={`${open ? 'fnr_text' : 'fnr_text_none'}`}
                    style={{ color: ((active == 'inPlantDashboard') || inPlantWagonDashboard) ? 'black' : 'white' }} 
                >In-Plant Dashboard</div>
            </div>

             <div
                 onMouseEnter={()=>{ setContactDashboard(true) }}
                 onMouseLeave={()=>{ setContactDashboard(false) }}
                 onClick={() => handleRouting('contact')}
                 className='station-code'
                 style={{
                     width: open ? '190px' : '42px',
                     justifyContent: open ? 'start' : 'center',
                     backgroundColor: ((active == 'contact') || contactDashboard) ? 'white' : '',
                     cursor: 'pointer'
                 }}
            >
                <ContactPageIcon style={{ marginLeft: open ? '9px' : '', color: ((active == 'contact') || contactDashboard) ? 'black' : 'white' }}/>
                <div
                    className={`${open ? 'fnr_text' : 'fnr_text_none'}`}
                    style={{ color: ((active == 'contact') || contactDashboard) ? 'black' : 'white' }} 
                >Contact Dashboard</div>
            </div>
            

        </div>
    );

}

export default SideDrawer;