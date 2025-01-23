'use client'

import { motion } from 'framer-motion'
import { Train, LayoutDashboard, Package, Box, Send, Bell, MapPin, Factory } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './Welcome.css'
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import MobileHeader from "@/components/Header/mobileHeader";
import Header from "@/components/Header/header";
import { useWindowSize } from "@/utils/hooks";
import { useTranslations } from 'next-intl';
import Image from 'next/image'
import TrainFilled from '@/assets/train-fill.svg';
import { redirect } from 'next/dist/server/api-utils'
import { red } from '@mui/material/colors'
import { useRouter } from 'next/navigation'
import { useMediaQuery, useTheme } from '@mui/material';
import DashboardInactive from "@/assets/Dashboard_bg_icon.svg";
import DispatchIcon from "@/assets/dispatch_icon.svg";
import BillingIcon from "@/assets/billing_icon.svg";
import DispatchTrendInactive from "@/assets/dispatch_trend_bg_icon.svg";

const variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const items = [
  {
    icon: <Image src={DashboardInactive} alt="Dashboard" width={24} height={24} />,
    title: "External Parking Dashboard",
    description: "Simplified insights with our intuitive dashboard solutions.",
    color: "linear-gradient(135deg, #8a2be2, #9370db)",
    redirect: '/externalParking'
  },
  {
    icon: <Image src={DispatchIcon} alt="Road Invoicing" width={24} height={24} />,
    title: "Road Invoicing Dashboard",
    description: "Manage and track road invoicing with ease and precision.",
    color: "linear-gradient(135deg, #ff7f50, #ffa07a)",
    redirect: '/plantSchedule'
  },
  {
    icon: <Image src={BillingIcon} alt="Invoicing" width={24} height={24} />,
    title: "Invoicing Dashboard",
    description: "Streamline your invoicing processes.",
    color: "linear-gradient(135deg, #32cd32, #98fb98)",
    redirect: '/invoicingDashboard'
  },
  {
    icon: <Image src={DispatchTrendInactive} alt="Invoicing Trend" width={24} height={24} />,
    title: "Invoicing Trends",
    description: "Visualize and analyze invoicing trends over time.",
    color: "linear-gradient(135deg, #4682b4, #87cefa)",
    redirect: '/invoicingTrends'
  }
];

interface WelcomeProps {
  onDashboardClick?: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onDashboardClick }) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const t = useTranslations('WELCOME');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const handleRedirect = (path: string) => {
    if (path === '/dashboard') {
      router.push('/dashboard?tab=1');
    } else {
      router.push(path);
    }
  }

  const handleDashboardClick = () => {
    if (onDashboardClick) {
      onDashboardClick();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div>
      <div className='welcome-main'>
        <div
          className="welcome-landing-page"
          style={{
            marginBottom: !mobile ? '0px' : '72px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="welcome-header"
          >
            <h1 className="welcome-title">
              <Image src={TrainFilled} alt="logo" className='welcome-train-icon' />
              {t('welcome')}
            </h1>
            <p className="welcome-subtitle">
              {t('subTitle')}
            </p>
          </motion.div>

          <div className="quick-actions">
            <h2 className="welcome-section-title">
              {t('quickActions')}
            </h2>
            <motion.div
              ref={ref}
              variants={container}
              initial="hidden"
              animate={isVisible ? "show" : "hidden"}
              className="welcome-card-grid"
            >
              {items.map((item, index) => (
                <motion.div key={index} variants={{ [index]: item }} className="welcome-card" onClick={() => {
                  handleRedirect(item.redirect)
                }}>
                  <div className="welcome-card-icon" style={{ background: item.color }}>
                    {item.icon}
                  </div>
                  <h3 className="welcome-card-title">{item.title}</h3>
                  <p className="welcome-card-description">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <div className="welcome-footer">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="whats-new"
            >
              <div className="whats-new-header">
                <Bell size={20} color="#8a2be2" />
                <h2 className="whats-new-title">
                  {t('whatsNew')}
                </h2>
              </div>
              <p className="whats-new-description">
                {t('whatsNewSubtitle')}
              </p>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="support-button"
              onClick={() => {
                window.open('https://ticket.instavans.com', '_blank')
              }}
            >
              {t('support')}
            </motion.button>
          </div>
        </div>
      </div>
      {!mobile ? <SideDrawer /> : <div >
        <MobileDrawer />
      </div>}
    </div>
  )
}

export default Welcome;