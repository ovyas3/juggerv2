import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Button, message, Select, Table, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined, BarChartOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { httpsPost } from '@/utils/Communication';
import dayjs from 'dayjs';

interface TargetSettingsModalProps {
    visible: boolean;
    onCancel: () => void;
    theme?: any;
}

interface MillTarget {
    name: string;
    targets: { [key: string]: number };
}

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

export const TargetSettingsModal: React.FC<TargetSettingsModalProps> = ({
    visible,
    onCancel,
    theme
}) => {
    const [form] = Form.useForm();
    const [millTargets, setMillTargets] = useState<MillTarget[]>([{ 
        name: '', 
        targets: {} 
    }]);
    const [mills, setMills] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [weekDates, setWeekDates] = useState<string[]>([]);

    useEffect(() => {
        if (visible) {
            loadMills();
            generateWeekDates();
            setMillTargets([{ name: '', targets: {} }]);
        }
    }, [visible]);

    const generateWeekDates = () => {
        const dates = [];
        const today = dayjs();
        for (let i = 0; i < 7; i++) {
            dates.push(today.add(i, 'day').format('YYYY-MM-DD'));
        }
        setWeekDates(dates);
    };

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
                    options={mills}
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
            title="Mills Target Setting"
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
