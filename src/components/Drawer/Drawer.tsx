'use client'

import Image from 'next/image';
import './Drawer.css'
import defaultLogo from '@/assets/logo_default_icon.svg';
import fullLogo from '@/assets/Smartruck_hover_logo.svg'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardInactive from "@/assets/Dashboard_bg_icon.svg";
import DashboardActive from "@/assets/Dashboard_wg_icon.svg";
import DispatchIcon from "@/assets/dispatch_icon.svg";
import DispatchIconActive from "@/assets/dispatch_icon_active.svg";
import BillingIcon from "@/assets/billing_icon.svg";
import BillingIconActive from "@/assets/billing_icon_active.svg";

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
        id: 'externalParking', 
        label: 'External parking',
        icon: '',
        activeIcon: DashboardActive,
        inactiveIcon: DashboardInactive,
        isImageIcon: true
    },
    {
        id: 'plantSchedule',
        label: 'Road Dispatch Dashboard',
        icon: '',
        activeIcon: DispatchIconActive,
        inactiveIcon: DispatchIcon,
        isImageIcon: true
    },
    {
        id: 'billingDashboard',
        label: 'Billing Dashboard',
        icon: '',
        activeIcon: BillingIconActive,
        inactiveIcon: BillingIcon,
        isImageIcon: true
    }
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