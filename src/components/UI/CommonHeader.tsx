import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Typography, 
  Dropdown, 
  Select, 
  Popover, 
  MenuProps,
  Modal,
  DatePicker
} from 'antd';
import { 
  CalendarOutlined, 
  BgColorsOutlined, 
  SyncOutlined, 
  UserOutlined, 
  MenuOutlined,
  LogoutOutlined,
  ProfileOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { ShipperSettingsModal } from '../PlantSchedule/ShipperSettingsModal';
import { TargetSettingsModal } from '../PlantSchedule/TargetSettingsModal';

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

interface CommonHeaderProps {
  title: string;
  currentTheme: ThemeKey;
  selectedDate?: Dayjs;
  handleDateChange?: (date: Dayjs | null, dateString: string | string[]) => void;
  fetchData?: (date: Dayjs) => void | Promise<void>;
  loading?: boolean;
  settings?: {
    refreshInterval: number;
  };
  handleRefreshChange?: (value: number) => void;
  refreshOptions?: Array<{ value: number; label: string }>;
  themeMenuItems?: MenuProps['items'] | { items: MenuProps['items'] };
  accountMenu?: MenuProps;
  mobile?: boolean;
  showDatePicker?: boolean;
  showRefreshOptions?: boolean;
  alwaysShowDatePicker?: boolean;
  hideDatePickerDuringRefresh?: boolean;
}

export const CommonHeader: React.FC<CommonHeaderProps> = ({
  title,
  currentTheme,
  selectedDate,
  handleDateChange,
  fetchData,
  loading = false,
  settings,
  handleRefreshChange,
  refreshOptions,
  themeMenuItems = [],
  accountMenu = [],
  mobile = false,
  showDatePicker = false,
  showRefreshOptions = false,
  alwaysShowDatePicker = false,
  hideDatePickerDuringRefresh = false
}) => {
  
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isShipperSettingsVisible, setIsShipperSettingsVisible] = useState(false);
  const [isTargetSettingsVisible, setIsTargetSettingsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    if (!loading && fetchData && selectedDate) {
      setIsRefreshing(true);
      fetchData(selectedDate);
      
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  const normalizedThemeMenuItems = Array.isArray(themeMenuItems) 
    ? themeMenuItems 
    : themeMenuItems.items || [];

  const normalizedAccountMenu = Array.isArray(accountMenu)
    ? accountMenu
    : accountMenu.items || [];

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen);
  };

  const handleShipperSettingsOpen = () => {
    setIsShipperSettingsVisible(true);
  };

  const handleTargetSettingsOpen = () => {
    setIsTargetSettingsVisible(true);
  };

  const modifiedAccountMenu = [
    ...(Array.isArray(accountMenu) ? accountMenu : []),
    {
      key: 'shipper-settings',
      label: (
        <div onClick={handleShipperSettingsOpen}>
          <ProfileOutlined /> Shipper Settings
        </div>
      ),
    },
    {
      key: 'target-settings',
      label: (
        <div onClick={handleTargetSettingsOpen}>
          <SettingOutlined /> Target Settings
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

  if (mobile) {
    return (
      <Header theme={themes[currentTheme]}>
        <HeaderLeft theme={themes[currentTheme]}>
          <h2>{title}</h2>
        </HeaderLeft>
        
        <MobileNav>
          <Popover
            content={
              <NavPopover theme={themes[currentTheme]}>
                {(selectedDate && handleDateChange) && (
                  <div className="nav-item">
                    <CalendarOutlined />
                    <StyledDatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      format="DD-MM-YYYY"
                      theme={themes[currentTheme]}
                    />
                  </div>
                )}
                
                {(showRefreshOptions && refreshOptions && handleRefreshChange) && (
                  <div className="nav-item">
                    <Select
                      value={settings?.refreshInterval}
                      onChange={(value) => handleRefreshChange(value)}
                      style={{ width: '100%' }}
                    >
                      {refreshOptions.map(option => (
                        <Select.Option key={option.value} value={option.value}>
                          {option.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                )}
                
                <div className="nav-item">
                  <RefreshButton theme={themes[currentTheme]}>
                    <div
                      className={`refresh-button ${loading ? 'spinning' : ''}`}
                      onClick={handleRefreshClick}
                    >
                      <SyncOutlined />
                    </div>
                  </RefreshButton>
                </div>
                
                <div className="divider" />
                
                <ThemeSelector theme={themes[currentTheme]}>
                  <Dropdown 
                    menu={{ items: normalizedThemeMenuItems }} 
                    placement="bottomRight"
                  >
                    <div className="theme-button">
                      <BgColorsOutlined />
                      {themes[currentTheme].name}
                    </div>
                  </Dropdown>
                </ThemeSelector>
                
                <div className="divider" />
                
                <AccountButton theme={themes[currentTheme]}>
                  <Dropdown 
                    menu={{ items: modifiedAccountMenu }} 
                    placement="bottomRight"
                  >
                    <div className="account-button">
                      <UserOutlined />
                    </div>
                  </Dropdown>
                </AccountButton>
              </NavPopover>
            }
            trigger="click"
            open={mobileNavOpen}
            onOpenChange={toggleMobileNav}
            placement="bottomRight"
          >
            <MenuOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
          </Popover>
        </MobileNav>
        
        <ShipperSettingsModal
          visible={isShipperSettingsVisible}
          onCancel={() => setIsShipperSettingsVisible(false)}
          theme={themes[currentTheme]}
        />
        
        <TargetSettingsModal
          visible={isTargetSettingsVisible}
          onCancel={() => setIsTargetSettingsVisible(false)}
          theme={themes[currentTheme]}
        />
      </Header>
    );
  }

  return (
    <Header theme={themes[currentTheme]}>
      <HeaderLeft theme={themes[currentTheme]}>
        <Typography.Title level={2}>{title}</Typography.Title>
      </HeaderLeft>
      
      <HeaderRight theme={themes[currentTheme]}>
      {(alwaysShowDatePicker || 
          (showDatePicker && selectedDate && handleDateChange && 
           !(hideDatePickerDuringRefresh && isRefreshing))) && (
          <>
            <Typography.Text style={{ color: themes[currentTheme].textSecondary }}>
              <CalendarOutlined style={{ marginRight: 8, fontSize: 16 }} />
              Select Date:
            </Typography.Text>
            
            <StyledDatePicker
              value={selectedDate}
              onChange={(date: Dayjs | null, dateString: string | string[]) => {
                handleDateChange?.(date, dateString);
              }}
              format="DD-MM-YYYY"
              theme={themes[currentTheme]}
            />
          </>
        )}
        
        {showRefreshOptions && refreshOptions && handleRefreshChange && (
          <Select
            value={settings?.refreshInterval}
            onChange={(value) => handleRefreshChange(value)}
            style={{ width: 120, marginLeft: '10px' }}
          >
            {refreshOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        )}
        
        <RefreshButton theme={themes[currentTheme]}>
          <div
            className={`refresh-button ${loading ? 'spinning' : ''}`}
            onClick={handleRefreshClick}
          >
            <SyncOutlined />
          </div>
        </RefreshButton>
        
        <ThemeSelector theme={themes[currentTheme]}>
          <Dropdown 
            menu={{ items: normalizedThemeMenuItems }} 
            placement="bottomRight"
          >
            <div className="theme-button">
              <BgColorsOutlined />
              {themes[currentTheme].name}
            </div>
          </Dropdown>
        </ThemeSelector>
        
        <AccountButton theme={themes[currentTheme]}>
          <Dropdown 
            menu={{ items: modifiedAccountMenu }} 
            placement="bottomRight"
          >
            <div className="account-button">
              <UserOutlined />
            </div>
          </Dropdown>
        </AccountButton>
      </HeaderRight>
      
      <ShipperSettingsModal
        visible={isShipperSettingsVisible}
        onCancel={() => setIsShipperSettingsVisible(false)}
        theme={themes[currentTheme]}
      />
      
      <TargetSettingsModal
        visible={isTargetSettingsVisible}
        onCancel={() => setIsTargetSettingsVisible(false)}
        theme={themes[currentTheme]}
      />
    </Header>
  );
};
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

const RefreshButton = styled.div<{ theme: typeof themes[ThemeKey] }>`
  .refresh-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px; 
    height: 24px; 
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
      font-size: 14px; 
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

const ThemeSelector = styled.div<{ theme: typeof themes[ThemeKey] }>`
  .theme-button {
    background: ${props => props.theme.cardBg};
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: ${props => props.theme.text};
    padding: 6px 12px; 
    border-radius: 6px; 
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px; 
    height: 28px; 
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

const AccountButton = styled.div<{ theme: typeof themes[ThemeKey] }>`
  .account-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px; 
    height: 24px; 
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
      font-size: 14px; 
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

const ThemeOption = styled.div<{ color: string }>`
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;


export default CommonHeader;