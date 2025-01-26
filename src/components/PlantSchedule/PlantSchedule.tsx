'use client';

import React, { useState, useEffect } from 'react';
import {
  DatePicker,
  Card,
  Badge,
  Spin,
  Tooltip,
  Typography,
  Dropdown,
  Switch,
  Modal,
  Form,
  Input,
  Button,
  Popover,
  InputNumber,
  Select,
  MenuProps,
  message
} from 'antd';
import {
  InfoCircleOutlined,
  CalendarOutlined,
  BgColorsOutlined,
  BarChartOutlined,
  SettingOutlined,
  SyncOutlined,
  UserOutlined,
  ClockCircleOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { httpsGet } from '@/utils/Communication';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ShipperSettingsModal } from './ShipperSettingsModal';
import { TargetSettingsModal } from './TargetSettingsModal';
import { CommonHeader } from '../UI/CommonHeader';
import styles from './PlantSchedule.module.css';

interface ScheduleData {
  hourGroup: number;
  timeSlot: string;
  materialsObj: { [key: string]: any };
}

type MaterialsObj = { [key: string]: number };

interface TargetResponse {
  statusCode: number;
  data: {
    shift: ScheduleData[];
    result: ScheduleData[];
    target: {
      plants: Array<{
        name: string;
        target: number;
      }>;
    };
  };
}

// Theme definitions
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

const ContentWrapper = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px; 
    @media (min-width: 768px) {
       flex-direction: column;
     }
`;


const Header = styled.div<{ theme: typeof themes[ThemeKey] }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px; 
    gap: 10px; 
    flex-wrap: wrap;
    background: rgba(13, 25, 45, 0.8);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 10px; 
    border: 1px solid rgba(255, 255, 255, 0.1);

    @media (min-width: 768px) {
        padding: 20px;
        margin-bottom: 24px;
        gap: 20px;
    }
`;

const HeaderLeft = styled.div<{ theme: typeof themes[ThemeKey] }>`
    display: flex;
    align-items: center;
    gap: 8px; 

    h2 {
        color: #fff;
        font-size: 1.2rem; 
        margin: 0;
    }

    @media (min-width: 768px) {
       gap: 16px;

    h2 {
        font-size: 1.5rem; 
      }
    }
`;

const HeaderRight = styled.div<{ theme: typeof themes[ThemeKey] }>`
  display: flex;
  align-items: center;
  gap: 8px; 
  flex-wrap: wrap; 

  .ant-typography {
    color: ${props => props.theme.textSecondary} !important;
    display: flex;
    align-items: center;
    user-select: none;
    font-size: 0.85rem; 
  }

  .ant-typography:hover,
  .ant-typography:focus {
    color: ${props => props.theme.textSecondary} !important;
  }

  .divider {
    width: 1px;
    height: 20px; 
    background: rgba(255, 255, 255, 0.1);
    margin: 0 6px; 
  }
   @media (min-width: 768px) {
      gap: 16px;

    .ant-typography {
    font-size: 1rem;
    }

     .divider {
        height: 24px;
        margin: 0 8px;
    }
  }
`;
const StyledDatePicker = styled(DatePicker) <{ theme: typeof themes[ThemeKey]; onChange: (date: Dayjs | null, dateString: string | string[]) => void }>`
  border-radius: 8px;
  background: ${props => `${props.theme.cardBg}`};
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 120px; 
  
  &:hover {
    border-color: ${props => props.theme.accent};
    background: ${props => `${props.theme.cardBg}`};
  }

  /* Override all text colors */
  &&& {
    color: ${props => props.theme.text};
    
    .ant-picker-input {
      background: transparent;
      position: relative;
      padding-right: 30px; 
      
      input {
        color: ${props => props.theme.text};
        background: transparent;
      }
      
      input::placeholder {
        color: ${props => props.theme.textSecondary};
      }
    }
  }

  /* Calendar icon */
  .ant-picker-suffix {
    color: ${props => props.theme.textSecondary};
    font-size: 14px; 
    position: absolute;
    right: 10px; 
    top: 50%;
    transform: translateY(-50%);
    z-index: 1;
    
    &:hover {
      color: ${props => props.theme.accent};
    }
  }

  /* Clear button */
  .ant-picker-clear {
    background: ${props => props.theme.cardBg};
    color: ${props => props.theme.textSecondary};
    opacity: 0.8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    position: absolute;
    right: 28px; 
    top: 50%;
    transform: translateY(-50%);
    width: 14px; 
    height: 14px;
    margin: 0;
    z-index: 2;
    
    &:hover {
      opacity: 1;
      color: ${props => props.theme.accent};
      background: ${props => props.theme.hover};
    }

    /* The X icon inside clear button */
    .anticon-close {
      font-size: 10px;
      svg {
        display: block;
      }
    }
  }

  /* Focus state */
  &.ant-picker-focused {
    border-color: ${props => props.theme.accent};
    box-shadow: 0 0 0 2px ${props => `${props.theme.accent}33`};
    background: ${props => `${props.theme.cardBg}`};
    
    .ant-picker-input {
      input {
        color: ${props => props.theme.text};
      }
    }
  }

  /* Dropdown panel */
  .ant-picker-dropdown {
    .ant-picker-panel-container {
      background: ${props => props.theme.cardBg};
      
      .ant-picker-panel {
        background: transparent;
        border: none;
        
        .ant-picker-header {
          color: ${props => props.theme.text};
          border-bottom: 1px solid ${props => props.theme.hover};
          
          button {
            color: ${props => props.theme.textSecondary};
            
            &:hover {
              color: ${props => props.theme.accent};
            }
          }
        }
        
        .ant-picker-content {
          th {
            color: ${props => props.theme.textSecondary};
          }
          
          td {
            color: ${props => props.theme.text};
            
            &:hover .ant-picker-cell-inner {
              background: ${props => props.theme.hover};
            }
            
            &.ant-picker-cell-selected .ant-picker-cell-inner {
              background: ${props => props.theme.accent};
            }
          }
        }
      }
    }
  }
    @media (min-width: 768px) {
      min-width: 150px;

         .ant-picker-suffix {
          font-size: 16px;
           right: 12px;
        }
        .ant-picker-clear {
            right: 32px;
           width: 16px;
        height: 16px;
        }
    }
`;

const StyledCard = styled(Card) <{ theme: typeof themes[ThemeKey] }>`
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); 
  background: ${props => props.theme.cardBg};
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  .ant-card-body {
    padding: 0;
  }
      @media (min-width: 768px) {
        border-radius: 16px;
       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px; 
  width: 100%;
  
  &::-webkit-scrollbar {
    height: 6px; 
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px; 
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.accent};
    border-radius: 3px; 
    
    &:hover {
      background: ${props => props.theme.hover};
    }
  }
    @media (min-width: 768px) {
        border-radius: 16px;
          &::-webkit-scrollbar {
          height: 8px;
        }

       &::-webkit-scrollbar-track {
          border-radius: 4px;
       }

         &::-webkit-scrollbar-thumb {
           border-radius: 4px;
       }
    }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: max-content;
`;

const Tr = styled.tr<{
  theme: typeof themes[ThemeKey];
  $iscurrenttime?: boolean;
  $istargetrow?: boolean
}>`
  background: ${props => `${props.theme.cardBg}`};
  border-top: 1px solid ${props => props.theme.hover}; 
  border-bottom: ${props => props.$istargetrow ? `1px solid ${props.theme.hover}` : 'none'};
  background: ${props => props.$iscurrenttime ? `${props.theme.accent}25` : 'transparent'};
  
  &:hover {
    td:not([data-total="true"]) {
      background: ${props => props.theme.hover};
    }
    
    td[data-total="true"] {
      background: ${props => `${props.theme.accent}22`};
    }
    td[data-target-total="true"] {
           background: ${props => `${props.theme.accent}22`};
    }
  }
      @media (min-width: 768px) {
          border-top: 2px solid ${props => props.theme.hover};

      }
`;

const Th = styled.th<{
  className?: string;
  theme: typeof themes[ThemeKey]
}>`
  padding: 12px 16px;
  text-align: center;
  color: ${props => props.theme.text};
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
  border-bottom: 1px solid ${props => props.theme.hover};
  background: ${props => props.theme.cardBg};

  &:not(:first-child) {
    border-left: 1px solid ${props => props.theme.hover};
  }

  &:last-child {
    border-right: none;
  }

  &:not(:first-child)::after {
    content: ' (MT)';
    display: inline-block;
    font-size: 0.85rem;
    padding-left: 4px;
    opacity: 0.85;
    @media (min-width: 768px) {
      font-size: 0.9rem;
    }
  }

  &:first-child::after {
    content: '';
    font-size: 0.7rem;
    opacity: 0.7;
  }

  @media (min-width: 768px) {
    padding: 16px 24px;
    font-size: 0.9rem;
  }

  &.total-cell {
    text-align: left;
    background: ${props => props.theme.cardBg};
  }
`;

const Td = styled.td<{
  theme: typeof themes[ThemeKey]
}>`
  padding: 6px 8px; 
  text-align: center;
  border-bottom: 1px solid ${props => props.theme.hover};
  font-size: 0.75rem; 
  color: ${props => props.theme.text};
  background: transparent;
  font-weight: 400;
  transition: all 0.2s ease;
  position: sticky;
  border-right: 1px solid ${props => props.theme.hover};
  z-index: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

  &:last-child {
    border-right: none;
  }
   &[data-total="true"] {
        font-weight: 600;
         color: ${props => props.theme.accent};
            background: ${props => `${props.theme.accent}15`};
    }
      &[data-time="true"] {
        font-weight: 500;
         color: ${props => props.theme.text};
           background: ${props => props.theme.secondary};
    }
        @media (min-width: 768px) {
              font-size: 0.9rem;
            padding: 14px 16px;

      }
`;

const Value = styled.span<{
  value: number;
  theme: typeof themes[ThemeKey]
}>`
  color: ${props => props.theme.text}; 
  font-weight: ${props => props.value > 50 ? '500' : '400'};
`;

const ProgressCell = styled.div<{ achievement: number; theme: typeof themes[ThemeKey] }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 2px;

  .main-line {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;

    .target {
      color: ${props => props.theme.textSecondary};
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 2px;
      &:before {
        content: 'T:';
      }
    }

    .actual {
      display: flex;
      align-items: center;
      gap: 2px;
      color: ${props => props.theme.text};
      &:before {
        content: 'A:';
        color: ${props => props.theme.text};
      }
    }

    .percentage {
      color: ${props => props.achievement >= 100 ? '#52c41a' : props.achievement >= 80 ? '#faad14' : '#f5222d'};
      font-size: 0.7em;
    }
  }

  .progress-track {
    width: 100%;
    height: 3px;
    background: ${props => props.theme.hover};
    border-radius: 1px;
    overflow: hidden;

    .progress-bar {
      width: ${props => Math.min(props.achievement, 100)}%;
      height: 100%;
      background: ${props =>
    props.achievement >= 100 ? '#52c41a' :
      props.achievement >= 80 ? '#faad14' : '#f5222d'
  };
      transition: width 0.3s ease;
    }
  }

  .remaining {
    font-size: 0.75em;
    color: ${props => props.theme.textSecondary};
    text-align: left;
    width: 100%;
  }

  @media (min-width: 768px) {
    gap: 4px;
    padding: 4px;
    .main-line {
      gap: 8px;
      .target {
        font-size: 0.85rem;
      }
      .actual {
        gap: 4px;
        color: ${props => props.theme.text};
      }
      .percentage {
        font-size: 0.9em;
      }
    }
    .progress-track {
      height: 4px;
      border-radius: 2px;
    }
    .remaining {
      font-size: 0.85em;
    }
  }
`;

const StatItem = styled.div<{ theme: typeof themes[ThemeKey] }>`
  background: ${props => props.theme.cardBg};
  border-radius: 8px;
  padding: 8px 10px; 
  border: 1px solid rgb(187 104 76);
  text-align: center;

  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px; 

    h3 {
      margin: 0;
      font-size: 0.8rem; 
      color: ${props => props.theme.textSecondary};
    }
  }

  .anticon {
    color: ${props => props.theme.textSecondary};
    font-size: 0.8rem;
  }

  .stat-value {
    font-size: 1.2rem; 
    margin: 0;
    color: ${props => props.theme.text};
  }

  @media (min-width: 768px) {
    padding: 12px 16px;

    .stat-header {
      margin-bottom: 8px;

      h3 {
        font-size: 1rem;
      }
    }

    .anticon {
      font-size: 1rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }
  }
`;

const StatsCard = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 8px;
  width: 100%;

  @media (max-width: 767px) {
    margin-bottom: 0;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 16px;
    width: auto;
  }
`;

const StatsCardWrapper = styled.div`
   display: flex;
    flex-direction: column;
  width: 100%;
     @media (min-width: 768px) {
          width: auto;
          flex-direction: row;
          align-items: center;
          gap: 16px;
       }
`;


const TopSection = styled.div<{ mobile?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 0 10px;
  gap: 10px;

  .stats-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-right: 1px solid #E9E9EB;
    padding-right: 10px;
    width: 100%;
  }

  .shifts-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding-left: 10px;
    width: 100%;
  }

  @media (max-width: 767px) {
    .stats-shifts-container {
      display: flex;
      flex-direction: row;
      gap: 12px;
      width: 100%;
      
      .stats-section {
        flex: 1;
        min-width: 0;
        gap: 8px;
      }
      
      .shifts-section {
        flex: 1;
        gap: 8px;
        min-width: 120px;
        padding-left: 0px;
        display: flex;
        flex-direction: column;
      }
    }
  }

  @media (min-width: 768px) {
    // flex-direction: row;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 10px;
  }
`;

const ShiftTabs = styled.div<{ theme: typeof themes[ThemeKey] }>`
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: space-evenly;
  gap: 8px;
  padding: 0;
  width: fit-content;
  overflow-x: auto;
  
  @media (max-width: 767px) {
    flex-direction: column;
    width: 100%;
    overflow-x: hidden;
    
    .tab {
      min-width: 100%;
      padding: 8px;
      
      .shift-label {
        margin-bottom: 4px;
        font-size: 0.85rem;
      }
      
      .shift-stats {
        font-size: 0.75rem;
        gap: 4px;
        
        span {
          &:not(:last-child):after {
            margin: 0 2px;
          }
        }
      }
    }
  }

  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
    border: 1px solid rgb(187 104 76);
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
    text-align: center;
    position: relative;

    &.active {
      background: ${props => props.theme.primary};
      color: #fff;
      border: 1px solid ${props => props.theme.accent};
    }

    .shift-label {
      font-weight: 600;
      margin-bottom: 2px;
      font-size: 0.9rem;
      color: ${props => props.theme.text};
      display: flex;
    }

    .shift-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .shift-stats {
      font-size: 0.7rem;
      opacity: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      white-space: nowrap;
      color: ${props => props.theme.textSecondary};

      span {
        font-weight: 500;
        &:not(:last-child):after {
          content: ' | ';
        }
      }
    }

    .stat-label {
      font-weight: 500;
      color: ${props => props.theme.textSecondary};
    }

    @media (min-width: 768px) {
      padding: 12px 16px;
      border-radius: 12px;
      min-width: 150px;

      .shift-label {
        margin-bottom: 4px;
        font-size: 1rem;
      }

      .shift-stats {
        font-size: 0.85rem;
        gap: 4px;
      }
    }
  }
`;

const DateDisplay = styled.div<{ theme: typeof themes[ThemeKey] }>`
  display: flex;
  align-items: center;
  gap: 2px;
  color: ${props => props.theme.text};
  font-size: 0.8rem;
  margin-bottom: 8px;
  justify-content: flex-end;

  .date-icon {
    color: ${props => props.theme.accent};
    font-size: 0.9rem;
  }
  
  .day {
    color: ${props => props.theme.textSecondary};
    font-size: 0.9rem;
  }

  @media (min-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 16px;
    gap: 4px;

    .date-icon {
      font-size: 1rem;
    }

    .day {
      font-size: 1rem;
    }
  }
`;

const TableContainer = styled.div`
  margin-top: 8px; 
  width: 100%;
  overflow-x: auto;
`;

const StyledRow = styled.tr<{ theme: typeof themes[ThemeKey]; isTargetRow?: boolean, $iscurrenttime?: boolean; }>`
  background: ${props => `${props.theme.cardBg}`};
  border-top: 1px solid ${props => props.theme.hover}; 
  border-bottom: ${props => props.isTargetRow ? `1px solid ${props.theme.hover}` : 'none'};
  background: ${props => props.$iscurrenttime ? `${props.theme.accent}25` : 'transparent'};
  
  &:hover {
    td:not([data-total="true"]) {
      background: ${props => props.theme.hover};
    }
    
    td[data-total="true"] {
      background: ${props => `${props.theme.accent}22`};
    }
    td[data-target-total="true"] {
           background: ${props => `${props.theme.accent}22`};
    }
  }
      @media (min-width: 768px) {
          border-top: 2px solid ${props => props.theme.hover};

      }
`;
const StyledCell = styled.td<{
  theme: typeof themes[ThemeKey];
  className?: string;
}>`
  padding: 8px !important;
  position: relative;
  
  .indicator-cell {
    display: flex;
    align-items: center;
    gap: 4px; 
  
    .ant-badge {
      .ant-badge-status-dot {
        width: 6px; 
        height: 6px; 
      }
      .ant-badge-status-text {
        color: ${props => props.theme.text};
        font-weight: 600;
        font-size: 0.75rem; 
      }
    }
  }

  .target-content {
    .value-display {
      font-weight: 600;
      color: ${props => props.theme.text};
      margin-bottom: 2px; 
      font-size: 0.85rem;
    }

    .compliance-indicator {
      font-size: 0.7em;
      padding: 2px 4px; 
      border-radius: 3px; 
  
      &.positive {
        color: #52c41a;
        background: rgba(82, 196, 26, 0.1);
      }
      
      &.negative {
        color: #ff4d4f;
        background: rgba(255, 77, 79, 0.1);
      }
    }
  }

  .remaining-value {
    color: ${props => props.theme.textSecondary};
    font-size: 0.8em;
  }
   &[data-target-total="true"] {
        font-weight: 600;
         color: ${props => props.theme.accent};
            background: ${props => `${props.theme.accent}15`};
    }
    &[data-total="true"] {
         font-weight: 600;
         color: ${props => props.theme.accent};
            background: ${props => `${props.theme.accent}15`};
    }
        @media (min-width: 768px) {
              padding: 16px !important;

             .indicator-cell {
             gap: 8px;

             .ant-badge {
               .ant-badge-status-dot {
                  width: 8px;
                  height: 8px;
                }
                .ant-badge-status-text {
                  font-size: 1rem;
                 }
              }
             }
               .target-content {
                 .value-display {
                     font-size: 1rem;
                     margin-bottom: 4px;
                }

                   .compliance-indicator {
                        font-size: 0.85em;
                         padding: 2px 6px;
                        border-radius: 4px;
                  }
                 }
                 .remaining-value {
                       font-size: 0.9em;
                  }
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

const SignalIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px; 
  
  .signal-bars {
    display: inline-flex;
    gap: 1px; 
    align-items: flex-end;
    height: 12px; 
  
    .bar {
      width: 2px; 
      background: ${props => props.theme.accent};
      border-radius: 1px;
      
      &:nth-child(1) { height: 25%; }
      &:nth-child(2) { height: 50%; }
      &:nth-child(3) { height: 75%; }
      &:nth-child(4) { height: 100%; }
    }
  }
  
  .text {
    color: ${props => props.theme.text};
    font-weight: 600;
      font-size: 0.7rem;
  }
      @media (min-width: 768px) {
          gap: 8px;

        .signal-bars {
          gap: 2px;
         height: 16px;

           .bar {
             width: 3px;

           }
        }
        .text {
          font-size: 1rem;
        }
      }
`;


const MobileCard = styled.div<{ theme: typeof themes[ThemeKey] }>`
  background: ${props => props.theme.cardBg};
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;

  .time-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    
    .clock-icon {
      color: ${props => props.theme.accent};
    }
    
    .time {
      color: ${props => props.theme.text};
      font-weight: 500;
    }
  }

  .plants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 12px;

    .plant-item {
      .plant-name {
        color: ${props => props.theme.textSecondary};
        font-size: 0.85rem;
        margin-bottom: 4px;

        &::after {
          content: ' (MT)';
          font-size: 0.7rem;
          opacity: 0.7;
        }
      }

      .plant-value {
        color: ${props => props.theme.text};
        font-weight: 500;
        font-size: 1rem;
      }
    }
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid ${props => props.theme.hover};

    .total-label {
      color: ${props => props.theme.textSecondary};
      font-size: 0.85rem;
      
      &::after {
        content: ' (MT)';
        font-size: 0.7rem;
        opacity: 0.7;
      }
    }

    .total-value {
      color: ${props => props.theme.text};
      font-weight: 500;
      font-size: 1rem;
    }
  }
`;

const MobileTargetCard = styled(MobileCard)`
  background: ${props => props.theme.cardBg};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  .target-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    .signal-icon {
      color: ${props => props.theme.accent};
    }
    
    .header-text {
      color: ${props => props.theme.text};
      font-weight: 500;
    }
  }

  .target-grid {
    display: grid;
    gap: 16px;

    .target-item {
      &.total {
        margin-top: 8px;
        padding-top: 16px;
        border-top: 1px solid ${props => props.theme.hover};

        .plant-header {
          .plant-name {
            color: ${props => props.theme.text};
            font-weight: 500;
          }
        }

        .progress-info {
          .actual {
            color: ${props => props.theme.text};
          }
        }
      }

      .plant-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        
        .plant-name {
          color: ${props => props.theme.textSecondary};
          font-size: 0.9rem;

          &::after {
            content: ' (MT)';
            font-size: 0.7rem;
            opacity: 0.7;
          }
        }
        
        .target-value {
          color: ${props => props.theme.textSecondary};
          font-size: 0.8rem;
        }
      }

      .progress-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        
        .actual {
          color: ${props => props.theme.textSecondary};
          font-size: 0.9rem;
        }
        
        .percentage {
          font-size: 0.8rem;
        }
      }

      .progress-track {
        width: 100%;
        height: 4px;
        background: ${props => props.theme.hover};
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 8px;

        .progress-bar {
          height: 100%;
          background: ${props => props.theme.accent};
          transition: width 0.3s ease;
        }
      }

      .balance {
        color: ${props => props.theme.textSecondary};
        font-size: 0.8rem;
      }
    }
  }
`;

const PlantSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([]);
  const [totalBillingData, setTotalBillingData] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('navy');
  const [activeShift, setActiveShift] = useState<'' |'all' | 'morning' | 'day' | 'night'>('');
  const [totalStats, setTotalStats] = useState({ total: 0, average: 0, peak: 0 });
  const router = useRouter();
  const [plantTargets, setPlantTargets] = useState<{ [plantName: string]: number }>({});
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isShipperSettingsVisible, setIsShipperSettingsVisible] = useState(false);
  const [isTargetSettingsVisible, setIsTargetSettingsVisible] = useState(false);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [response, setResponse] = useState<any>(null);
  const [shiftData, setShiftData] = useState<ScheduleData[]>([]);
  const [resultData, setResultData] = useState<ScheduleData[]>([]);
  const [totalStatsVisible, setTotalStatsVisible] = useState(false);

  useEffect(() => {
    const savedTheme = Cookies.get('plantScheduleTheme') as ThemeKey;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (themeKey: ThemeKey) => {
    setCurrentTheme(themeKey);
    Cookies.set('plantScheduleTheme', themeKey, { expires: 365 });
    setMobileNavOpen(false)
  };

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
  const shifts = [
    { id: 'all', name: 'All Shifts' },
    { id: 'morning', name: 'ER' },
    { id: 'day', name: 'DB' },
    { id: 'night', name: 'NC' }
  ];

  const getScheduleData = (shiftId: string) => {
    if (!scheduleData) return [];

    let filteredData = scheduleData;

    if (shiftId !== 'all' && shiftId !== '') {
      const shiftTimes = {
        'morning': { start: 6, end: 14 },
        'day': { start: 14, end: 22 },
        'night': { start: 22, end: 6 }
      };

      filteredData = scheduleData.filter(schedule => {
        const [startHourStr] = schedule.timeSlot.split(':');
        const startHour = parseInt(startHourStr, 10);

        if (shiftId === 'night') {
          return startHour >= shiftTimes.night.start || startHour < shiftTimes.night.end;
        }

        const shift = shiftTimes[shiftId as keyof typeof shiftTimes];
        if(shift){
          return startHour >= shift.start && startHour < shift.end;
        } else {
          return '';
        }
      });
    }

    // Sort the data in descending order based on time
    const resultData = filteredData.sort((a, b) => {
      const [aStartHourStr, aStartMinStr] = a.timeSlot.split(' - ')[0].split(':');
      const [bStartHourStr, bStartMinStr] = b.timeSlot.split(' - ')[0].split(':');

      const aStartHour = parseInt(aStartHourStr, 10);
      const bStartHour = parseInt(bStartHourStr, 10);
      const aStartMin = parseInt(aStartMinStr, 10);
      const bStartMin = parseInt(bStartMinStr, 10);

      // Handle night shift case where hours might be across midnight
      if (aStartHour < 6 && bStartHour >= 22) return -1;
      if (bStartHour < 6 && aStartHour >= 22) return 1;

      // Normal comparison
      if (aStartHour !== bStartHour) {
        return bStartHour - aStartHour;
      }
      return bStartMin - aStartMin;
    });
    
    console.log(resultData, "resultData");
    return resultData;
  };

  const getShiftData = (shiftId: string) => {
    if (!shiftData) return [];

    let filteredData = shiftData;

    if (shiftId !== 'all' && shiftId !== '') {
      const shiftTimes = {
        'morning': { start: 6, end: 14 },
        'day': { start: 14, end: 22 },
        'night': { start: 22, end: 6 }
      };

      filteredData = shiftData.filter(schedule => {
        const [startHourStr] = schedule.timeSlot.split(':');
        const startHour = parseInt(startHourStr, 10);

        if (shiftId === 'night') {
          return startHour >= shiftTimes.night.start || startHour < shiftTimes.night.end;
        }

        const shift = shiftTimes[shiftId as keyof typeof shiftTimes];
        return startHour >= shift.start && startHour < shift.end;
      });
    }

    // Sort the data in descending order based on time
    return filteredData.sort((a, b) => {
      const [aStartHourStr, aStartMinStr] = a.timeSlot.split(' - ')[0].split(':');
      const [bStartHourStr, bStartMinStr] = b.timeSlot.split(' - ')[0].split(':');

      const aStartHour = parseInt(aStartHourStr, 10);
      const bStartHour = parseInt(bStartHourStr, 10);
      const aStartMin = parseInt(aStartMinStr, 10);
      const bStartMin = parseInt(bStartMinStr, 10);

      // Handle night shift case where hours might be across midnight
      if (aStartHour < 6 && bStartHour >= 22) return -1;
      if (bStartHour < 6 && aStartHour >= 22) return 1;

      // Normal comparison
      if (aStartHour !== bStartHour) {
        return bStartHour - aStartHour;
      }
      return bStartMin - aStartMin;
    });
  };

  const calculateColumnTotal = (data: ScheduleData[], materialKey: string): number => {
    return data.reduce((total, schedule) => {
      const value = schedule.materialsObj[materialKey];
      return total + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const calculateRowTotal = (materialsObj: MaterialsObj): number => {
    return Object.values(materialsObj).reduce((sum, value) => {
      return sum + (typeof value === 'number' ? value : 0);
    }, 0);
  };

  const calculateGrandTotal = (data: ScheduleData[]): number => {
    return data.reduce((sum, schedule) => {
      return sum + calculateRowTotal(schedule.materialsObj);
    }, 0);
  };

  const calculateTotalBillingData = () => {
    const total = calculateGrandTotal(totalBillingData);
    const average = total / totalBillingData.length;
    const peak = Math.max(...totalBillingData.map(schedule => calculateRowTotal(schedule.materialsObj)));

    return {
      total: Number(total.toFixed(0)),
      average: Number(average.toFixed(0)),
      peak: Number(peak.toFixed(0))
    };
  };

  const calculateShiftStats = (shift: 'all' | 'morning' | 'day' | 'night') => {
    const data = getShiftData(shift);
    if (!data.length) return { total: 0, average: 0, peak: 0 };

    const total = calculateGrandTotal(data);
    const average = total / data.length;
    const peak = Math.max(...data.map(schedule => calculateRowTotal(schedule.materialsObj)));

    return {
      total: Number(total.toFixed(2)),
      average: Number(average.toFixed(2)),
      peak: Number(peak.toFixed(2))
    };
  };

  const getTargetForPlant = (plant: string) => {
    return plantTargets[plant] || 0;
  };

  const calculateAchievement = (actual: number, target: number) => {
    if (target === 0)
      return actual;
    else
      return (actual / target) * 100;
  };

  const fetchData = async (date: Dayjs) => {
    try {
      setLoading(true);
      const response = await httpsGet(`invoice/billingDashboard?date=${date.format('YYYY-MM-DD')}`, 1, router);

      if (response.statusCode === 200) {
        const targetResponse = response as TargetResponse;
        const { result, shift, target } = targetResponse.data;
        setShiftData(shift);
        setResultData(result);
        setTotalStatsVisible(true);
        setTotalBillingData(result.sort((a, b) => a.hourGroup - b.hourGroup));
        setScheduleData(shift.sort((a, b) => a.hourGroup - b.hourGroup));

        // Extract unique plant names from all materialsObj
        const uniquePlants = new Set<string>();
        result.forEach((item: ScheduleData) => {
          Object.keys(item.materialsObj).forEach(plant => uniquePlants.add(plant));
        });

        setPlants(Array.from(uniquePlants).sort());

        const targetsMap: { [plantName: string]: number } = {};
        target.plants.forEach((plant) => {
          targetsMap[plant.name] = plant.target;
        });
        setPlantTargets(targetsMap);

      } else {
        console.error('Error fetching schedule data:', response);
      }
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const totalStats = calculateTotalBillingData();
    setTotalStats(totalStats);
  }, [selectedDate, scheduleData, totalBillingData]);

  const handleDateChange = (date: Dayjs | null, dateString: string | string[]) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const [settings, setSettings] = useState({
    refreshInterval: 10
  });
  const refreshOptions = [
    { label: '10 min', value: 10 },
    { label: '20 min', value: 20 },
    { label: '30 min', value: 30 }
  ];

  const accountMenu: MenuProps = {
    items: [
      {
        key: '1',
        label: 'Settings',
        icon: <SettingOutlined />,
        children: [
          {
            key: '1-1',
            label: 'Shipper Mills',
            onClick: () => setIsShipperSettingsVisible(true),
          },
          {
            key: '1-2',
            label: 'Plant Targets',
            onClick: async () => {
              try {
                const formatDate = dayjs().format('YYYY-MM-DD');
                const response = await httpsGet(`invoice/mills_target?from=${formatDate}&isTargetMill=true`, 0, router);
                setResponse(response);
              }
              catch (error) {
                message.error('Failed to fetch mills data');
              }
              finally {
                setIsTargetSettingsVisible(true);
              }
            }
          },
        ],
      },
      {
        key: '2',
        label: 'Profile',
        icon: <UserOutlined />,
        onClick: () => {/* Handle profile click */ },
      },
      {
        key: '3',
        label: 'Sign Out',
        icon: <LogoutOutlined />,
        onClick: () => { localStorage.clear(); window.location.reload(); },
      },
    ],
  };

  const handleRefreshChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      refreshInterval: value
    }));
  };
  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const isCurrentTime = (timeSlot: string) => {
    const now = dayjs();
    const currentHour = now.hour();
    const currentMinute = now.minute();
    const [slotStartStr, slotEndStr] = timeSlot.split(' - ');
    const [slotStartHourStr, slotStartMinuteStr] = slotStartStr.split(':');
    const slotStartHour = parseInt(slotStartHourStr, 10);
    const slotStartMinute = parseInt(slotStartMinuteStr, 10);

    const [slotEndHourStr, slotEndMinuteStr] = slotEndStr.split(':');
    const slotEndHour = parseInt(slotEndHourStr, 10);
    const slotEndMinute = parseInt(slotEndMinuteStr, 10);

    const slotStartTime = dayjs().hour(slotStartHour).minute(slotStartMinute);
    const slotEndTime = dayjs().hour(slotEndHour).minute(slotEndMinute);

    if (currentHour >= slotStartHour && currentHour < slotEndHour) {
      if (currentHour === slotStartHour) {
        if (currentMinute >= slotStartMinute) {
          const currentTime = dayjs();
          return currentTime.isBefore(slotEndTime);
        }
      } else {
        const currentTime = dayjs();
        return currentTime.isBefore(slotEndTime);
      }
    }
    return false;
  };

  useEffect(() => {
    if (resultData && resultData.length > 0 && shiftData && shiftData.length > 0) {
        const uniquePlants = new Set<string>();
        const dataToUse = totalStatsVisible ? resultData : shiftData;

        dataToUse.forEach((item: ScheduleData) => {
            Object.keys(item.materialsObj).forEach(plant => uniquePlants.add(plant));
        });

        setScheduleData(dataToUse.sort((a, b) => a.hourGroup - b.hourGroup));
        setPlants(Array.from(uniquePlants).sort());
        totalStatsVisible && setActiveShift(''); 
    }
}, [totalStatsVisible]);

  if (loading) {
    return (
      <Container
        theme={themes[currentTheme]}
        style={mobile ? {
          padding: '10px 10px 74px 10px',
          marginBottom: 0
        } : {}}
      >
        <ContentWrapper>
          {mobile && (
            <div style={{
              // height: '64px',
              width: '100%'
            }} />)}
          <Header theme={themes[currentTheme]}>
            <HeaderLeft theme={themes[currentTheme]}>
              <h2>Invoicing Day / Shift Wise</h2>
            </HeaderLeft>
            <HeaderRight theme={themes[currentTheme]}>
              <Typography.Text style={{ color: themes[currentTheme].textSecondary }}>
                <CalendarOutlined style={{ marginRight: 8, fontSize: 16 }} />
                Select Date:
              </Typography.Text>
              <StyledDatePicker
                value={selectedDate}
                onChange={handleDateChange}
                format="DD-MM-YYYY"
                theme={themes[currentTheme]}
              />
            </HeaderRight>
          </Header>
          <div style={{
            padding: '40px',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px'
          }}>
            <Spin size="large" />
          </div>
        </ContentWrapper>
      </Container>
    );
  }

  return (
    <Container
      theme={themes[currentTheme]}
      style={mobile ? {
        padding: '10px 10px 74px 10px',
        marginBottom: 0
      } : {}}
    >
      <ContentWrapper>
        {mobile && (
          <div style={{
            // height: '64px',
            width: '100%'
          }} />)}
        <CommonHeader
          title="Invoicing Day / Shift Wise"
          currentTheme={currentTheme}
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          fetchData={fetchData}
          loading={loading}
          settings={settings}
          handleRefreshChange={handleRefreshChange}
          refreshOptions={refreshOptions}
          themeMenuItems={themeMenuItems}
          accountMenu={accountMenu}
          mobile={mobile}
          alwaysShowDatePicker={true}
          hideDatePickerDuringRefresh={false}
        />

        {!loading && (
          <>
            <TopSection mobile={mobile}>
              {mobile ? (
                <div className="stats-shifts-container">
                  <div className="stats-section">
                    <StatItem theme={themes[currentTheme]}>
                      <div className={styles.leftSectionContent}>
                        <DateDisplay theme={themes[currentTheme]}>
                          <CalendarOutlined style={{ fontSize: '18px' }} />
                          <span className="date">{selectedDate.format('DD MMM YYYY')} 12:00:00 AM</span>
                        </DateDisplay>
                        <span style={{ fontWeight: 600, padding: '0 4px', color: '#FFFAF0', textAlign: 'center', fontSize: '12px' }}>TO</span>
                        <DateDisplay theme={themes[currentTheme]}>
                          <CalendarOutlined style={{ fontSize: '18px' }} />
                          <span className="date">{selectedDate.format('DD MMM YYYY')} 11:59:59 PM</span>
                        </DateDisplay>
                      </div>
                    </StatItem>
                    <StatsCard>
                      <StatItem 
                        onClick={() => {
                          setTotalStatsVisible(true);
                        }}
                        theme={themes[currentTheme]}
                      >
                        <div className="stat-header">
                          <h3>Total Invoicing (Road) (MT)</h3>
                          <Tooltip title="Total materials scheduled for the selected shift">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                        <p className="stat-value">
                          {totalStats.total.toFixed(0)}
                        </p>
                      </StatItem>
                      <StatItem theme={themes[currentTheme]}>
                        <div className="stat-header">
                          <h3>Average per Slot (MT)</h3>
                          <Tooltip title="Average materials per time slot in selected shift">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                        <p className="stat-value">
                          {totalStats.average.toFixed(0)}
                        </p>
                      </StatItem>
                      <StatItem theme={themes[currentTheme]}>
                        <div className="stat-header">
                          <h3>Peak Volume (MT)</h3>
                          <Tooltip title="Highest volume in selected shift">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                        <p className="stat-value">
                          {totalStats.peak.toFixed(0)}
                        </p>
                      </StatItem>
                    </StatsCard>
                  </div>
                  <div className="shifts-section">
                    <StatsCard>
                      <StatItem theme={themes[currentTheme]}>
                        <div className={styles.leftSectionContent}>
                          <DateDisplay theme={themes[currentTheme]}>
                            <CalendarOutlined style={{ fontSize: '18px' }} />
                            <span className="date">{selectedDate.format('DD MMMM')} 06:00:00 AM</span>
                          </DateDisplay>
                          <span style={{ fontWeight: 600, padding: '0 4px', color: '#FFFAF0', textAlign: 'center', fontSize: '12px' }}>TO</span>
                          <DateDisplay theme={themes[currentTheme]}>
                            <CalendarOutlined style={{ fontSize: '18px' }} />
                            <span className="date">{selectedDate.clone().add(1, 'day').format('DD MMMM')} 05:59:59 AM</span>
                          </DateDisplay>
                        </div>
                      </StatItem>
                    </StatsCard>
                    <ShiftTabs theme={themes[currentTheme]}>
                      {shifts.map(shift => {
                        const shiftStats = calculateShiftStats(shift.id as 'all' | 'morning' | 'day' | 'night');
                        return (
                          <div
                            key={shift.id}
                            className={`tab ${activeShift === shift.id ? 'active' : ''}`}
                            onClick={() => {
                              setTotalStatsVisible(false);
                              setActiveShift(shift.id as 'all' | 'morning' | 'day' | 'night');
                            }}
                          >
                            <div className="shift-label">
                              <span className="shift-name">{shift.name}</span>

                            </div>
                            <div className="shift-stats">
                              <span > <span className="stat-label">T:</span> {shiftStats.total.toFixed(0)}</span>
                              <span > <span className="stat-label">A:</span> {shiftStats.average.toFixed(0)}</span>
                              <span > <span className="stat-label">P:</span> {shiftStats.peak.toFixed(0)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </ShiftTabs>
                  </div>
                </div>
              ) : (
                <>
                  <div className="stats-section">
                    <StatItem theme={themes[currentTheme]}>
                      <div className={styles.leftSectionContent}>
                        <DateDisplay theme={themes[currentTheme]}>
                          <CalendarOutlined style={{ fontSize: '18px' }} />
                          <span className="date">{selectedDate.format('DD MMM YYYY')} 12:00:00 AM</span>
                        </DateDisplay>
                        <span style={{ fontWeight: 600, padding: '0 4px', color: '#FFFAF0', textAlign: 'center', fontSize: '15px' }}>TO</span>
                        <DateDisplay theme={themes[currentTheme]}>
                          <CalendarOutlined style={{ fontSize: '18px' }} />
                          <span className="date">{selectedDate.format('DD MMM YYYY')} 11:59:59 PM</span>
                        </DateDisplay>
                      </div>
                    </StatItem>
                    <StatsCard>
                      <StatItem 
                        theme={themes[currentTheme]}
                        onClick={() => {
                          setTotalStatsVisible(true);
                        }}
                      >
                        <div className="stat-header">
                          <h3>Total Invoicing (Road) (MT)</h3>
                          <Tooltip title="Total materials scheduled for the selected shift">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                        <p className="stat-value">
                          {totalStats.total.toFixed(0)}
                        </p>
                      </StatItem>
                      <StatItem theme={themes[currentTheme]}>
                        <div className="stat-header">
                          <h3>Average per Slot (MT)</h3>
                          <Tooltip title="Average materials per time slot in selected shift">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                        <p className="stat-value">
                          {totalStats.average.toFixed(0)}
                        </p>
                      </StatItem>
                      <StatItem theme={themes[currentTheme]}>
                        <div className="stat-header">
                          <h3>Peak Volume (MT)</h3>
                          <Tooltip title="Highest volume in selected shift">
                            <InfoCircleOutlined />
                          </Tooltip>
                        </div>
                        <p className="stat-value">
                          {totalStats.peak.toFixed(0)}
                        </p>
                      </StatItem>
                    </StatsCard>
                  </div>
                  <div className="shifts-section">
                    <StatItem theme={themes[currentTheme]}>
                      <div className={styles.leftSectionContent}>
                        <DateDisplay theme={themes[currentTheme]}>
                          <CalendarOutlined style={{ fontSize: '18px' }} />
                          <span className="date">{selectedDate.format('DD MMM YYYY')} 06:00:00 AM</span>
                        </DateDisplay>
                        <span style={{ fontWeight: 600, padding: '0 4px', color: '#FFFAF0', textAlign: 'center', fontSize: '15px' }}>TO</span>
                        <DateDisplay theme={themes[currentTheme]}>
                          <CalendarOutlined style={{ fontSize: '18px' }} />
                          <span className="date">{selectedDate.clone().add(1, 'day').format('DD MMM YYYY')} 05:59:59 AM</span>
                        </DateDisplay>
                      </div>
                    </StatItem>
                    <ShiftTabs theme={themes[currentTheme]}>
                      {shifts.map(shift => {
                        const shiftStats = calculateShiftStats(shift.id as 'all' | 'morning' | 'day' | 'night');
                        console.log(shift.id);

                        return (
                          <div
                            key={shift.id}
                            className={`tab ${activeShift === shift.id ? 'active' : ''}`}
                            onClick={() => {
                              setTotalStatsVisible(false);
                              setActiveShift(shift.id as 'all' | 'morning' | 'day' | 'night');
                            }}
                          >
                            <div className="shift-label">
                              <span className="shift-name">{shift.name}</span>

                            </div>
                            <div className="shift-stats">
                              <span > <span className="stat-label">T:</span> {shiftStats.total.toFixed(0)}</span>
                              <span > <span className="stat-label">A:</span> {shiftStats.average.toFixed(0)}</span>
                              <span > <span className="stat-label">P:</span> {shiftStats.peak.toFixed(0)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </ShiftTabs>
                  </div>
                </>
              )}
            </TopSection>
            <TableContainer>
              {mobile ? (
                <>
                  <MobileTargetCard theme={themes[currentTheme]}>
                    <div className="target-header">
                      <BarChartOutlined className="signal-icon" />
                      <span className="header-text">Target Analysis</span>
                    </div>
                    <div className="target-grid">
                      {plants.map(plant => {
                        const columnTotal = calculateColumnTotal(getScheduleData(activeShift), plant);
                        const target = getTargetForPlant(plant);
                        const achievement = calculateAchievement(columnTotal, target);
                        const remaining = target - columnTotal;

                        return (
                          <div key={plant} className="target-item">
                            <div className="plant-header">
                              <span className="plant-name">{plant}</span>
                              <span className="target-value">Target: {target}</span>
                            </div>
                            <div className="progress-info">
                              <span className="actual">{columnTotal.toFixed(0)}</span>
                              <span className="percentage">({achievement.toFixed(0)}%)</span>
                            </div>
                            <div className="progress-track">
                              <div
                                className="progress-bar"
                                style={{ width: `${Math.min(achievement, 100)}%` }}
                              />
                            </div>
                            <div className="balance">
                              Balance qty: {remaining > 0 ? remaining.toFixed(0) : '0'}
                            </div>
                          </div>
                        );
                      })}
                      <div className="target-item total">
                        {(() => {
                          const totalTarget = plants.reduce((sum, plant) => sum + getTargetForPlant(plant), 0);
                          const totalActual = plants.reduce((sum, plant) => sum + calculateColumnTotal(getScheduleData(activeShift), plant), 0);
                          const totalAchievement = calculateAchievement(totalActual, totalTarget);
                          const totalRemaining = totalTarget - totalActual;

                          return (
                            <>
                              <div className="plant-header">
                                <span className="plant-name">Total</span>
                                <span className="target-value">Target: {totalTarget}</span>
                              </div>
                              <div className="progress-info">
                                <span className="actual">{totalActual.toFixed(0)}</span>
                                <span className="percentage">({totalAchievement.toFixed(0)}%)</span>
                              </div>
                              <div className="progress-track">
                                <div
                                  className="progress-bar"
                                  style={{ width: `${Math.min(totalAchievement, 100)}%` }}
                                />
                              </div>
                              <div className="balance">
                                Balance qty: {totalRemaining > 0 ? totalRemaining.toFixed(0) : '0'}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </MobileTargetCard>
                  {getScheduleData(activeShift).map((schedule, index) => (
                    <MobileCard key={index} theme={themes[currentTheme]}>
                      <div className="time-header">
                        <ClockCircleOutlined className="clock-icon" />
                        <span className="time">{schedule.timeSlot}</span>
                      </div>
                      <div className="plants-grid">
                        {plants.map((plant) => (
                          <div key={plant} className="plant-item">
                            <div className="plant-name">{plant}</div>
                            <div className="plant-value">
                              {(schedule.materialsObj[plant] || 0).toFixed(0)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="total-row">
                        <span className="total-label">Total</span>
                        <span className="total-value">
                          {calculateRowTotal(schedule.materialsObj).toFixed(0)}
                        </span>
                      </div>
                    </MobileCard>
                  ))}
                </>
              ) : (
                <StyledCard theme={themes[currentTheme]}>
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <Th theme={themes[currentTheme]}>Time Slot</Th>
                          {plants.map((plant) => (
                            <Th key={plant} theme={themes[currentTheme]}>{plant}</Th>
                          ))}
                          <Th className="total-cell" theme={themes[currentTheme]}>Total</Th>
                        </tr>
                      </thead>
                      <tbody>
                        <StyledRow theme={themes[currentTheme]} isTargetRow>
                          <StyledCell theme={themes[currentTheme]} className="time-cell">
                            <SignalIndicator theme={themes[currentTheme]}>
                              <div className="signal-bars">
                                <div className="bar" />
                                <div className="bar" />
                                <div className="bar" />
                                <div className="bar" />
                              </div>
                              <span className="text">Target Analysis</span>
                            </SignalIndicator>
                          </StyledCell>
                          {plants.map(plant => {
                            const columnTotal = calculateColumnTotal(getScheduleData(activeShift), plant);
                            const target = getTargetForPlant(plant);
                            const achievement = calculateAchievement(columnTotal, target);
                            const remaining = target - columnTotal;

                            return (
                              <StyledCell key={plant} theme={themes[currentTheme]}>
                                <ProgressCell theme={themes[currentTheme]} achievement={achievement}>
                                  <div className="main-line">
                                    <span className="target">{target}</span>
                                    <span className="actual">{columnTotal.toFixed(0)}</span>
                                    <span className="percentage">({achievement.toFixed(0)}%)</span>
                                  </div>
                                  <div className="progress-track">
                                    <div className="progress-bar" />
                                  </div>
                                  <div className="remaining">
                                    Balance qty: {remaining > 0 ? remaining.toFixed(0) : '0'}
                                  </div>
                                </ProgressCell>
                              </StyledCell>
                            );
                          })}
                          <StyledCell theme={themes[currentTheme]} className="total-cell">
                            {(() => {
                              const totalTarget = plants.reduce((sum, plant) => sum + getTargetForPlant(plant), 0);
                              const totalActual = plants.reduce((sum, plant) => sum + calculateColumnTotal(getScheduleData(activeShift), plant), 0);
                              const totalAchievement = calculateAchievement(totalActual, totalTarget);
                              const totalRemaining = totalTarget - totalActual;

                              return (
                                <ProgressCell theme={themes[currentTheme]} achievement={totalAchievement}>
                                  <div className="main-line">
                                    <span className="target">{totalTarget}</span>
                                    <span className="actual">{totalActual.toFixed(0)}</span>
                                    <span className="percentage">({totalAchievement.toFixed(0)}%)</span>
                                  </div>
                                  <div className="progress-track">
                                    <div className="progress-bar" />
                                  </div>
                                  <div className="remaining">
                                    Balance qty: {totalRemaining > 0 ? totalRemaining.toFixed(0) : '0'}
                                  </div>
                                </ProgressCell>
                              );
                            })()}
                          </StyledCell>
                        </StyledRow>
                        {getScheduleData(activeShift).map((schedule, index) => (
                          <Tr key={index} theme={themes[currentTheme]} $iscurrenttime={isCurrentTime(schedule.timeSlot)}>
                            <Td data-time="true" theme={themes[currentTheme]}>{schedule.timeSlot}</Td>
                            {plants.map((plant) => (
                              <Td key={plant} theme={themes[currentTheme]}>
                                <Value
                                  value={schedule.materialsObj[plant] || 0}
                                  theme={themes[currentTheme]}
                                >
                                  {(schedule.materialsObj[plant] || 0).toFixed(0)}
                                </Value>
                              </Td>
                            ))}
                            <Td data-total="true" theme={themes[currentTheme]}>
                              <Value
                                value={calculateRowTotal(schedule.materialsObj)}
                                theme={themes[currentTheme]}
                              >
                                {calculateRowTotal(schedule.materialsObj).toFixed(0)}
                              </Value>
                            </Td>
                          </Tr>
                        ))}
                        <Tr theme={themes[currentTheme]}>
                          <Td data-time="true" data-total="true" theme={themes[currentTheme]}>Total</Td>
                          {plants.map((plant) => (
                            <Td key={plant} data-total="true" theme={themes[currentTheme]}>
                              <Value
                                value={calculateColumnTotal(getScheduleData(activeShift), plant)}
                                theme={themes[currentTheme]}
                              >
                                {calculateColumnTotal(getScheduleData(activeShift), plant).toFixed(0)}
                              </Value>
                            </Td>
                          ))}
                          <Td data-total="true" theme={themes[currentTheme]}>
                            <Value
                              value={calculateGrandTotal(getScheduleData(activeShift))}
                              theme={themes[currentTheme]}
                            >
                              {calculateGrandTotal(getScheduleData(activeShift)).toFixed(0)}
                            </Value>
                          </Td>
                        </Tr>
                      </tbody>
                    </Table>
                  </TableWrapper>
                </StyledCard>
              )}
            </TableContainer>
          </>
        )}
      </ContentWrapper>
    </Container>
  );
};

export default PlantSchedule;