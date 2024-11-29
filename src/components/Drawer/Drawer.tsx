'use client'

import Image from 'next/image';
import './Drawer.css'
import defaultLogo from '@/assets/logo_default_icon.svg';
import fullLogo from '@/assets/Smartruck_hover_logo.svg'
import StationManagementActive from '../../assets/station_management_active_icon.svg';
import StationManagementInactive from '../../assets/station_management_inactive_icon.svg';
import HandlingAgentInactive from '@/assets/handling_agent_inactive_icon.svg';
import handlingAgentActive from '@/assets/handling_agent_active_icon.svg'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import TrainIcon from '@mui/icons-material/Train';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ContactPageIcon from '@mui/icons-material/ContactPage';

interface NavItem {
    id: string;
    label: string;
    icon: any;
    activeIcon?: string;
    inactiveIcon?: string;
    isImageIcon?: boolean;
}

const navigationItems: NavItem[] = [
    { id: 'orders', label: 'Shipments', icon: TrainIcon },
    { id: 'dashboard', label: 'Captive Rakes', icon: DashboardIcon },
    { 
        id: 'stationManagement', 
        label: 'Station Management', 
        icon: '',
        activeIcon: StationManagementActive,
        inactiveIcon: StationManagementInactive,
        isImageIcon: true 
    },
    { 
        id: 'handlingAgent', 
        label: 'Handling Agent', 
        icon: '',
        activeIcon: handlingAgentActive,
        inactiveIcon: HandlingAgentInactive,
        isImageIcon: true 
    },
    { id: 'etaReport', label: 'Reports', icon: AssessmentIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'etaDashboard', label: 'Dashboard', icon: AllInboxIcon },
    { id: 'inPlantDashboard', label: 'In-Plant Dashboard', icon: WarehouseIcon },
    { id: 'contact', label: 'Contact Dashboard', icon: ContactPageIcon },
    // { id: 'captiveRakeMapView', label: 'Captive Rakes Management', icon: TrainIcon }
];

const NavItem = ({ 
    item, 
    isActive, 
    isHovered, 
    isOpen, 
    onClick, 
    onMouseEnter, 
    onMouseLeave 
}: {
    item: NavItem;
    isActive: boolean;
    isHovered: boolean;
    isOpen: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}) => {
    const isHighlighted = isActive || isHovered;
    const Icon = item.icon;

    return (
        <div
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className='station-code'
            style={{
                width: isOpen ? '190px' : '42px',
                justifyContent: isOpen ? 'start' : 'center',
                backgroundColor: isHighlighted ? 'white' : '',
                cursor: 'pointer'
            }}
        >
            {item.isImageIcon ? (
                <Image
                    src={isHighlighted ? item.activeIcon! : item.inactiveIcon!}
                    alt={item.label}
                    style={{ 
                        marginLeft: isOpen ? '10px' : '2px',
                        color: isHighlighted ? 'black' : 'white'
                    }}
                />
            ) : (
                <Icon 
                    style={{ 
                        marginLeft: isOpen ? '9px' : '', 
                        color: isHighlighted ? 'black' : 'white' 
                    }}
                />
            )}
            <div
                className={`${isOpen ? 'fnr_text' : 'fnr_text_none'}`}
                style={{ color: isHighlighted ? 'black' : 'white' }}
            >
                {item.label}
            </div>
        </div>
    );
};

function SideDrawer() {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState('orders');
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const router = useRouter();
    const pathName = usePathname();

    const handleRouting = (route: string) => {
        router.push('/' + route);
        setActive(route);
    };

    useEffect(() => {
        const currentRoute = pathName.split('/')[1];
        setActive(currentRoute);
    }, [pathName]);

    return (
        <div 
            className='containerDrawer' 
            onMouseEnter={() => setOpen(true)} 
            onMouseLeave={() => setOpen(false)} 
            style={{ 
                alignItems: 'start', 
                width: open ? '218px' : '70px', 
                transition: 'width 0.2s ease-in'
            }}
        >
            <div className='img'>
                <Image 
                    src={open ? fullLogo : defaultLogo} 
                    alt='logo'
                    style={{ 
                        height: '56px', 
                        marginLeft: open ? '23px' : '0px',
                        marginBottom: '10px'
                    }} 
                    onClick={() => handleRouting('welcome')}
                />
            </div>

            {navigationItems.map((item) => (
                <NavItem
                    key={item.id}
                    item={item}
                    isActive={active === item.id}
                    isHovered={hoveredId === item.id}
                    isOpen={open}
                    onClick={() => handleRouting(item.id)}
                    onMouseEnter={() => setHoveredId(item.id)}
                    onMouseLeave={() => setHoveredId(null)}
                />
            ))}
        </div>
    );
}

export default SideDrawer;