import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Button, message, Select, Table, Typography, DatePicker } from 'antd';
import { DeleteOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { httpsPost } from '@/utils/Communication';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { httpsGet } from '@/utils/Communication';
import { useRouter } from 'next/navigation';

interface TargetSettingsModalProps {
    visible: boolean;
    onCancel: () => void;
    theme?: any;
    apiResponse?: {
      data: Array<{
        date: string;
        plants: Array<{
          name: string;
          target: number;
          _id?: string;
        }>;
      }>;
      statusCode: number;
      msg?: string;
    };
}

interface MillTarget {
    name: string;
    targets: { [key: string]: number };
}

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

const StyledModal = styled(Modal)<{ theme?: any }>`
  .ant-modal-content {
    background: ${props => props.theme?.cardBg};
    color: ${props => props.theme?.text};
  }
  .ant-modal-header {
    background: ${props => props.theme?.cardBg};
    border-bottom: 1px solid ${props => props.theme?.hover};
    padding: 16px;
    margin: 0;

    .ant-modal-title {
      color: ${props => props.theme?.text};
    }
  }
  .ant-modal-body {
    color: ${props => props.theme?.text};
    padding: 16px;
  }
  .ant-form-item-label > label {
    color: ${props => props.theme?.textSecondary};
  }
  .ant-select-selector {
    background: ${props => props.theme?.cardBg} !important;
    color: ${props => props.theme?.text} !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    &:hover, &:focus {
      border-color: ${props => props.theme?.accent} !important;
    }
  }
  .ant-table {
    background: transparent;
    
    .ant-table-thead > tr > th {
      background: ${props => props.theme?.hover};
      color: ${props => props.theme?.text};
      border-bottom: 1px solid ${props => props.theme?.hover};
      padding: 8px;
      text-align: center;
      font-size: 0.9rem;
    }
    
    .ant-table-tbody > tr > td {
      background: transparent;
      color: ${props => props.theme?.text};
      border-bottom: 1px solid ${props => props.theme?.hover}40;
      padding: 8px;
      text-align: center;
    }

    .ant-table-tbody > tr:hover > td {
      background: ${props => props.theme?.hover}40;
    }

    .ant-table-cell {
      vertical-align: middle;
    }
  }
  .ant-input-number {
    background: ${props => props.theme?.cardBg};
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 100%;
    
    .ant-input-number-input {
      color: ${props => props.theme?.text};
      text-align: center;
      padding: 4px;
      height: 32px;
    }
    
    &:hover, &:focus {
      border-color: ${props => props.theme?.accent};
    }
  }
  .ant-btn {
    background: ${props => props.theme?.cardBg};
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: ${props => props.theme?.text};

    &:hover {
      background: ${props => props.theme?.hover};
      border-color: ${props => props.theme?.accent};
      color: ${props => props.theme?.accent};
    }

    &.ant-btn-primary {
      background: ${props => props.theme?.accent};
      color: #fff;

      &:hover {
        background: ${props => props.theme?.secondary};
        border-color: ${props => props.theme?.secondary};
        color: #fff;
      }
    }
  }
`;

const AddButton = styled(Button)<{ theme?: any }>`
  width: 100%;
  margin-top: 16px;
  border: 1px dashed ${props => props.theme?.accent}50;
  color: ${props => props.theme?.accent};
  
  &:hover {
    border-color: ${props => props.theme?.accent};
    color: ${props => props.theme?.accent};
  }
`;

const TargetCell = styled.div<{ theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;

  .date {
    font-size: 0.85rem;
    font-weight: 500;
    color: ${props => props.theme?.text};
  }

  .day {
    font-size: 0.75rem;
    color: ${props => props.theme?.textSecondary};
    text-transform: uppercase;
  }

  .input-wrapper {
    position: relative;
    width: 100%;

    .unit {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.75rem;
      color: ${props => props.theme?.textSecondary};
      pointer-events: none;
    }
  }
`;

const TableHeader = styled.div<{ theme?: any }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: ${props => props.theme?.hover}40;
  border-radius: 8px;

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .icon {
      color: ${props => props.theme?.accent};
      font-size: 1.2rem;
    }
    
    .text {
      color: ${props => props.theme?.text};
      font-weight: 500;
    }
  }

  .total {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .label {
      color: ${props => props.theme?.textSecondary};
      font-size: 0.9rem;
    }
    
    .value {
      color: ${props => props.theme?.accent};
      font-weight: 500;
    }
  }
`;

const StyledTable = styled(Table)<{ theme?: any }>`
  .ant-table-thead > tr > th {
    &::before {
      display: none;
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

export const TargetSettingsModal: React.FC<TargetSettingsModalProps> = ({
    visible,
    onCancel,
    theme,
    apiResponse
}) => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [millTargets, setMillTargets] = useState<MillTarget[]>([{ 
        name: '', 
        targets: {} 
    }]);
    const [mills, setMills] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [weekDates, setWeekDates] = useState<string[]>([]);
    const [millTargetDate, setMillTargetDate] = useState<dayjs.Dayjs | null>(null);

    useEffect(() => {
        if (visible) {
            loadMills();
            generateWeekDates();
            setMillTargets([{ name: '', targets: {} }]);
            setMillTargetDate(null);
        }
    }, [visible]);

    useEffect(() => {
      if(apiResponse && apiResponse.data && apiResponse.statusCode === 200){
        const weekDates = [
          dayjs().format('YYYY-MM-DD'),
          dayjs().add(1, 'day').format('YYYY-MM-DD'),
          dayjs().add(2, 'day').format('YYYY-MM-DD'),
          dayjs().add(3, 'day').format('YYYY-MM-DD'),
          dayjs().add(4, 'day').format('YYYY-MM-DD'),
          dayjs().add(5, 'day').format('YYYY-MM-DD'),
          dayjs().add(6, 'day').format('YYYY-MM-DD'),
        ];

        const targetsMap: Record<string, Record<string, number>> = {};

        apiResponse.data.forEach(item => {
          const fromattedDate = dayjs(item.date).format('YYYY-MM-DD');

          item.plants.forEach(plant => {
            if(!targetsMap[plant.name]){
              targetsMap[plant.name] = {};
            }
            targetsMap[plant.name][fromattedDate] = plant.target;
          })
        })


        const processTragets = Object.keys(targetsMap).flatMap(plantName => {
          const targets: Record<string, number> = {};

          weekDates.forEach(date => {
            targets[date] = targetsMap[plantName][date] || 0;
          });

          return {
            name: plantName,
            targets
          } as MillTarget;
        });

        if(processTragets.length > 0){
          setMillTargets(processTragets);
        }
      } 
    }, [apiResponse]);

    const fetchMillTargets = async (date: dayjs.Dayjs) => {
      try{
        const formatDate = date.format('YYYY-MM-DD');
        const response = await httpsGet(`invoice/mills_target?from=${formatDate}&isTargetMill=true`, 0, router);
        
        if(response && response.data && response.statusCode === 200 && response.data.length > 0){
          const formData = response.data.reduce((acc: any[], item: any) => {
            const dateTargets = item.plants.map((plant: any) => ({
              name: plant.name,
              target: plant.target,
              date: dayjs(item.date).format('YYYY-MM-DD')
            }));
            return [...acc, ...dateTargets];
          }, []);

          const millTargetsData = response.data.flatMap((item: any) => 
              item.plants.map((plant: any) => ({
                  name: plant.name,
                  targets: {
                      [dayjs(item.date).format('YYYY-MM-DD')]: plant.target
                  }
              }))
          );

          setMillTargets(millTargetsData);

          form.setFieldsValue({
              targets: formData
          });
          message.success('Mill Targets fetched successfully');
        }
        else {
          setMillTargets([{ name: '', targets: {} }]);
          form.setFieldsValue({
              targets: [{ name: '', target: '', date: formatDate }]
          });
        }
      }
      catch{
        message.error('An error occurred while fetching mill targets');
      }
    }

    const handleTargetDateChange = (date: dayjs.Dayjs | null) => {
      setMillTargetDate(date);
      if(date){
        fetchMillTargets(date);
      }
    }

    const generateWeekDates = () => {
        const dates = [];
        const today = millTargetDate || dayjs();
        for (let i = 0; i < 7; i++) {
            dates.push(today.add(i, 'day').format('YYYY-MM-DD'));
        }
        setWeekDates(dates);
    };

    useEffect(() => {
        if (millTargetDate) {
            generateWeekDates();
        }
    }, [millTargetDate]);

    const loadMills = () => {
        try {
            const storedShippers = localStorage.getItem('shippers');
            console.log('Stored shippers:', storedShippers);
            
            if (!storedShippers) {
                message.error('No mills data found');
                return;
            }

            const parsedShippers = JSON.parse(storedShippers);
            console.log('Parsed shippers:', parsedShippers);

            // Get selected shipper from localStorage
            const selectedShipper = localStorage.getItem("selected_shipper");
            console.log('Selected shipper:', selectedShipper);

            if (!selectedShipper) {
                // If no selected shipper, show all mills
                const allMills = parsedShippers.map((shipper: any) => ({
                    label: shipper.name,
                    value: shipper.name
                }));
                setMills(allMills);
                return;
            }

            try {
                const selectedShipperData = JSON.parse(selectedShipper);
                console.log('Selected shipper data:', selectedShipperData);

                if (!selectedShipperData?.parent_name) {
                    // If no parent name, show all mills
                    const allMills = parsedShippers.map((shipper: any) => ({
                        label: shipper.name,
                        value: shipper.name
                    }));
                    setMills(allMills);
                    return;
                }

                const filteredMills = parsedShippers
                    .filter((shipper: any) => shipper.parent_name === selectedShipperData.parent_name)
                    .map((shipper: any) => ({
                        label: shipper.name,
                        value: shipper.name
                    }));

                console.log('Filtered mills:', filteredMills);

                if (filteredMills.length === 0) {
                    message.warning('No mills found for the selected company');
                    // If no mills found after filtering, show all mills
                    const allMills = parsedShippers.map((shipper: any) => ({
                        label: shipper.name,
                        value: shipper.name
                    }));
                    setMills(allMills);
                } else {
                    setMills(filteredMills);
                }
            } catch (error) {
                console.error('Error parsing selected shipper:', error);
                // In case of parsing error, show all mills
                const allMills = parsedShippers.map((shipper: any) => ({
                    label: shipper.name,
                    value: shipper.name
                }));
                setMills(allMills);
            }
        } catch (error) {
            console.error('Error in loadMills:', error);
            message.error('Failed to load mills data');
        }
    };

    const handleAddMill = () => {
        setMillTargets([...millTargets, { name: '', targets: {} }]);
    };

    const handleRemoveMill = (index: number) => {
        const newMillTargets = millTargets.filter((_, i) => i !== index);
        setMillTargets(newMillTargets);
    };

    const handleMillChange = (index: number, value: string) => {
        const newMillTargets = [...millTargets];
        newMillTargets[index] = { 
            name: value, 
            targets: newMillTargets[index].targets 
        };
        setMillTargets(newMillTargets);
    };

    const handleTargetChange = (index: number, date: string, value: number | null) => {
        const newMillTargets = [...millTargets];
        newMillTargets[index] = {
            ...newMillTargets[index],
            targets: {
                ...newMillTargets[index].targets,
                [date]: value || 0
            }
        };
        setMillTargets(newMillTargets);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const validMillTargets = millTargets.filter(pt => pt.name);
            
            if (validMillTargets.length === 0) {
                message.error('Please add at least one Mill');
                return;
            }

            // Transform data for API
            const payload = weekDates.map(date => ({
                date,
                mills: validMillTargets.map(mill => ({
                    name: mill.name,
                    target: mill.targets[date] || 0
                }))
            }));

            const response = await httpsPost('invoice/add_mills_target', payload);
            
            if (response?.statusCode === 200) {
                message.success('Mills targets updated successfully');
                onCancel();
            } else {
                message.error('Failed to update mill targets');
            }
        } catch (error) {
            console.error('Error updating mills targets:', error);
            message.error('Failed to update mills targets');
        } finally {
            setLoading(false);
        }
    };

    const getDayName = (date: string) => {
        return dayjs(date).format('ddd');
    };

    const calculateDayTotal = (date: string) => {
        return millTargets.reduce((sum, mill) => sum + (mill.targets[date] || 0), 0);
    };

    const columns = [
        {
            title: 'Mill',
            dataIndex: 'name',
            key: 'name',
            width: '25%',
            render: (_: any, _record: any, index: number) => (
                <Select
                    placeholder="Select Mill"
                    value={millTargets[index].name || undefined}
                    onChange={(value) => handleMillChange(index, value)}
                    options={mills.filter(mill => !millTargets.some((target, i) => target.name === mill.value && i !== index))}
                    style={{ width: '100%' }}
                />
            )
        },
        ...weekDates.map(date => ({
            title: () => (
                <TargetCell theme={theme}>
                    <span className="date">{dayjs(date).format('DD MMM')}</span>
                    <span className="day">{getDayName(date)}</span>
                </TargetCell>
            ),
            dataIndex: date,
            key: date,
            width: '10%',
            render: (_: any, _record: any, index: number) => (
                <TargetCell theme={theme}>
                    <div className="input-wrapper">
                        <InputNumber
                            min={0}
                            value={millTargets[index].targets[date] || 0}
                            onChange={(value) => handleTargetChange(index, date, value)}
                            style={{ width: '100%' }}
                            controls={false}
                        />
                        <span className="unit">MT</span>
                    </div>
                </TargetCell>
            )
        })),
        {
            title: '',
            key: 'action',
            width: '5%',
            render: (_: any, _record: any, index: number) => (
                millTargets.length > 1 && (
                    <DeleteOutlined
                        style={{ color: theme?.danger, cursor: 'pointer' }}
                        onClick={() => handleRemoveMill(index)}
                    />
                )
            )
        }
    ];

    return (
        <StyledModal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChartOutlined />
                    Mills Target Setting
                    <StyledDatePicker
                        theme={theme}
                        value={millTargetDate}
                        onChange={handleTargetDateChange}
                        placeholder="Select Date"
                        style={{ marginLeft: '10px' }}
                    />
                </div>
            }
            open={visible}
            onCancel={onCancel}
            width={1200}
            bodyStyle={{ padding: '16px' }}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    Save Changes
                </Button>
            ]}
            theme={theme}
        >             
            <Form form={form} layout="vertical">
                <div style={{ 
                    maxHeight: 'calc(70vh - 120px)', 
                    overflowY: 'auto',
                    marginBottom: '16px'
                }}>
                    <TableHeader theme={theme}>
                        <div className="title">
                            <BarChartOutlined className="icon" />
                            <span className="text">Weekly Production Targets</span>
                        </div>
                        <div className="total">
                            <span className="label">Today&apos;s Total Target:</span>
                            <span className="value">{calculateDayTotal(weekDates[0])} MT</span>
                        </div>
                    </TableHeader>

                    <StyledTable
                        dataSource={millTargets}
                        columns={columns}
                        pagination={false}
                        rowKey={(_, index) => (index !== undefined ? index.toString() : 'default-row-key')}
                        size="middle"
                        bordered
                        theme={theme}
                    />
                </div>

                <AddButton 
                    icon={<PlusOutlined />}
                    onClick={handleAddMill}
                    theme={theme}
                >
                    Add Mill
                </AddButton>
            </Form>
        </StyledModal>
    );
};
