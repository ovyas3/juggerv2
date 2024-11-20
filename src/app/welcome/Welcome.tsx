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
import {useTranslations} from 'next-intl';
import Image from 'next/image'
import TrainFilled from '@/assets/train-fill.svg';
import { redirect } from 'next/dist/server/api-utils'
import { red } from '@mui/material/colors'
import { useRouter } from 'next/navigation'

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
    icon: <LayoutDashboard size={24} color="white" />,
    title: "Dashboard",
    description: "Simplified insights with our intuitive dashboard solutions.",
    color: "linear-gradient(135deg, #8a2be2, #9370db)",
    redirect: '/etaDashboard'
  },
  {
    icon: <Package size={24} color="white"/>,
    title: "Shipments",
    description: "Effortless shipment tracking and management at your fingertips.",
    color: "linear-gradient(135deg, #4169e1, #1e90ff)",
    redirect: '/orders'
  },
  {
    icon: <Train size={24} color="white"/>,
    title: "Captive Rakes",
    description: "Map view and rail overview for efficient tracking.",
    color: "linear-gradient(135deg, #32cd32, #90ee90)",
    redirect: '/dashboard'
  },
  {
    icon: <MapPin size={24} color="white"/>,
    title: "Station Management",
    description: "Efficient control and monitoring of station operations.",
    color: "linear-gradient(135deg, #ffd700, #ffa500)",
    redirect: '/stationManagement'
  },
  {
    icon: <Factory size={24} color="white"/>,
    title: "In-Plant Dashboard",
    description: "Streamline plant operations with real-time insights.",
    color: "linear-gradient(135deg, #dc143c, #ff4500)",
    redirect: '/inPlantDashboard'
},
];

const Welcome = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  const mobile = useWindowSize(600);
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
    console.log('path', path);
    router.push(path);
  }

  return (
    <div>
      <div className='welcome-main'>
        <div className="welcome-landing-page">
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
      {mobile ? <SideDrawer /> : <div className="bottom_bar">
        <MobileDrawer />
      </div>}
    </div>
  )
}

export default Welcome;