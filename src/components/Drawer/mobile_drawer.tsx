'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import './mobile_drawer.css';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TrainIcon from '@mui/icons-material/Train';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import AllInboxIcon from '@mui/icons-material/AllInbox';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import StationManagementActive from '../../assets/station_management_active_icon.svg';
import StationManagementInactive from '../../assets/station_management_inactive_icon.svg';
import HandlingAgentInactive from '@/assets/handling_agent_inactive_icon.svg';
import handlingAgentActive from '@/assets/handling_agent_active_icon.svg';
import fullLogo from '@/assets/Smartruck_hover_logo.svg';

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
    // { id: 'dashboard', label: 'Captive Rakes', icon: DashboardIcon },
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
    // { id: 'etaDashboard', label: 'Dashboard', icon: AllInboxIcon },
    { id: 'inPlantDashboard', label: 'In-Plant Dashboard', icon: WarehouseIcon },
    { id: 'contact', label: 'Contact Dashboard', icon: ContactPageIcon },
    // { id: 'captiveRakeMapView', label: 'Captive Rakes Management', icon: TrainIcon }
];

const NavItem = ({ 
    item,
    isActive,
    onClick 
}: {
    item: NavItem;
    isActive: boolean;
    onClick: () => void;
}) => {
    const Icon = item.icon;

    return (
        <button
            onClick={onClick}
            className={`drawer-item ${isActive ? 'active' : ''}`}
        >
            {item.isImageIcon ? (
                <Image
                    src={isActive ? item.activeIcon! : item.inactiveIcon!}
                    alt={item.label}
                    className="nav-icon"
                    width={24}
                    height={24}
                />
            ) : (
                <Icon className="nav-icon" />
            )}
            <span className="nav-label">{item.label}</span>
        </button>
    );
};

const BottomNavItem = ({ 
    icon: Icon,
    label,
    isActive,
    onClick 
}: {
    icon: any;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button 
        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
        onClick={onClick}
    >
        <Icon className="nav-icon" />
        <span className="nav-label">{label}</span>
    </button>
);

function MobileDrawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [active, setActive] = useState('orders');
    const router = useRouter();
    const pathName = usePathname();

    const handleRouting = (route: string) => {
        router.push('/' + route);
        setActive(route);
        setIsOpen(false);
    };

    useEffect(() => {
        const currentRoute = pathName.split('/')[1];
        setActive(currentRoute);
    }, [pathName]);

    return (
        <>
            <div className={`mobile-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

            {/* Full Navigation Drawer */}
            <div className={`mobile-drawer ${isOpen ? 'open' : ''}`}>
                <div className="drawer-header">
                    <Image 
                        src={fullLogo} 
                        alt='logo'
                        style={{ 
                            height: '36px', 
                        }} 
                        onClick={() => handleRouting('welcome')}
                    />
                    <button className="close-button-mobile-header" onClick={() => setIsOpen(false)}>
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="drawer-content">
                    {navigationItems.map((item) => (
                        <NavItem
                            key={item.id}
                            item={item}
                            isActive={active === item.id}
                            onClick={() => handleRouting(item.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="bottom-nav">
                <BottomNavItem
                    icon={TrainIcon}
                    label="Captive Rakes"
                    isActive={active === 'dashboard'}
                    onClick={() => handleRouting('dashboard')}
                />
                <BottomNavItem
                    icon={DashboardIcon}
                    label="Dashboard"
                    isActive={active === 'etaDashboard'}
                    onClick={() => handleRouting('etaDashboard')}
                />
                <BottomNavItem
                    icon={MenuIcon}
                    label="More"
                    isActive={isOpen}
                    onClick={() => setIsOpen(true)}
                />
            </div>
        </>
    );
}

export default MobileDrawer;