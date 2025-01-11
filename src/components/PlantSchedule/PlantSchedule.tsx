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
  MenuProps
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
  padding: 16px; /* Reduced padding */
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
  gap: 10px; /* Reduced gap */
    @media (min-width: 768px) {
       flex-direction: column;
     }
`;


const Header = styled.div<{ theme: typeof themes[ThemeKey] }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px; /* Reduced margin */
    gap: 10px; /* Reduced gap */
    flex-wrap: wrap;
    background: rgba(13, 25, 45, 0.8);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 10px; /* Reduced padding */
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
    gap: 8px; /* Reduced gap */

    h2 {
        color: #fff;
        font-size: 1.2rem; /* Reduced font size */
        margin: 0;
    }

    @media (min-width: 768px) {
       gap: 16px;

    h2 {
        font-size: 1.5rem; /* Normal font size on larger screens */
      }
    }
`;

const HeaderRight = styled.div<{ theme: typeof themes[ThemeKey] }>`
  display: flex;
  align-items: center;
  gap: 8px; /* Reduced gap */
  flex-wrap: wrap; /* Allow wrapping on smaller screens */

  .ant-typography {
    color: ${props => props.theme.textSecondary} !important;
    display: flex;
    align-items: center;
    user-select: none;
    font-size: 0.85rem; /* Reduced font size */
  }

  .ant-typography:hover,
  .ant-typography:focus {
    color: ${props => props.theme.textSecondary} !important;
  }

  .divider {
    width: 1px;
    height: 20px; /* Reduced height */
    background: rgba(255, 255, 255, 0.1);
    margin: 0 6px; /* Reduced margin */
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
const MobileNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  
    @media (min-width: 768px) {
      display: none;
  }
`;
const NavPopover = styled.div<{ theme: typeof themes[ThemeKey] }>`
    background: ${props => props.theme.cardBg};
    border-radius: 8px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 200px;
    border: 1px solid rgba(255, 255, 255, 0.1);

        .nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 6px;
     color: ${props => props.theme.text};
    cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
         background: ${props => props.theme.hover};
          color: ${props => props.theme.accent};
        }

      .anticon {
            font-size: 16px;
        }
}
`;
// const Title = styled.h1<{ theme: typeof themes[ThemeKey] }>`
//   font-size: 1.2rem; /* Reduced font size */
//   color: ${props => props.theme.text};
//   margin: 0;
//   display: flex;
//   align-items: center;
//   gap: 8px; /* Reduced gap */

//   .anticon {
//     color: ${props => props.theme.textSecondary};
//     font-size: 1rem; /* Reduced font size */
//   }
//     @media (min-width: 768px) {
//         font-size: 1.5rem;
//         gap: 12px;

//         .anticon {
//             font-size: 20px;
//         }
//     }
// `;

const StyledDatePicker = styled(DatePicker) <{ theme: typeof themes[ThemeKey]; onChange: (date: Dayjs | null, dateString: string | string[]) => void }>`
  border-radius: 8px;
  background: ${props => `${props.theme.cardBg}`};
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 120px; /* Reduced min-width */
  
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
      padding-right: 30px; /* Make room for both icons */
      
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
    font-size: 14px; /* Reduced icon size */
    position: absolute;
    right: 10px; /* Adjusted position */
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
    right: 28px; /* Position it before the calendar icon */
    top: 50%;
    transform: translateY(-50%);
    width: 14px; /* Reduced button size */
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); /* Reduced shadow */
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
  border-radius: 12px; /* Reduced radius */
  width: 100%;
  
  &::-webkit-scrollbar {
    height: 6px; /* Reduced scrollbar height */
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px; /* Reduced radius */
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.accent};
    border-radius: 3px; /* Reduced radius */
    
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
  border-top: 1px solid ${props => props.theme.hover}; /* Reduced border size */
  border-bottom: ${props => props.$istargetrow ? `1px solid ${props.theme.hover}` : 'none'};
  background: ${props => props.$iscurrenttime ? `${props.theme.accent}25` : 'transparent'};
  
  &:hover {
    td:not([data-total="true"]) {
      background: ${props => props.theme.hover};
    }
    
    td[data-total="true"] {
      background: ${props => `${props.theme.accent}22`};
    }
  }
      @media (min-width: 768px) {
          border-top: 2px solid ${props => props.theme.hover};

      }
`;

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

const Th = styled.th<{
  className?: string;
  theme: typeof themes[ThemeKey]
}>`
        padding: 8px; /* Reduced padding */
        text-align: center;
        font-weight: 600;
        color: ${props => props.theme.text};
        background: ${props => {
    if (props.className === 'total-cell') return `${props.theme.accent}22`;
    return props.theme.cardBg;
  }};
        border-bottom: 1px solid ${props => props.theme.hover};
        white-space: nowrap;
        position: sticky;
        border-right: 1px solid ${props => props.theme.hover};
        z-index: 1;
          font-size: 0.85rem; /* Reduced font size */
  
  
      &.total-cell {
          color: ${props => props.theme.accent};
      }
          &:first-child {
          border-top-left-radius: 12px; /* Reduced radius */
      }
  
      &:last-child {
          border-top-right-radius: 12px; /* Reduced radius */
          border-right: none;
      }
          &::after{
               content: ' (MT)';
               display: inline-block;
                font-size: 0.7rem;
                opacity: 0.7;
                  @media (min-width: 768px) {
                        font-size: 0.8rem;
                    }
          }
          @media (min-width: 768px) {
           padding: 16px;
            font-size: 1rem;
          &:first-child {
              border-top-left-radius: 16px;
            }
  
            &:last-child {
                border-top-right-radius: 16px;
            }
             &::after{
                      font-size: 0.8rem;
             }
        }
  `;

const Td = styled.td<{
  theme: typeof themes[ThemeKey]
}>`
  padding: 6px 8px; /* Reduced padding */
  text-align: center;
  border-bottom: 1px solid ${props => props.theme.hover};
  font-size: 0.75rem; /* Reduced font size */
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
  color: ${props => props.theme.text}; /*  Set the text color from theme*/
  font-weight: ${props => props.value > 50 ? '500' : '400'};
`;

const StatsCard = styled.div`
  display: grid;
  grid-template-columns: 1fr; /* Single column on mobile */
  gap: 8px; /* Reduced gap */
  margin-bottom: 8px; /* Reduced margin */
  width: 100%;
     @media (max-width: 767px) {
         margin-bottom: 0;
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


const StatItem = styled.div<{ theme: typeof themes[ThemeKey] }>`
  background: ${props => props.theme.cardBg};
  border-radius: 8px;
  padding: 8px 10px; /* Reduced padding */
  border: 1px solid rgb(187 104 76);
    text-align: center;

  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px; /* Reduced margin */

    h3 {
      margin: 0;
      font-size: 0.8rem; /* Reduced font size */
      color: ${props => props.theme.textSecondary};
    }
  }
       .stat-header h3::after{
             content: ' (MT)';
             display: inline-block;
              font-size: 0.7rem;
              opacity: 0.7;
                @media (min-width: 768px) {
                      font-size: 0.8rem;
                  }
        }

  .stat-value {
    font-size: 1.2rem; /* Reduced font size */
    margin: 0;
    color: ${props => props.theme.text};
  }
    @media (min-width: 768px) {
          padding: 12px 16px;

        .stat-header {
         margin-bottom: 8px;
        h3 {
           font-size: 0.9rem;
        }
        }

       .stat-value {
            font-size: 1.5rem;
         }
    }
`;

// const RefreshSettings = styled.div<{ theme: typeof themes[ThemeKey] }>`
//   display: flex;
//   align-items: center;
//   gap: 8px; /* Reduced gap */
//   margin-bottom: 8px; /* Reduced margin */
//   padding: 8px 10px; /* Reduced padding */
//   background: ${props => props.theme.cardBg};
//   border-radius: 8px;
//   border: 1px solid rgba(255, 255, 255, 0.1);
//   width: 100%;
//   flex-wrap: wrap; /* Allow wrapping on smaller screens */

//   .refresh-title {
//     display: flex;
//     align-items: center;
//     gap: 4px; /* Reduced gap */
//     color: ${props => props.theme.textSecondary};
//     font-size: 0.8rem; /* Reduced font size */
//     white-space: nowrap;

//     .anticon {
//       font-size: 14px; /* Reduced icon size */
//     }
//   }

//   .refresh-controls {
//     display: flex;
//     align-items: center;
//     gap: 6px; /* Reduced gap */
//     flex-wrap: wrap;
//     flex: 1;

//     .interval-options {
//       display: flex;
//       gap: 4px; /* Reduced gap */
//       flex-wrap: wrap;
//     }

//     .interval-option {
//       padding: 3px 10px; /* Reduced padding */
//       border-radius: 12px; /* Reduced radius */
//       font-size: 0.75rem; /* Reduced font size */
//       background: ${props => props.theme.primary};
//       border: 1px solid rgba(255, 255, 255, 0.2);
//       color: ${props => props.theme.text};
//       cursor: pointer;
//       transition: all 0.2s ease;
//       white-space: nowrap;

//       &:hover {
//         background: ${props => props.theme.hover};
//         border-color: ${props => props.theme.accent};
//       }

//       &.active {
//         background: ${props => props.theme.accent};
//         border-color: ${props => props.theme.accent};
//         color: #fff;
//       }
//     }
//   }
//     @media (min-width: 768px) {
//         padding: 12px 16px;
//          gap: 16px;
//         .refresh-title {
//               gap: 8px;
//               font-size: 0.9rem;
//            .anticon {
//               font-size: 16px;
//            }
//          }
//       .refresh-controls {
//             gap: 12px;
//         .interval-options {
//             gap: 8px;
//         }
//        .interval-option {
//            padding: 4px 12px;
//            border-radius: 16px;
//           font-size: 0.85rem;
//         }
//     }
//   }
// `;

const TopSection = styled.div`
  display: flex;
  flex-direction: column; /* Stack elements on mobile */
  align-items: flex-start; /* Align to the start on mobile */
  margin-bottom: 8px;
  padding: 0 10px;
  gap: 10px;


  @media (min-width: 768px) {
    flex-direction: row; /* Restore row layout on larger screens */
    align-items: center; /* Align items to center on larger screens */
    margin-bottom: 16px;
    gap: 10px;

  }
`;


const DateDisplay = styled.div<{ theme: typeof themes[ThemeKey] }>`
  display: flex;
  align-items: center;
  gap: 2px; /* Reduced gap */
  color: ${props => props.theme.text};
  font-size: 0.8rem; /* Reduced font size */
    margin-bottom: 8px; /* Reduced margin */
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

const ShiftTabs = styled.div<{ theme: typeof themes[ThemeKey] }>`
  display: flex;
  flex-direction: row;
  gap: 8px; /* Reduced gap */
  padding: 0;
  width: fit-content;
  overflow-x: auto;
  
      &::-webkit-scrollbar {
        height: 4px;
    }
  
      &::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
    }
  
      &::-webkit-scrollbar-thumb {
          background: ${props => props.theme.accent};
          border-radius: 4px;
            &:hover {
                background: ${props => props.theme.hover};
            }
      }
        @media (min-width: 768px) {
          flex-direction: row;
            gap: 12px;
             &::-webkit-scrollbar {
                height: 0;
            }
        }
  
  .tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 10px; /* Reduced padding */
    border-radius: 10px; /* Reduced radius */
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px; /* Reduced min-width */
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
      margin-bottom: 2px; /* Reduced margin */
      font-size: 0.9rem; /* Reduced font size */
      color: ${props => props.theme.text};
      display: flex;
        /*  justify-content: space-between; Removed This */
    }
       .shift-name {
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
         flex: 1;
    }

    .shift-stats {
      font-size: 0.7rem; /* Reduced font size */
      opacity: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px; /* Reduced gap */
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
        .shift-time {
          font-size: 0.65rem; /* Reduced font size */
          opacity: 0.6;
          white-space: nowrap;
          color: ${props => props.theme.textSecondary};
          position: absolute;
          top: 1px;
          right: 8px;
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
                .shift-time {
                    font-size: 0.75rem;
                    }
            }
  }
      @media (max-width: 767px) {
           flex-direction: column;
             overflow-x: hidden;
             width: 100%;
           .tab {
              min-width: 100%;

             }
        }
`;

const TableContainer = styled.div`
  margin-top: 8px; /* Reduced margin */
  width: 100%;
  overflow-x: auto;
`;

const StyledRow = styled.tr<{ theme: typeof themes[ThemeKey]; isTargetRow?: boolean, $iscurrenttime?: boolean; }>`
  background: ${props => `${props.theme.cardBg}`};
  border-top: 1px solid ${props => props.theme.hover}; /* Reduced border size */
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
    gap: 4px; /* Reduced gap */
    
    .ant-badge {
      .ant-badge-status-dot {
        width: 6px; /* Reduced size */
        height: 6px; /* Reduced size */
      }
      .ant-badge-status-text {
        color: ${props => props.theme.text};
        font-weight: 600;
        font-size: 0.75rem; /* Reduced size */
      }
    }
  }

  .target-content {
    .value-display {
      font-weight: 600;
      color: ${props => props.theme.text};
      margin-bottom: 2px; /* Reduced margin */
      font-size: 0.85rem;
    }

    .compliance-indicator {
      font-size: 0.7em;
      padding: 2px 4px; /* Reduced padding */
      border-radius: 3px; /* Reduced radius */
      
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

const ThemeSelector = styled.div<{ theme: typeof themes[ThemeKey] }>`
  .theme-button {
    background: ${props => props.theme.cardBg};
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: ${props => props.theme.text};
    padding: 6px 12px; /* Reduced padding */
    border-radius: 6px; /* Reduced radius */
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px; /* Reduced gap */
    height: 28px; /* Reduced height */
    transition: all 0.3s ease;
    font-size: 0.8rem;

    &:hover {
      background: ${props => props.theme.hover};
      border-color: ${props => props.theme.accent};
    }
  }
     @media (min-width: 768px) {
        .theme-button {
            padding: 8px 16px;
             border-radius: 8px;
           height: 32px;
            gap: 8px;
            font-size: 1rem;
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
    width: 14px; /* Reduced size */
    height: 14px; /* Reduced size */
    border-radius: 3px; /* Reduced radius */
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
  gap: 4px; /* Reduced gap */
  
  .signal-bars {
    display: inline-flex;
    gap: 1px; /* Reduced gap */
    align-items: flex-end;
    height: 12px; /* Reduced height */
    
    .bar {
      width: 2px; /* Reduced width */
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

// const SingleLineContent = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 8px; /* Reduced gap */
//   color: ${props => props.theme.text};

//   .value-group {
//     display: flex;
//     align-items: center;
//     gap: 4px; /* Reduced gap */

//     .target-value {
//       font-weight: 600;
//       font-size: 0.85rem;
//     }

//     .compliance {
//       font-size: 0.8em;
//       padding: 1px 4px; /* Reduced padding */
//       border-radius: 3px; /* Reduced radius */

//       &.positive {
//         color: #52c41a;
//         background: rgba(82, 196, 26, 0.1);
//       }

//       &.negative {
//         color: #ff4d4f;
//         background: rgba(255, 77, 79, 0.1);
//       }
//     }
//   }
//      @media (min-width: 768px) {
//         gap: 12px;
//      .value-group {
//          gap: 8px;
//          .target-value {
//            font-size: 1rem;
//         }
//            .compliance {
//                 font-size: 0.9em;
//                    padding: 2px 6px;
//                 border-radius: 4px;
//         }
//       }
//     }
// `;

const ProgressCell = styled.div<{ achievement: number; theme: typeof themes[ThemeKey] }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px; /* Reduced gap */
  padding: 2px; /* Reduced padding */

  .main-line {
    display: flex;
    align-items: center;
    gap: 4px; /* Reduced gap */
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
      gap: 2px; /* Reduced gap */
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
    height: 3px; /* Reduced height */
    background: ${props => props.theme.hover};
    border-radius: 1px; /* Reduced radius */
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

// const SettingsButton = styled.div<{ theme: typeof themes[ThemeKey] }>`
//   .settings-button {
//     display: flex;
//     align-items: center;
//     gap: 4px; /* Reduced gap */
//     padding: 4px 8px; /* Reduced padding */
//     border-radius: 4px; /* Reduced radius */
//     background: ${props => props.theme.cardBg};
//     border: 1px solid rgba(255, 255, 255, 0.2);
//     color: ${props => props.theme.text};
//     cursor: pointer;
//     transition: all 0.2s ease;
//       font-size: 0.75rem;

//     &:hover {
//       background: ${props => props.theme.hover};
//       border-color: ${props => props.theme.accent};
//       color: ${props => props.theme.accent};
//     }

//     .anticon {
//       font-size: 14px; /* Reduced icon size */
//     }
//   }
//     @media (min-width: 768px) {
//      .settings-button {
//          gap: 8px;
//            padding: 6px 12px;
//            border-radius: 6px;
//              font-size: 1rem;

//          .anticon {
//            font-size: 16px;
//         }
//       }
//     }
// `;

// const SettingsModal = styled(Modal) <{ theme: typeof themes[ThemeKey] }>`
//   .ant-modal-content {
//     background: ${props => props.theme.cardBg};
//     border: 1px solid rgba(255, 255, 255, 0.1);
//        width: 90%; /* take 90% of the screen */
//     max-width: 500px;
//   }

//   .ant-modal-header {
//     background: ${props => props.theme.cardBg};
//     border-bottom: 1px solid rgba(255, 255, 255, 0.1);

//     .ant-modal-title {
//       color: ${props => props.theme.text};
//     }
//   }

//   .ant-modal-body {
//     color: ${props => props.theme.text};
//   }

//   .ant-form-item-label > label {
//     color: ${props => props.theme.textSecondary};
//   }

//   .ant-input {
//     background: ${props => props.theme.primary};
//     border: 1px solid rgba(255, 255, 255, 0.2);
//     color: ${props => props.theme.text};

//     &:hover, &:focus {
//       border-color: ${props => props.theme.accent};
//     }
//   }

//   .ant-switch {
//     background: rgba(255, 255, 255, 0.2);

//     &.ant-switch-checked {
//       background: ${props => props.theme.accent};
//     }
//   }

//   .ant-btn {
//     background: ${props => props.theme.cardBg};
//     border: 1px solid rgba(255, 255, 255, 0.2);
//     color: ${props => props.theme.text};

//     &:hover {
//       background: ${props => props.theme.hover};
//       border-color: ${props => props.theme.accent};
//       color: ${props => props.theme.accent};
//     }

//     &.ant-btn-primary {
//       background: ${props => props.theme.accent};
//       color: #fff;

//       &:hover {
//         background: ${props => props.theme.secondary};
//         border-color: ${props => props.theme.secondary};
//         color: #fff;
//       }
//     }
//   }
//     @media (min-width: 768px) {
//         .ant-modal-content {
//          width: auto; /* go back to default width on bigger screens */
//             max-width: none; /* remove max width on bigger screens */
//     }
//    }
// `;

const RefreshButton = styled.div<{ theme: typeof themes[ThemeKey] }>`
  .refresh-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px; /* Reduced size */
    height: 24px; /* Reduced size */
    border-radius: 50%;
    background: ${props => props.theme.cardBg};
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: ${props => props.theme.text};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: ${props => props.theme.hover};
      border-color: ${props => props.theme.accent};
      color: ${props => props.theme.accent};
    }

    &.spinning {
      animation: spin 1s linear infinite;
    }

    .anticon {
      font-size: 14px; /* Reduced icon size */
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
      @media (min-width: 768px) {
        .refresh-button {
                width: 32px;
             height: 32px;
         .anticon {
            font-size: 16px;
         }
        }

    }
`;

// const RefreshIntervalButton = styled.div<{ theme: typeof themes[ThemeKey] }>`
//   .interval-button {
//     display: flex;
//     align-items: center;
//     gap: 4px; /* Reduced gap */
//     padding: 4px 8px; /* Reduced padding */
//     border-radius: 4px; /* Reduced radius */
//     background: ${props => props.theme.cardBg};
//     border: 1px solid rgba(255, 255, 255, 0.2);
//     color: ${props => props.theme.text};
//     cursor: pointer;
//     transition: all 0.2s ease;
//       font-size: 0.75rem;

//     &:hover {
//       background: ${props => props.theme.hover};
//       border-color: ${props => props.theme.accent};
//       color: ${props => props.theme.accent};
//     }

//     .anticon {
//       font-size: 14px; /* Reduced icon size */
//     }

//     .interval-text {
//       font-size: 10px;
//       opacity: 0.8;
//     }
//   }
//     @media (min-width: 768px) {
//         .interval-button {
//            gap: 8px;
//            padding: 6px 12px;
//          border-radius: 6px;
//            font-size: 1rem;
//             .anticon {
//                font-size: 16px;
//             }
//              .interval-text {
//                   font-size: 12px;
//                }
//         }
//     }
// `;

const AccountButton = styled.div<{ theme: typeof themes[ThemeKey] }>`
  .account-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px; /* Reduced size */
    height: 24px; /* Reduced size */
    border-radius: 50%;
    background: ${props => props.theme.cardBg};
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: ${props => props.theme.text};
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: ${props => props.theme.hover};
      border-color: ${props => props.theme.accent};
      color: ${props => props.theme.accent};
    }

    .anticon {
      font-size: 14px; /* Reduced icon size */
    }
  }
        @media (min-width: 768px) {
            .account-button {
                width: 32px;
                height: 32px;
                .anticon {
                    font-size: 16px;
                }
            }
        }
`;

// const IntervalPopover = styled.div<{ theme: typeof themes[ThemeKey] }>`
//   padding: 10px;
//     min-width: 200px;
//     background: ${props => props.theme.cardBg};
//     border-radius: 8px;
//     border: 1px solid rgba(255, 255, 255, 0.1);
//       .title {
//     font-size: 12px;
//     font-weight: 600;
//     color: ${props => props.theme.text};
//     margin-bottom: 8px;
//     display: flex;
//     align-items: center;
//     gap: 6px;
//     }
//     .interval-input {
//     margin-bottom: 8px;
//     }

//     .auto-refresh {
//       margin-bottom: 6px;
//     }
//         @media (min-width: 768px) {
//              padding: 16px;
//              min-width: 250px;
//             .title {
//                font-size: 14px;
//                margin-bottom: 12px;
//                  gap: 8px;
//             }
//             .interval-input {
//                margin-bottom: 12px;
//             }
//               .auto-refresh {
//                 margin-bottom: 8px;
//               }
//     }
// `;

// const PageLayout = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 10px; /* Reduced gap */
//   max-width: 1400px;
//   margin: 0 auto;
//     @media (min-width: 768px) {
//       gap: 16px;
//     }
// `;

type MaterialsObj = {
  [plant: string]: number;
};

interface ScheduleData {
  hourGroup: number;
  timeSlot: string;
  materialsObj: MaterialsObj;
}

interface PlantTarget {
  name: string;
  target: number;
}

interface TargetResponse {
  data: {
    result: ScheduleData[],
    target: {
      _id: string;
      plants: PlantTarget[];
    };
  };
  msg: string;
  statusCode: number;
}

const PlantSchedule: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [plants, setPlants] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('navy');
  const [activeShift, setActiveShift] = useState<'all' | 'morning' | 'day' | 'night'>('all');
  const [currentStats, setCurrentStats] = useState({ total: 0, average: 0, peak: 0 });
  const router = useRouter();
  const [plantTargets, setPlantTargets] = useState<{ [plantName: string]: number }>({}); // New state for targets
  const [mobileNavOpen, setMobileNavOpen] = useState(false); // State for mobile navigation
  const [isShipperSettingsVisible, setShipperSettingsVisible] = useState(false);
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
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
    { id: 'night', name: 'NC' },
  ];

  const getShiftData = (shift: 'all' | 'morning' | 'day' | 'night') => {
    if (shift === 'all') return scheduleData;

    const timeRanges = {
      morning: { start: 6, end: 14 },
      day: { start: 14, end: 22 },
      night: { start: 22, end: 6 }
    };

    return scheduleData.filter(item => {
      const [slotStartStr] = item.timeSlot.split(' - ');
      const timeStr = slotStartStr.split(':')[0];
      const hour = parseInt(timeStr, 10);
      const range = timeRanges[shift];

      if (shift === 'night') {
        return hour >= range.start || hour < range.end;
      }
      return hour >= range.start && hour < range.end;
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


  const calculateStats = (shift: 'all' | 'morning' | 'day' | 'night') => {
    // const data = scheduleData;
    const data = getShiftData(shift);
    if (!data.length) return { total: 0, average: 0, peak: 0 };

    const total = calculateGrandTotal(data);
    const average = total / data.length;
    const peak = Math.max(...data.map(schedule => calculateRowTotal(schedule.materialsObj)));

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

  useEffect(() => {
    fetchData(selectedDate);

  }, [selectedDate]);

  const calculateAchievement = (actual: number, target: number) => {
    return (actual / target) * 100;
  };

  useEffect(() => {
    if (!loading) {
      const stats = calculateStats(activeShift);
      setCurrentStats(stats);
    }
  }, [activeShift, scheduleData, loading]);

  const fetchData = async (date: Dayjs) => {
    try {
      setLoading(true);
      const response = await httpsGet(`invoice/billingDashboard?date=${date.format('YYYY-MM-DD')}`, 1, router);

      if (response.statusCode === 200) {
        const targetResponse = response as TargetResponse;
        const { result, target } = targetResponse.data;
        setScheduleData(result.sort((a, b) => a.hourGroup - b.hourGroup));

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
        console.log('targetResponse', targetsMap);
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

  const accountMenu : MenuProps = {
    items: [
      {
        key: '1',
        label: 'Profile',
        icon: <ProfileOutlined />,
        onClick: () => {/* Handle profile click */ },
      },
      {
        key: '2',
        label: 'Shipper Settings',
        icon: <SettingOutlined />,
        onClick: () => {
          console.log('Settings Clicked');
          setShipperSettingsVisible(true)
        },
      },
      {
        type: 'divider',
        key: 'divider-1'
      },
      {
        key: '3',
        label: 'Sign Out',
        icon: <LogoutOutlined />,
        onClick: () => {/* Handle sign out */ },
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
              height: '64px',
              width: '100%'
            }} />)}
          <Header theme={themes[currentTheme]}>
            <HeaderLeft theme={themes[currentTheme]}>
              <h2>Road Dispatch Plant</h2>
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
        padding: '10px 10px 74px 10px', // Extra padding at bottom for bottom nav
        marginBottom: 0
      } : {}}
    >
      <ContentWrapper>
        {mobile && (
          <div style={{
            height: '64px',
            width: '100%'
          }} />)}
        <Header theme={themes[currentTheme]}>
          <HeaderLeft theme={themes[currentTheme]}>
            <h2>Road Dispatch Plant</h2>
          </HeaderLeft>
          <MobileNav>
            <Popover
              content={
                <NavPopover theme={themes[currentTheme]}>
                  <div
                    className="nav-item"
                    onClick={() => {
                    }}
                  >
                    <CalendarOutlined />
                    <Typography.Text>
                      Select Date
                    </Typography.Text>
                  </div>
                  <div
                    className="nav-item"
                    onClick={() => {
                    }}
                  >
                    <Select
                      value={settings.refreshInterval}
                      onChange={(value) => handleRefreshChange(value)}
                      style={{ width: 120, margin: '0' }}
                    >
                      {refreshOptions.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div
                    className="nav-item"
                    onClick={() => {
                    }}
                  >
                    <RefreshButton theme={themes[currentTheme]}>
                      <div
                        className={`refresh-button ${loading ? 'spinning' : ''}`}
                        onClick={() => !loading && fetchData(selectedDate)}
                      >
                        <SyncOutlined />
                      </div>
                    </RefreshButton>
                  </div>

                  <div className="divider" />
                  <ThemeSelector theme={themes[currentTheme]}>
                    <Dropdown menu={themeMenuItems} placement="bottomRight">
                      <div className="theme-button">
                        <BgColorsOutlined />
                        {themes[currentTheme].name}
                      </div>
                    </Dropdown>
                  </ThemeSelector>
                  <div className="divider" />
                  <AccountButton theme={themes[currentTheme]}>
                    <Dropdown menu={accountMenu} placement="bottomRight">
                      <div className="account-button">
                        <UserOutlined />
                      </div>
                    </Dropdown>
                    <ShipperSettingsModal
                      visible={isShipperSettingsVisible}
                      onCancel={() => setShipperSettingsVisible(false)}
                      theme={themes[currentTheme]}
                    />
                  </AccountButton>
                </NavPopover>
              }
              trigger="click"
              open={mobileNavOpen}
              onOpenChange={toggleMobileNav}
              placement="bottomRight"
            >
              <div style={{
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                background: themes[currentTheme].cardBg,
                border: `1px solid rgba(255, 255, 255, 0.2)`,
                borderRadius: '8px'
              }}>
                <MenuOutlined />
              </div>
            </Popover>
          </MobileNav>
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
              allowClear={true}
              placeholder="Select date"
            />
            <Select
              value={settings.refreshInterval}
              onChange={(value) => handleRefreshChange(value)}
              style={{ width: 120 }}
            >
              {refreshOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
            <RefreshButton theme={themes[currentTheme]}>
              <div
                className={`refresh-button ${loading ? 'spinning' : ''}`}
                onClick={() => !loading && fetchData(selectedDate)}
              >
                <SyncOutlined />
              </div>
            </RefreshButton>
            <div className="divider" />
            <ThemeSelector theme={themes[currentTheme]}>
              <Dropdown menu={themeMenuItems} placement="bottomRight">
                <div className="theme-button">
                  <BgColorsOutlined />
                  {themes[currentTheme].name}
                </div>
              </Dropdown>
            </ThemeSelector>
            <div className="divider" />
            <AccountButton theme={themes[currentTheme]}>
              <Dropdown menu={accountMenu} placement="bottomRight">
                <div className="account-button">
                  <UserOutlined />
                </div>
              </Dropdown>
              <ShipperSettingsModal
                visible={isShipperSettingsVisible}
                onCancel={() => setShipperSettingsVisible(false)}
                theme={themes[currentTheme]}
              />
            </AccountButton>
          </HeaderRight>
        </Header>
        <div className="left-section">
          <DateDisplay theme={themes[currentTheme]}>
            <CalendarOutlined style={{ fontSize: '18px', marginRight: '8px' }} />
            <span className="date">{selectedDate.format('DD MMMM YYYY')}</span>
            <span className="day">({selectedDate.format('ddd')})</span>
          </DateDisplay>
        </div>

        {!loading && (
          <>
            <TopSection>
              <div className="right-section">

                <StatsCard>
                  <StatItem theme={themes[currentTheme]}>
                    <div className="stat-header">
                      <h3>Total billing (Road)</h3>
                      <Tooltip title="Total materials scheduled for the selected shift">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                    <p className="stat-value">
                      {currentStats.total.toFixed(0)}
                    </p>
                  </StatItem>
                  <StatItem theme={themes[currentTheme]}>
                    <div className="stat-header">
                      <h3>Average per Slot</h3>
                      <Tooltip title="Average materials per time slot in selected shift">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                    <p className="stat-value">
                      {currentStats.average.toFixed(0)}
                    </p>
                  </StatItem>
                  <StatItem theme={themes[currentTheme]}>
                    <div className="stat-header">
                      <h3>Peak Volume</h3>
                      <Tooltip title="Highest volume in selected shift">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </div>
                    <p className="stat-value">
                      {currentStats.peak.toFixed(0)}
                    </p>
                  </StatItem>
                </StatsCard>
              </div>
              <ShiftTabs theme={themes[currentTheme]}>
                {shifts.map(shift => {
                  const shiftStats = calculateShiftStats(shift.id as 'all' | 'morning' | 'day' | 'night');
                  return (
                    <div
                      key={shift.id}
                      className={`tab ${activeShift === shift.id ? 'active' : ''}`}
                      onClick={() => setActiveShift(shift.id as 'all' | 'morning' | 'day' | 'night')}
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
            </TopSection>
            <TableContainer>
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
                          const columnTotal = calculateColumnTotal(getShiftData(activeShift), plant);
                          const target = getTargetForPlant(plant);
                          const achievement = calculateAchievement(columnTotal, target);
                          const remaining = target - columnTotal;

                          return (
                            <StyledCell key={plant} theme={themes[currentTheme]}>
                              <ProgressCell theme={themes[currentTheme]} achievement={achievement}>
                                <div className="main-line">
                                  <span className="target">{target}</span>
                                  <span className="actual">
                                    <span>{columnTotal.toFixed(0)}</span>
                                    <span className="percentage">({achievement.toFixed(0)}%)</span>
                                  </span>
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
                        <StyledCell data-target-total="true" theme={themes[currentTheme]} />
                      </StyledRow>
                      {getShiftData(activeShift).map((schedule, index) => (
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
                              value={calculateColumnTotal(getShiftData(activeShift), plant)}
                              theme={themes[currentTheme]}
                            >
                              {calculateColumnTotal(getShiftData(activeShift), plant).toFixed(0)}
                            </Value>
                          </Td>
                        ))}
                        <Td data-total="true" theme={themes[currentTheme]}>
                          <Value
                            value={calculateGrandTotal(getShiftData(activeShift))}
                            theme={themes[currentTheme]}
                          >
                            {calculateGrandTotal(getShiftData(activeShift)).toFixed(0)}
                          </Value>
                        </Td>
                      </Tr>
                    </tbody>
                  </Table>
                </TableWrapper>
              </StyledCard>
            </TableContainer>
          </>
        )}
      </ContentWrapper>
    </Container>
  );
};

export default PlantSchedule;