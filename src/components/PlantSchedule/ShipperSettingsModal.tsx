// import React, { useState, useEffect, useMemo } from 'react';
// import { Modal, Form, Select, Button, message, Tag, Space, Typography } from 'antd';
// import { httpsPost, httpsGet } from '@/utils/Communication';
// import styled from 'styled-components';
// import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

// interface Shipper {
//     _id: string;
//     type: string;
//     name: string;
//     parent_name: string;
//     short_code: string;
//     country: string;
// }

// interface ShipperSettingsModalProps {
//     visible: boolean;
//     onCancel: () => void;
//     theme?: any;
// }

// // Styled Components for Enhanced UI
// const StyledModal = styled(Modal)<{ theme?: any }>`
//   .ant-modal-content {
//     background: ${props => props.theme?.cardBg};
//     color: ${props => props.theme?.text};
//   }
//   .ant-modal-header {
//     background: ${props => props.theme?.cardBg};
//       border-bottom: 1px solid ${props => props.theme?.hover};

//     .ant-modal-title {
//       color: ${props => props.theme?.text};
//     }
//   }
//   .ant-modal-body {
//     color: ${props => props.theme?.text};
//   }
//     .ant-form-item-label > label {
//     color: ${props => props.theme?.textSecondary};
//   }
//     .ant-select-selector{
//       background: ${props => props.theme?.cardBg};
//      color: ${props => props.theme?.text};
//       border: 1px solid rgba(255, 255, 255, 0.2);
//        &:hover, &:focus {
//       border-color: ${props => props.theme?.accent};
//     }
//   }
//     .ant-select-selection-search-input {
//           color: ${props => props.theme?.text};
//         }
//   .ant-btn {
//     background: ${props => props.theme?.cardBg};
//     border: 1px solid rgba(255, 255, 255, 0.2);
//     color: ${props => props.theme?.text};

//     &:hover {
//       background: ${props => props.theme?.hover};
//       border-color: ${props => props.theme?.accent};
//       color: ${props => props.theme?.accent};
//     }

//     &.ant-btn-primary {
//       background: ${props => props.theme?.accent};
//       color: #fff;

//       &:hover {
//         background: ${props => props.theme?.secondary};
//         border-color: ${props => props.theme?.secondary};
//         color: #fff;
//       }
//     }
//   }
// `;

// const StyledSelect = styled(Select)`
//   .ant-select-selection-item-remove {
//     color: ${(props) => props.theme?.textSecondary};
//     &:hover {
//       color: ${(props) => props.theme?.accent};
//     }
//   }
//   .ant-select-selection-search input {
//     color: black !important;
//      &::placeholder {
//        color: #888 !important;
//     }
//   }
// `;

// const SelectedShippersContainer = styled.div<{ theme?: any }>`
//     margin-bottom: 16px;
//     padding: 10px;
//     border-radius: 8px;
//     background: ${props => props.theme?.cardBg};
//     border: 1px solid rgba(255, 255, 255, 0.2);
//     h4 {
//         margin-bottom: 10px;
//         color: ${props => props.theme?.textSecondary};
//        font-size: 1rem;
//         display: flex;
//         align-items: center;
//          gap: 8px;
//     }
//    .ant-tag {
//       background: ${props => props.theme?.primary};
//       color: ${props => props.theme?.text};
//         border: 1px solid rgba(255, 255, 255, 0.2);
//         font-size: 0.85rem;
//        padding: 4px 10px;
//         margin-bottom: 5px;
//     .anticon{
//          font-size: 0.75rem;
//            margin-left: 6px;
//        }
//    }
// `;
// const StyledFormItem = styled(Form.Item)`
//     margin-bottom: 0;
// `;
// const DropdownItem = styled.div<{ theme?: any, selected?: boolean }>`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 8px 12px;
//    color: ${props => props.theme?.text};
//     background: ${props => props.selected ? props.theme?.hover : 'transparent'};
//     &:hover {
//     background: ${props => props.theme?.hover};
//   }
//    .anticon {
//        color: ${props => props.selected ? props.theme?.accent : 'transparent'};
//        font-size: 12px;
//     }
// `;

// export const ShipperSettingsModal: React.FC<ShipperSettingsModalProps> = ({
//     visible,
//     onCancel,
//     theme
// }) => {
//     const [shippers, setShippers] = useState<Shipper[]>([]);
//     const [selectedShippers, setSelectedShippers] = useState<string[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [fetchError, setFetchError] = useState<string | null>(null);
//     const [preSelectedShippers, setPreSelectedShippers] = useState<string[]>([]);


//     useEffect(() => {
//         if (visible) {
//             fetchShippers();
//             fetchPreSelectedShippers();
//         } else {
//             setSelectedShippers([]);
//         }
//     }, [visible]);

//     const fetchShippers = () => {
//          setLoading(true);
//         setFetchError(null);
//         try {
//             const storedShippers = localStorage.getItem('shippers');
//             if (storedShippers) {
//                 const parsedShippers: Shipper[] = JSON.parse(storedShippers);
//                   const parentName = localStorage.getItem("selected_shipper")
//                  if (parentName) {
//                    const filteredShippers = parsedShippers.filter(shipper => shipper.parent_name === "JSPL Angul")
//                     setShippers(filteredShippers);
//                 } else {
//                     setShippers(parsedShippers)
//                 }
//             } else {
//                 setFetchError('No shippers found in local storage');
//                 message.warning('No shippers available in local storage');
//             }
//         } catch (error) {
//             console.error('Error fetching shippers from local storage:', error);
//             setFetchError('Failed to fetch shippers from local storage');
//             message.error('Failed to load shipper list from local storage');
//         } finally {
//             setLoading(false);
//         }
//     };
//       const fetchPreSelectedShippers = async () => {
//          try {
//              const response = await httpsGet('constants/getShippers/');
//             if (response?.statusCode === 200 && response.data) {
//                 const preselected = response.data.road_dispatch_plant.map((item: any)=> item._id)
//                 setSelectedShippers(preselected);
//                 setPreSelectedShippers(preselected);
//             } else {
//                 console.error('Error fetching pre-selected shippers:', response);
//                 setPreSelectedShippers([]);
//             }
//         } catch (error) {
//              console.error('Error fetching pre-selected shippers:', error);
//              setPreSelectedShippers([]);
//         }
//     };
//     const handleSubmit = async () => {
//         if (!selectedShippers || selectedShippers.length === 0) {
//             message.warning('Please select at least one shipper');
//             return;
//         }

//         setLoading(true);
//         try {
//             const response = await httpsPost('constants/shipper_settings', {
//                 shippers: selectedShippers
//             });

//             console.log('Shipper settings submit response:', response);

//             if (response?.statusCode === 200) {
//                 message.success('Shipper settings updated successfully');
//                 onCancel();
//             } else {
//                 message.error('Failed to update shipper settings');
//             }
//         } catch (error) {
//             console.error('Error submitting shipper settings:', error);
//             message.error('An error occurred while updating shipper settings');
//         } finally {
//             setLoading(false);
//         }
//     };
//      const handleTagRemove = (id: string) => {
//        setSelectedShippers(selectedShippers.filter(shipperId => shipperId !== id));
//          setPreSelectedShippers(preSelectedShippers.filter(shipperId => shipperId !== id))
//     };
//     const handleChange = (value: any) => {
//        // No action needed here, we're handling selection with onSelect
//     };
//    const getShipperName = (id: string) => {
//         const shipper = shippers.find((shipper) => shipper._id === id);
//          return shipper ? shipper.name : 'Unknown Shipper';
//     };
//     const filterOption = (input: string, option: { label: string, value: string }) =>
//        (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) &&
//         !selectedShippers.includes(option.value);
//   const filteredOptions = useMemo(() => {
//         return shippers.filter(shipper => !selectedShippers.includes(shipper._id)).map(shipper => ({
//               label: shipper.name,
//                 value: shipper._id
//         }))
//     }, [shippers, selectedShippers]);
//     const handleDropdownSelect = (value: any, option: any) => {
//           const id = option.value;
//           if (selectedShippers.includes(id)) {
//                 setSelectedShippers(selectedShippers.filter(shipperId => shipperId !== id));
//             } else {
//                  setSelectedShippers([...selectedShippers, id]);
//            }
//     };
//    const renderDropdownItem = (option: any) => {
//        const isSelected = selectedShippers.includes(option.value);
//         return (
//             <DropdownItem theme={theme} selected={isSelected}>
//                 <span>{option.label}</span>
//                 {isSelected && <CheckOutlined />}
//             </DropdownItem>
//         );
//     };
//     return (
//         <StyledModal
//             title="Shipper Settings"
//             open={visible}
//             onCancel={onCancel}
//             footer={[
//                 <Button key="cancel" onClick={onCancel}>
//                     Cancel
//                 </Button>,
//                 <Button
//                     key="submit"
//                     type="primary"
//                     loading={loading}
//                     onClick={handleSubmit}
//                     disabled={loading || shippers.length === 0}
//                 >
//                     Save Settings
//                 </Button>
//             ]}
//             theme={theme}
//         >
//              <SelectedShippersContainer theme={theme}>
//                 <h4>
//                    <Typography.Text style={{ color: theme?.text }}>
//                         Selected Shippers:
//                     </Typography.Text>
//                     {selectedShippers.length > 0 ? (
//                        <Typography.Text style={{ color: theme?.accent }}>
//                           {selectedShippers.length} selected
//                        </Typography.Text>
//                     ) : null}
//                 </h4>
//                 <Space size={[0, 8]} wrap>
//                    {selectedShippers.map(id => (
//                         <Tag key={id} closable onClose={(e) => { e.preventDefault(); handleTagRemove(id) }}>
//                              {getShipperName(id)}
//                             <CloseOutlined />
//                         </Tag>
//                     ))}
//                     {preSelectedShippers?.map(id => (
//                         <Tag key={id} color="green" closable onClick={(e) => { e.preventDefault(); handleTagRemove(id) }}>
//                               {getShipperName(id)}
//                             <CloseOutlined />
//                         </Tag>
//                     ))}
//                 </Space>
//             </SelectedShippersContainer>
//              <Form layout="vertical">
//                 <StyledFormItem
//                     label="Select Shippers"
//                     help={fetchError}
//                     validateStatus={fetchError ? 'error' : undefined}
//                 >
//                    <StyledSelect
//                         mode="multiple"
//                         placeholder="Search and choose shippers"
//                         value={null}
//                         onChange={handleChange}
//                         style={{ width: '100%' }}
//                         loading={loading}
//                         disabled={loading}
//                         theme={theme}
//                         filterOption={filterOption}
//                          options={filteredOptions}
//                         onSelect={handleDropdownSelect}
//                         listItem={renderDropdownItem}
//                     />
//                 </StyledFormItem>
//             </Form>
//         </StyledModal>
//     );
// };

import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Select, Button, message, Tag, Space, Typography, SelectProps } from 'antd';
import { httpsPost, httpsGet } from '@/utils/Communication';
import styled from 'styled-components';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

interface Shipper {
    _id: string;
    type: string;
    name: string;
    parent_name: string;
    short_code: string;
    country: string;
}

interface SelectedShipper {
    _id: string;
    name: string;
}

interface ShipperSettingsModalProps {
    visible: boolean;
    onCancel: () => void;
    theme?: any;
}

interface RoadDispatchPlantItem {
    _id: string;
    name: string;
    //add other properties here
}

interface OptionType {
    label: string | number | null | undefined;
    value: string | number;
}

// Styled Components for Enhanced UI
const StyledModal = styled(Modal) <{ theme?: any }>`
  .ant-modal-content {
    background: ${props => props.theme?.cardBg};
    color: ${props => props.theme?.text};
  }
  .ant-modal-header {
    background: ${props => props.theme?.cardBg};
      border-bottom: 1px solid ${props => props.theme?.hover};

    .ant-modal-title {
      color: ${props => props.theme?.text};
    }
  }
  .ant-modal-body {
    color: ${props => props.theme?.text};
  }
    .ant-form-item-label > label {
    color: ${props => props.theme?.textSecondary};
  }
   .ant-select-selector{
     background: ${props => props.theme?.cardBg};
     color: ${props => props.theme?.text};
      border: 1px solid rgba(255, 255, 255, 0.2);
      &:hover, &:focus {
      border-color: ${props => props.theme?.accent};
    }
  }
  .ant-select-selection-search input {
    color: black !important;
    &::placeholder {
      color: #888 !important;
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

const StyledSelect = styled(Select)`
     .ant-select-selection-item-remove {
        color: ${props => props.theme?.textSecondary};
        &:hover {
             color: ${props => props.theme?.accent};
        }
     }
`;

const SelectedShippersContainer = styled.div<{ theme?: any }>`
    margin-bottom: 16px;
    padding: 10px;
    border-radius: 8px;
    background: ${props => props.theme?.cardBg};
    border: 1px solid rgba(255, 255, 255, 0.2);
    h4 {
        margin-bottom: 10px;
         color: ${props => props.theme?.textSecondary};
         font-size: 1rem;
            display: flex;
            align-items: center;
             gap: 8px;
    }
   .ant-tag {
       background: ${props => props.theme?.primary};
       color: ${props => props.theme?.text};
      border: 1px solid rgba(255, 255, 255, 0.2);
     font-size: 0.85rem;
     padding: 4px 10px;
      margin-bottom: 5px;

        .anticon{
           font-size: 0.75rem;
            margin-left: 6px;
        }
  }
`;
const StyledFormItem = styled(Form.Item)`
    margin-bottom: 0;
`;
const DropdownItem = styled.div<{ theme?: any, selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
   color: ${props => props.theme?.text};
    background: ${props => props.selected ? props.theme?.hover : 'transparent'};
    &:hover {
    background: ${props => props.theme?.hover};
  }
   .anticon {
       color: ${props => props.selected ? props.theme?.accent : 'transparent'};
       font-size: 12px;
    }
`;

export const ShipperSettingsModal: React.FC<ShipperSettingsModalProps> = ({
    visible,
    onCancel,
    theme
}) => {
    const [shippers, setShippers] = useState<Shipper[]>([]);
    const [selectedShippers, setSelectedShippers] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [preSelectedShippers, setPreSelectedShippers] = useState<SelectedShipper[]>([]);

    useEffect(() => {
        if (visible) {
            fetchShippers();
            fetchPreSelectedShippers();
        } else {
            setSelectedShippers([]);
            setPreSelectedShippers([])
        }
    }, [visible]);

    const fetchShippers = () => {
        setLoading(true);
        setFetchError(null);
        try {
            const storedShippers = localStorage.getItem('shippers');
            if (storedShippers) {
                const parsedShippers: Shipper[] = JSON.parse(storedShippers);
                const selectedShipper = localStorage.getItem("selected_shipper");
                if (selectedShipper) {
                    try {
                        const selectedShipperData = JSON.parse(selectedShipper);
                        const parentName = selectedShipperData.parent_name;
                        if (parentName) {
                            const filteredShippers = parsedShippers.filter(shipper => shipper.parent_name === parentName);
                            setShippers(filteredShippers);
                        } else {
                            setShippers(parsedShippers);
                        }
                    } catch (error) {
                        console.error('Error parsing selected shipper:', error);
                        setShippers(parsedShippers);
                    }
                } else {
                    setShippers(parsedShippers);
                }
            } else {
                setFetchError('No shippers found in local storage');
                message.warning('No shippers available in local storage');
            }
        } catch (error) {
            console.error('Error fetching shippers from local storage:', error);
            setFetchError('Failed to fetch shippers from local storage');
            message.error('Failed to load shipper list from local storage');
        } finally {
            setLoading(false);
        }
    };
    const fetchPreSelectedShippers = async () => {
        try {
            const response = await httpsGet('constants/getShippers/');
            if (response?.statusCode === 200 && response.data) {
                const preselected = response.data.road_dispatch_plant.map((item: any) => ({ _id: item._id, name: item.name }))
                setPreSelectedShippers(preselected);
                setSelectedShippers([...new Set([...preselected.map((item: RoadDispatchPlantItem) => item._id)])]);
            } else {
                console.error('Error fetching pre-selected shippers:', response);
                setPreSelectedShippers([]);
                setSelectedShippers([])
            }
        } catch (error) {
            console.error('Error fetching pre-selected shippers:', error);
            setPreSelectedShippers([]);
            setSelectedShippers([])
        }
    };

    const handleSubmit = async () => {
        if (!selectedShippers || selectedShippers.length === 0) {
            message.warning('Please select at least one shipper');
            return;
        }

        setLoading(true);
        try {
            const response = await httpsPost('constants/shipper_settings', {
                shippers: selectedShippers
            });

            console.log('Shipper settings submit response:', response);

            if (response?.statusCode === 200) {
                message.success('Shipper settings updated successfully');
                onCancel();
            } else {
                message.error('Failed to update shipper settings');
            }
        } catch (error) {
            console.error('Error submitting shipper settings:', error);
            message.error('An error occurred while updating shipper settings');
        } finally {
            setLoading(false);
        }
    };
    const handleTagRemove = (id: string) => {
        setSelectedShippers(selectedShippers.filter(shipperId => shipperId !== id));
        setPreSelectedShippers(preSelectedShippers.filter(item => item._id !== id))
    };
    const handleChange = (value: any) => {
        // No action needed here, we're handling selection with onSelect
    };
    const getShipperName = (id: string) => {
        const shipper = shippers.find((shipper) => shipper._id === id);
        return shipper ? shipper.name : 'Unknown Shipper';
    };
    const filterOption: SelectProps<any>['filterOption'] = (input, option) => {
        if (!option || option.label == null) return false;

        // Safely convert label to string
        const labelString: string = String(option.label);

        // Ensure input is treated as a string
        const inputString = String(input).toLowerCase();

        // Convert option.value to string for comparison with selectedShippers
        const optionValueAsString = String(option.value);

        // Filter out selected shippers, ensuring both are strings
        return labelString.toLowerCase().includes(inputString) &&
            !selectedShippers.includes(optionValueAsString);
    };


    const filteredOptions = useMemo(() => {
        return shippers.filter(shipper => !selectedShippers.includes(shipper._id)).map(shipper => ({
            label: shipper.name,
            value: shipper._id
        }))
    }, [shippers, selectedShippers]);
    const handleDropdownSelect = (value: any, option: any) => {
        const id = option.value;
        if (selectedShippers.includes(id)) {
            setSelectedShippers(selectedShippers.filter(shipperId => shipperId !== id));
        } else {
            setSelectedShippers([...selectedShippers, id]);
        }
    };
    const renderDropdownItem = (option: any) => {
        const isSelected = selectedShippers.includes(option.value);
        return (
            <DropdownItem theme={theme} selected={isSelected}>
                <span>{option.label}</span>
                {isSelected && <CheckOutlined />}
            </DropdownItem>
        );
    };
    const uniqueSelectedShippers = useMemo(() => {
        const allSelected = [...selectedShippers, ...preSelectedShippers.map(item => item._id)];
        return [...new Set(allSelected)];
    }, [selectedShippers, preSelectedShippers]);


    return (
        <StyledModal
            title="Shipper Mills Settings"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={loading || shippers.length === 0}
                >
                    Save Settings
                </Button>
            ]}
            theme={theme}
        >
            <SelectedShippersContainer theme={theme}>
                <h4>
                    <Typography.Text style={{ color: theme?.text }}>
                        Selected Shippers:
                    </Typography.Text>
                    {uniqueSelectedShippers.length > 0 ? (
                        <Typography.Text style={{ color: theme?.accent }}>
                            {uniqueSelectedShippers.length} selected
                        </Typography.Text>
                    ) : null}
                </h4>
                <Space size={[0, 8]} wrap>
                    {uniqueSelectedShippers.map(id => {
                        const isPreselected = preSelectedShippers.some(item => item._id === id);
                        const shipperName = preSelectedShippers.find(item => item._id === id)?.name || getShipperName(id)
                        return (
                            <Tag
                                key={id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleTagRemove(id);
                                }}
                                color={isPreselected ? 'green' : undefined}
                            >
                                {shipperName}
                                <CloseOutlined />
                            </Tag>
                        )
                    })}
                </Space>
            </SelectedShippersContainer>
            <Form layout="vertical">
                <StyledFormItem
                    label="Select Mills"
                    help={fetchError}
                    validateStatus={fetchError ? 'error' : undefined}
                >
                    <StyledSelect
                        mode="multiple"
                        placeholder="Search and choose mills"
                        value={null}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                        loading={loading}
                        disabled={loading}
                        filterOption={filterOption}
                        options={filteredOptions}
                        onSelect={handleDropdownSelect}
                    >
                        {filteredOptions.map((option) => (
                            <DropdownItem theme={theme} selected={selectedShippers.includes(option.value)} key={option.value}>
                                <span>{option.label}</span>
                                {selectedShippers.includes(option.value) && <CheckOutlined />}
                            </DropdownItem>
                        ))}
                    </StyledSelect>
                </StyledFormItem>
            </Form>
        </StyledModal>
    );
};