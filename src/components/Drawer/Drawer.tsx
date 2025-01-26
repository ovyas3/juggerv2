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
import DispatchTrendInactive from "@/assets/dispatch_trend_bg_icon.svg";
import DispatchTrendActive from "@/assets/dispatch_trend_wg_icon.svg";
import RightArrow from "@/assets/right_arrow_icon.svg";
import InPlantOverviewInactive from "@/assets/in_plant_overview_bg_icon.svg";
import InPlantOverviewActive from "@/assets/in_plant_overview_wg_icon.svg";
import ProductivityInactive from "@/assets/productivity_bg_icon.svg";
import ProductivityActive from "@/assets/productivity_wg_icon.svg";
import VehicleStagingLiveInactive from "@/assets/vehicle_staging_live_bg_icon.svg";
import VehicleStagingLiveActive from "@/assets/vehicle_staging_live_wg_icon.svg";
import TATDashboardInactive from "@/assets/tat_dashboard_bg_icon.svg";
import TATDashboardActive from "@/assets/tat_dashboard_wg_icon.svg";
import TATTrendsInactive from "@/assets/tat_trends_bg_icon.svg";
import TATTrendsActive from "@/assets/tat_trends_wg_icon.svg";
import EWayBillInactive from "@/assets/eway_bill_bg_icon.svg";
import EWayBillActive from "@/assets/eway_bill_wg_icon.svg";
import LeadDistanceInactive from "@/assets/lead_distance_analysis_bg_icon.svg";
import LeadDistanceActive from "@/assets/lead_distance_analysis_wg_icon.svg";
import FreightTrendsInactive from "@/assets/freight_trends_bg_icon.svg";
import FreightTrendsActive from "@/assets/freight_trends_wg_icon.svg";

interface NavItem {
    id: string;
    label: string;
    icon: any;
    activeIcon?: string;
    inactiveIcon?: string;
    isImageIcon?: boolean;
    children?: NavItem[];
}

const navigationItems: NavItem[] = [
    {
        id: 'invoicing',
        label: 'Invoicing',
        icon: '',
        activeIcon: DispatchIconActive,
        inactiveIcon: DispatchIcon,
        isImageIcon: true,
        children: [
            {
                id: 'plantSchedule',
                label: 'Invoicing Day / Shift Wise',
                icon: '',
                activeIcon: DispatchIconActive,
                inactiveIcon: DispatchIcon,
                isImageIcon: true
            },
            {
                id: 'invoicingDashboard',
                label: 'Road Invoicing & Loading Status',
                icon: '',
                activeIcon: BillingIconActive,
                inactiveIcon: BillingIcon,
                isImageIcon: true
            },
            {
                id: 'invoicingTrends',
                label: 'Trends',
                icon: '',
                activeIcon: DispatchTrendActive,
                inactiveIcon: DispatchTrendInactive,
                isImageIcon: true
            },
        ]
    {
        id: 'inPlant',
        label: 'In Plant Overview',
        icon: '',
        activeIcon: InPlantOverviewActive,
        inactiveIcon: InPlantOverviewInactive,
        isImageIcon: true,
        children: [
            {
                id: 'VehicleStagingLive',
                label: 'Vehicle Staging Live',
                icon: '',
                activeIcon: VehicleStagingLiveActive,
                inactiveIcon: VehicleStagingLiveInactive,
                isImageIcon: true
            },
            {
                id: 'TATDashboard',
                label: 'TAT Dashboard',
                icon: '',
                activeIcon: TATDashboardActive,
                inactiveIcon: TATDashboardInactive,
                isImageIcon: true
            },
            {
                id: 'TATTrends',
                label: 'TAT Trends',
                icon: '',
                activeIcon: TATTrendsActive,
                inactiveIcon: TATTrendsInactive,
                isImageIcon: true
            },
        ]
    },
    {
        id: 'Productivity',
        label: 'Productivity',
        icon: '',
        activeIcon: ProductivityActive,
        inactiveIcon: ProductivityInactive,
        isImageIcon: true
    },
    {
        id: 'externalParking',
        label: 'External parking',
        icon: '',
        activeIcon: DashboardActive,
        inactiveIcon: DashboardInactive,
        isImageIcon: true
    },
    // {
    //     id: 'ewaybillDashboard',
    //     label: 'eWaybill Dashboard',
    //     icon: '',
    //     activeIcon: EWayBillActive,
    //     inactiveIcon: EWayBillInactive,
    //     isImageIcon: true
    // },
    // {
    //     id: 'leadDistanceAnalysis',
    //     label: 'Lead (Distance) Analysis',
    //     icon: '',
    //     activeIcon: LeadDistanceActive,
    //     inactiveIcon: LeadDistanceInactive,
    //     isImageIcon: true
    // },
    // {
    //     id: 'freightTrends',
    //     label: 'Freight Trends Dashboard',
    //     icon: '',
    //     activeIcon: FreightTrendsActive,
    //     inactiveIcon: FreightTrendsInactive,
    //     isImageIcon: true
    // }
];

const NavItem = ({ 
    item, 
    isActive, 
    isHovered, 
    isOpen, 
    onClick, 
    onMouseEnter, 
    onMouseLeave,
    active, 
    handleRouting, 
    setHoveredId, 
    hoveredId 
}: {
    item: NavItem;
    isActive: boolean;
    isHovered: boolean;
    isOpen: boolean;
    onClick: () => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    active: string;
    handleRouting: (route: string) => void;
    setHoveredId: (id: string | null) => void;
    hoveredId: string | null;
}) => {
    const isHighlighted = isActive || isHovered;
    const [showChildren, setShowChildren] = useState(false);
    const [isNestedHovered, setIsNestedHovered] = useState(false);

    const handleMouseEnter = () => {
        setShowChildren(true);
        onMouseEnter();
    };

    const handleMouseLeave = () => {
        setShowChildren(false);
        onMouseLeave();
    };

    const isNestedActive = item.children?.some(child => active === child.id);

    const handleClick = () => {
        if (!item.children) {
            onClick();
        }
    };

    return (
        <div
            style={{ position: 'relative' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                onClick={handleClick}
                className='station-code'
                style={{
                    width: isOpen ? '190px' : '42px',
                    justifyContent: isOpen ? 'start' : 'center',
                    backgroundColor: isHighlighted || isNestedHovered || isNestedActive ? 'white' : '',
                    cursor: 'pointer'
                }}
            >
                {item.isImageIcon ? (
                    <Image
                        src={isHighlighted || isNestedHovered || isNestedActive ? item.activeIcon! : item.inactiveIcon!}
                        alt={item.label}
                        style={{
                            marginLeft: isOpen ? '10px' : '2px',
                        }}
                        width={24}
                        height={24}
                    />
                ) : (
                    <item.icon 
                        style={{ 
                            marginLeft: isOpen ? '9px' : '', 
                            color: isHighlighted || isNestedHovered || isNestedActive ? 'black' : 'white' 
                        }}
                    />
                )}
                <div
                    className={`${isOpen ? 'fnr_text' : 'fnr_text_none'}`}
                    style={{ color: isHighlighted || isNestedHovered || isNestedActive ? 'black' : 'white' }}
                >
                    {item.label}
                </div>
                {item.children && isOpen && (
                    <Image
                        src={RightArrow}
                        alt="right-arrow"
                        style={{
                            marginLeft: 'auto',
                            marginRight: '10px',
                            filter: isHighlighted || isNestedHovered || isNestedActive ? 'brightness(0)' : 'brightness(1)',
                            transition: 'filter 0.2s ease-in'
                        }}
                        width={16}
                        height={16}
                    />
                )}
            </div>
            {showChildren && item.children && (
                <div 
                    className="submenu"
                    style={{ top: '-10px' }}
                >
                    {item.children.map((child) => (
                        <div
                            key={child.id}
                            onClick={() => handleRouting(child.id)}
                            className="submenu-option"
                            style={{
                                backgroundColor: active === child.id || hoveredId === child.id ? 'white' : 'transparent',
                                color: active === child.id || hoveredId === child.id ? 'black' : 'white',
                            }}
                            onMouseEnter={() => {
                                setHoveredId(child.id);
                                setIsNestedHovered(true);
                            }}
                            onMouseLeave={() => {
                                setHoveredId(null);
                                setIsNestedHovered(false);
                            }}
                        >
                            {child.isImageIcon ? (
                                <Image
                                    src={ active === child.id || hoveredId === child.id ?  child.activeIcon! : child.inactiveIcon!}
                                    alt={child.label}
                                    style={{
                                        marginLeft: isOpen ? '10px' : '2px',
                                    }}
                                    width={24}
                                    height={24}
                                />
                            ) : (
                                <child.icon
                                    style={{
                                        marginLeft: isOpen ? '9px' : '',
                                        color: active === child.id || hoveredId === child.id  ? 'black' : 'white'
                                    }}
                                />
                            )}
                            {child.label}
                        </div>
                    ))}
                </div>
            )}
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
        router.push(`/${route}`);
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
            <div className='logo-container'>
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
                    active={active}
                    handleRouting={handleRouting}
                    setHoveredId={setHoveredId}
                    hoveredId={hoveredId}
                />
            ))}
        </div>
    );
}

export default SideDrawer;