"use client"

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import './mobile_drawer.css';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import fullLogo from '@/assets/Smartruck_hover_logo.svg';

import DashboardInactive from "@/assets/Dashboard_bg_icon.svg";
import DashboardActive from "@/assets/Dashboard_wg_icon.svg";
import DispatchIcon from "@/assets/dispatch_icon.svg";
import DispatchIconActive from "@/assets/dispatch_icon_active.svg";
import BillingIcon from "@/assets/billing_icon.svg";
import BillingIconActive from "@/assets/billing_icon_active.svg";
import EWayBillInactive from "@/assets/eway_bill_bg_icon.svg";
import EWayBillActive from "@/assets/eway_bill_wg_icon.svg";
import welcomeIcon from "@/assets/welcome-svg-icon.svg";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import DispatchTrendInactive from "@/assets/dispatch_trend_bg_icon.svg";
import DispatchTrendActive from "@/assets/dispatch_trend_wg_icon.svg";
import LeadDistanceInactive from "@/assets/lead_distance_analysis_bg_icon.svg";
import LeadDistanceActive from "@/assets/lead_distance_analysis_wg_icon.svg";
import FreightTrendsInactive from "@/assets/freight_trends_bg_icon.svg";
import FreightTrendsActive from "@/assets/freight_trends_wg_icon.svg";

import { deleteAllCache } from "@/utils/storageService";
import { environment } from "@/environments/env.api";

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
        id: 'invoicingTrends',
        label: 'Trends',
        icon: '',
        activeIcon: DispatchTrendActive,
        inactiveIcon: DispatchTrendInactive,
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
    //     label: 'Freight Trends',
    //     icon: '',
    //     activeIcon: FreightTrendsActive,
    //     inactiveIcon: FreightTrendsInactive,
    //     isImageIcon: true
    // }
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
    onClick,
}: {
    item: any;
    isActive: boolean;
    onClick: () => void;
}) => (
    <button
        className={`bottom-nav-item ${isActive ? "active" : ""}`}
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

    const handleLogout = () => {
        console.log("logout");
        const fromRms = Boolean(localStorage.getItem("isRmsLogin"));
        deleteAllCache();
        if (fromRms) {
            router.push("/signin");
        } else {
            const isDev = process.env.NODE_ENV === "development";
            router.push(isDev ? environment.DEV_ETMS : environment.PROD_SMART);
        }
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
                    <button className="drawer-item" onClick={() => handleLogout()}>
                        <LogoutIcon className="nav-icon" />
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="bottom-nav">
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                >
                    <BottomNavItem
                        item={{
                            id: "externalParking",
                            icon: "",
                            activeIcon: DashboardActive,
                            inactiveIcon: DashboardInactive,
                            isImageIcon: true,
                        }}
                        isActive={active === "externalParking"}
                        onClick={() => handleRouting("externalParking")}
                    />
                </div>

                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                >
                    <BottomNavItem
                        item={{
                            id: "plantSchedule",
                            icon: "",
                            activeIcon: DispatchIconActive,
                            inactiveIcon: DispatchIcon,
                            isImageIcon: true,
                        }}
                        isActive={active === "plantSchedule"}
                        onClick={() => handleRouting("plantSchedule")}
                    />
                </div>

                <div
                    className={`home-btn-drawer ${active === "welcome" ? "home-btn-active" : ""}`}
                    onClick={() => handleRouting("welcome")}
                >
                    {active === "welcome" ? (
                        <HomeIcon sx={{ color: "#20114d" }} />
                    ) : (
                        <HomeIcon sx={{ color: "#fff" }} />
                    )}
                </div>

                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                    }}
                >
                    <BottomNavItem
                        item={{
                            id: "invoicingDashboard",
                            icon: "",
                            activeIcon: BillingIconActive,
                            inactiveIcon: BillingIcon,
                            isImageIcon: true,
                        }}
                        isActive={active === "invoicingDashboard"}
                        onClick={() => handleRouting("invoicingDashboard")}
                    />
                </div>

                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        padding: "8px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        margin: "0 10px",
                    }}
                    onClick={() => setIsOpen(true)}
                >
                    <Image
                        src={welcomeIcon}
                        alt="logo"
                        style={{
                            height: "24px",
                        }}
                    />
                </div>
            </div>
        </>
    );
}

export default MobileDrawer;