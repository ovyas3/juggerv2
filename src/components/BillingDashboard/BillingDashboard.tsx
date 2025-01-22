'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dayjs, { Dayjs } from 'dayjs';
import { MenuProps } from 'antd';
import { 
  ProfileOutlined, 
  SettingOutlined, 
  LogoutOutlined 
} from '@ant-design/icons';

import { CommonHeader } from '../UI/CommonHeader';

import { BillingStatusTable } from './BillingStatusTable';

import { httpsGet } from '@/utils/Communication';
import styled from 'styled-components';

const themes = {
  navy: {
    name: 'Navy',
    primary: '#001529',
    secondary: '#003a75',
    text: '#e6f7ff',
    textSecondary: '#8bb4f7',
    accent: '#1890ff',
    background: 'linear-gradient(135deg, #001529 0%, #003a75 100%)',
    cardBg: 'rgba(13, 25, 45, 0.8)',
    hover: 'rgba(255, 99, 71, 0.1)',
  },
  purple: {
    name: 'Purple',
    primary: '#17054B',
    secondary: '#4A1D96',
    text: '#EDE9FE',
    textSecondary: '#A78BFA',
    accent: '#7C3AED',
    background: 'linear-gradient(135deg, #17054B 0%, #4A1D96 100%)',
    cardBg: 'rgba(30, 12, 75, 0.8)',
    hover: 'rgba(255, 215, 0, 0.1)',
  },
  saffron: {
    name: 'Saffron',
    primary: '#8B2801',
    secondary: '#B33D00',
    text: '#FFF8F0',
    textSecondary: '#FFB067',
    accent: '#FF7A1F',
    background: 'linear-gradient(135deg, #8B2801 0%, #CC4400 100%)',
    cardBg: 'rgba(139, 40, 1, 0.85)',
    hover: 'rgba(0, 128, 128, 0.15)',
  },
  ocean: {
    name: 'Ocean',
    primary: '#0A4D68',
    secondary: '#088395',
    text: '#E6FFFD',
    textSecondary: '#89E7E3',
    accent: '#05BFDB',
    background: 'linear-gradient(135deg, #0A4D68 0%, #088395 100%)',
    cardBg: 'rgba(10, 77, 104, 0.85)',
    hover: 'rgba(255, 69, 0, 0.15)',
  },
  mint: {
    name: 'Mint',
    primary: '#CCFFCC',
    secondary: '#99FF99',
    text: '#006600',
    textSecondary: '#009900',
    accent: '#00CC00',
    background: 'linear-gradient(135deg, #CCFFCC 0%, #99FF99 100%)',
    cardBg: 'rgba(204, 255, 204, 0.85)',
    hover: 'rgba(128, 0, 128, 0.15)',
  },
  sky: {
    name: 'Sky',
    primary: '#CCFFFF',
    secondary: '#99FFFF',
    text: '#006666',
    textSecondary: '#009999',
    accent: '#00CCCC',
    background: 'linear-gradient(135deg, #CCFFFF 0%, #99FFFF 100%)',
    cardBg: 'rgba(204, 255, 255, 0.85)',
    hover: 'rgba(255, 0, 0, 0.15)',
  },
  light: {
    name: 'Light',
    primary: '#f0f2f5',
    secondary: '#e8e9ec',
    text: '#333333',
    textSecondary: '#777777',
    accent: '#1890ff',
    background: 'linear-gradient(135deg, #f0f2f5 0%, #e8e9ec 100%)',
    cardBg: 'rgba(255, 255, 255, 0.8)',
    hover: 'rgba(0, 128, 0, 0.15)',
  },
  white: {
    name: 'White',
    primary: '#ffffff',
    secondary: '#f0f0f0',
    text: '#262626',
    textSecondary: '#595959',
    accent: '#40a9ff',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    hover: 'rgba(64, 169, 255, 0.1)',
  },
  cream: {
    name: 'Cream',
    primary: '#FFFDD0',
    secondary: '#F5F5DC',
    text: '#4A4A4A',
    textSecondary: '#8A8A8A',
    accent: '#FFD700',
    background: 'linear-gradient(135deg, #FFFDD0 0%, #F5F5DC 100%)',
    cardBg: 'rgba(255, 253, 208, 0.85)',
    hover: 'rgba(255, 215, 0, 0.15)',
  },
  warmTerra: {
    name: 'Warm Terra',
    primary: '#FFF0E0',
    secondary: '#FFE5D0',
    text: '#5A4A4A',
    textSecondary: '#7A6A6A',
    accent: '#FF8C40',
    background: 'linear-gradient(135deg, #FFF0E0 0%, #FFE5D0 100%)',
    cardBg: 'rgba(255, 240, 224, 0.85)',
    hover: 'rgba(255, 140, 64, 0.15)',
  },
  paleBlue: {
    name: 'Pale Blue',
    primary: '#E6F7FF',
    secondary: '#B3E5FC',
    text: '#212121',
    textSecondary: '#616161',
    accent: '#1890FF',
    background: 'linear-gradient(135deg, #E6F7FF 0%, #B3E5FC 100%)',
    cardBg: 'rgba(230, 247, 255, 0.85)',
    hover: 'rgba(24, 144, 255, 0.15)',
  }
};

type ThemeKey = keyof typeof themes;

const Container = styled.div<{ theme: typeof themes[ThemeKey] }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 16px; 
  background: ${props => props.theme.primary};
  background-image: ${props => props.theme.background};
  overflow-y: auto;
  z-index: 1;

  @media (min-width: 768px) {
    padding: 24px 24px 24px 94px;
  }
`;

const ThemeOption = styled.div<{ color: string }>`
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  
  &:before {
    content: '';
    width: 14px; 
    height: 14px; 
    border-radius: 3px; 
    background: ${props => props.color};
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
      @media (min-width: 768px) {
           padding: 8px 16px;
            gap: 8px;
            font-size: 1rem;
           &:before {
              width: 16px;
            height: 16px;
                border-radius: 4px;
           }
      }
`;

interface BillingDashboardProps {
  mobile?: boolean;
  hideHeader?: boolean
  hideTable?: boolean;
}

const BillingDashboard: React.FC<BillingDashboardProps> = ({ mobile = false, hideHeader = false, hideTable = false  }) => {
  const router = useRouter();

  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('navy');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    refreshInterval: 5
  });

  const fetchData = async (date: Dayjs) => {
    try {
      setLoading(true);
      const response = await httpsGet(
        `invoice/billingDashboard?date=${date.format('YYYY-MM-DD')}`, 
        1, 
        router
      );
      
      if (response && response.data) {
        setBillingData(response.data);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Dayjs | null, dateString: string | string[]) => {
    if (date) {
      setSelectedDate(date);
      fetchData(date);
    }
  };

  const handleRefreshChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      refreshInterval: value
    }));
  };

  const handleThemeChange = (theme: ThemeKey) => {
    setCurrentTheme(theme);
  };

  const refreshOptions = [
    { value: 5, label: '5 sec' },
    { value: 10, label: '10 sec' },
    { value: 30, label: '30 sec' }
  ];

  const themeMenuItems = {
    items: Object.entries(themes).map(([key, theme]) => ({
      key,
      label: (
        <ThemeOption color={theme.primary}>
          {theme.name}
        </ThemeOption>
      ),
      onClick: () => handleThemeChange(key as ThemeKey)
    }))
  };

  // Account menu items
  const accountMenu: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div onClick={() => {/* handle profile action */}}>
          <ProfileOutlined /> Profile
        </div>
      ),
    },
    {
      key: 'settings',
      label: (
        <div onClick={() => {/* handle settings action */}}>
          <SettingOutlined /> Settings
        </div>
      ),
    },
    {
      key: 'logout',
      label: (
        <div onClick={() => {
          localStorage.clear();
          window.location.reload();
        }}>
          <LogoutOutlined /> Logout
        </div>
      ),
    }
  ];

  // useEffect(() => {
  //   fetchData(selectedDate);
  // }, []);

  return (
    <Container theme={themes[currentTheme]}>
      {!hideHeader && (
        <CommonHeader
          title="Road Billing & Loading Status"
          currentTheme={currentTheme}
          // selectedDate={selectedDate}
          // handleDateChange={handleDateChange}
          loading={loading}
          settings={settings}
          // handleRefreshChange={handleRefreshChange}
          // refreshOptions={refreshOptions}
          themeMenuItems={themeMenuItems}
          mobile={mobile}
          alwaysShowDatePicker={false}
          hideDatePickerDuringRefresh={true}
        />
      )}
      
      {!hideTable && (
        <BillingStatusTable
          key={currentTheme}
          currentTheme={themes[currentTheme]}
        />
      )}
    </Container>
  );
};

export default BillingDashboard;