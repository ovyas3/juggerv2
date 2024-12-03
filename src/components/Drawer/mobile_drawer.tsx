'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import './mobile_drawer.css';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import fullLogo from '@/assets/Smartruck_hover_logo.svg';

import ShipmentInactive from "@/assets/shipments_bg_icon.svg";
import ShipmentActive from "@/assets/shipments_wg_icon.svg";
import DashboardInactive from "@/assets/Dashboard_bg_icon.svg";
import DashboardActive from "@/assets/Dashboard_wg_icon.svg";
import ReportInactive from "@/assets/reports_bg_icon.svg";
import ReportActive from "@/assets/reports_wg_icon.svg";
import SettingsInactive from "@/assets/settings_bg_icon.svg";
import SettingsActive from "@/assets/settings_wg_icon.svg";
import CaptiveRakeInactive from "@/assets/captiverakes_bg_icon.svg";
import CaptiveRakeActive from "@/assets/captiverakes_wg_icon.svg";
import InPlantDetailsInactive from "@/assets/Inplant_details_bg_icon.svg";
import InPlantDetailsActive from "@/assets/Inplant_details_wg_icon.svg";

interface NavItem {
    id: string;
    label: string;
    icon: any;
    activeIcon?: string;
    inactiveIcon?: string;
    isImageIcon?: boolean;
}

const navigationItems: NavItem[] = [
    // { 
    //     id: 'etaDashboard', 
    //     label: 'Dashboard',
    //     icon: '',
    //     activeIcon: DashboardActive,
    //     inactiveIcon: DashboardInactive,
    //     isImageIcon: true
    // },
    { 
        id: 'orders', 
        label: 'Shipments',
        icon: '',
        activeIcon: ShipmentActive,
        inactiveIcon: ShipmentInactive,
        isImageIcon: true
    },
    // { 
    //     id: 'dashboard', 
    //     label: 'Captive Rakes',
    //     icon: '',
    //     activeIcon: CaptiveRakeActive,
    //     inactiveIcon: CaptiveRakeInactive,
    //     isImageIcon: true
    // },
    { 
        id: 'inPlantDashboard', 
        label: 'In-Plant Details',
        icon: '',
        activeIcon: InPlantDetailsActive,
        inactiveIcon: InPlantDetailsInactive,
        isImageIcon: true
    },
    { 
        id: 'etaReport', 
        label: 'Reports',
        icon: '',
        activeIcon: ReportActive,
        inactiveIcon: ReportInactive,
        isImageIcon: true
    },
    { 
        id: 'settings', 
        label: 'Settings',
        icon: '',
        activeIcon: SettingsActive,
        inactiveIcon: SettingsInactive,
        isImageIcon: true
    },
    { id: 'contact', label: 'Contact Logs', icon: ContactPageIcon }
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
    item,
    isActive,
    onClick 
}: {
    item: NavItem;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button 
        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
        onClick={onClick}
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
            <item.icon className="nav-icon" />
        )}
        <span className="nav-label">{item.label}</span>
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
                    item={{
                        id: 'dashboard',
                        label: 'Captive Rakes',
                        icon: '',
                        activeIcon: CaptiveRakeActive,
                        inactiveIcon: CaptiveRakeInactive,
                        isImageIcon: true
                    }}
                    isActive={active === 'dashboard'}
                    onClick={() => handleRouting('dashboard')}
                />
                <BottomNavItem
                    item={{
                        id: 'etaDashboard',
                        label: 'Dashboard',
                        icon: '',
                        activeIcon: DashboardActive,
                        inactiveIcon: DashboardInactive,
                        isImageIcon: true
                    }}
                    isActive={active === 'etaDashboard'}
                    onClick={() => handleRouting('etaDashboard')}
                />
                <BottomNavItem
                    item={{
                        id: 'more',
                        label: 'More',
                        icon: MenuIcon,
                        isImageIcon: false
                    }}
                    isActive={isOpen}
                    onClick={() => setIsOpen(true)}
                />
            </div>
        </>
    );
}

export default MobileDrawer;