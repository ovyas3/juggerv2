'use client'

import Image from 'next/image';
import './Drawer.css'
import defaultLogo from '@/assets/logo_default_icon.svg';
import fullLogo from '@/assets/Smartruck_hover_logo.svg'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ContactPageIcon from '@mui/icons-material/ContactPage';

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
    { 
        id: 'etaDashboard', 
        label: 'Dashboard',
        icon: '',
        activeIcon: DashboardActive,
        inactiveIcon: DashboardInactive,
        isImageIcon: true
    },
    { 
        id: 'orders', 
        label: 'Shipments',
        icon: '',
        activeIcon: ShipmentActive,
        inactiveIcon: ShipmentInactive,
        isImageIcon: true
    },
    { 
        id: 'dashboard', 
        label: 'Captive Rakes',
        icon: '',
        activeIcon: CaptiveRakeActive,
        inactiveIcon: CaptiveRakeInactive,
        isImageIcon: true
    },
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
    { id: 'contact', label: 'Contact Logs', icon: ContactPageIcon },
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
                    }}
                />
            ) : (
                <item.icon 
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