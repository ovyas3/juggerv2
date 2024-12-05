"use client";

import React, { useEffect, useState } from "react";
import { useWindowSize } from "@/utils/hooks";
import { useSnackbar } from "@/hooks/snackBar";
import { useRouter } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import "./whatsAppNotify.css";
import { Tabs, Tab, Box } from '@mui/material'
import { styled } from '@mui/system'
import { httpsPost, httpsGet } from "@/utils/Communication";

// Custom styled components
const StyledTabs = styled(Tabs)({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': {
    backgroundColor: '#2962FF',
    height: '3px',
    borderRadius: '3px 3px 0 0',
  },
})

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  fontSize: '14px',
  fontWeight: 500,
  marginRight: theme.spacing(4),
  color: 'rgba(0, 0, 0, 0.85)',
  fontFamily: 'Inter, sans-serif',
  '&:hover': {
    color: '#2962ee',
    opacity: 1,
  },
  '&.Mui-selected': {
    color: '#2962FF',
    fontWeight: 600,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
}))

const TabPanel = styled(Box)({
  padding: '0px',
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <TabPanel
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </TabPanel>
  )
}

interface Contact {
  name: string;
  number: string;
}

interface TimeContainer {
  fromTime: string;
  toTime: string;
  timeError?: string;
  contacts: Contact[];
}

const WhatsAppNotify = () => {
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const mobile = useWindowSize(500);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(0);
  const [error, setError] = useState<string>('');
  const [containers, setContainers] = useState<TimeContainer[]>([{
    fromTime: '',
    toTime: '',
    timeError: '',
    contacts: [{ name: '', number: '' }]
  }]);
  const [triggerTime, setTriggerTime] = useState('');

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleTimeInputClick = (inputRef: HTMLInputElement) => {
    inputRef.showPicker();
  };

  const handleFromTimeChange = (containerIndex: number, newFromTime: string) => {
    const newContainers = [...containers];
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      fromTime: newFromTime,
      timeError: ''
    };
    setContainers(newContainers);
  };

  const handleToTimeChange = (containerIndex: number, newToTime: string) => {
    const newContainers = [...containers];
    const container = newContainers[containerIndex];
    
    if (container.fromTime && newToTime <= container.fromTime) {
      container.timeError = 'To time must be after From time';
    } else {
      container.timeError = '';
    }
    
    container.toTime = newToTime;
    setContainers(newContainers);
  };

  const handleContactChange = (containerIndex: number, contactIndex: number, field: keyof Contact, value: string) => {
    if (field === 'number') {
      const isValidInput = /^[0-9, ]*$/.test(value);
      if (!isValidInput) {
        return;
      }

      // Remove any non-digit characters
      value = value.replace(/\D/g, '');

      // Limit to 10 digits
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
    }

    const newContainers = [...containers];
    const container = newContainers[containerIndex];
    container.contacts[contactIndex] = {
      ...container.contacts[contactIndex],
      [field]: value
    };
    setContainers(newContainers);
    setError('');
  };

  const addContactField = (containerIndex: number) => {
    const newContainers = [...containers];
    newContainers[containerIndex].contacts.push({ name: '', number: '' });
    setContainers(newContainers);
  };

  const removeContactField = (containerIndex: number, contactIndex: number) => {
    const newContainers = [...containers];
    newContainers[containerIndex].contacts.splice(contactIndex, 1);
    setContainers(newContainers);
  };

  const addContainer = () => {
    setContainers([...containers, {
      fromTime: '',
      toTime: '',
      timeError: '',
      contacts: [{ name: '', number: '' }]
    }]);
  };

  const removeContainer = (index: number) => {
    if (containers.length > 1) {
      const newContainers = [...containers];
      newContainers.splice(index, 1);
      setContainers(newContainers);
    }
  };

  const validateInputs = () => {
    const errors: string[] = [];
    const validNumberRegex = /^\d{10}$/;

    containers.forEach((container, containerIndex) => {
      if (!container.fromTime || !container.toTime) {
        errors.push(`Time range is required for container ${containerIndex + 1}`);
      }

      container.contacts.forEach((contact, contactIndex) => {
        if (!contact.name.trim()) {
          errors.push(`Name is required for contact ${contactIndex + 1} in container ${containerIndex + 1}`);
        }
        if (!contact.number.trim()) {
          errors.push(`Number is required for contact ${contactIndex + 1} in container ${containerIndex + 1}`);
        } else if (!validNumberRegex.test(contact.number)) {
          if (contact.number.length < 10) {
            errors.push(`Number for ${contact.name || `contact ${contactIndex + 1}`} in container ${containerIndex + 1} is too short`);
          } else if (contact.number.length > 10) {
            errors.push(`Number for ${contact.name || `contact ${contactIndex + 1}`} in container ${containerIndex + 1} is too long`);
          } else {
            errors.push(`Number for ${contact.name || `contact ${contactIndex + 1}`} in container ${containerIndex + 1} is invalid`);
          }
        }
      });
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateInputs()) {
      showMessage('Validation successful', 'success');
    }
  };

  const handleClear = () => {
    setContainers([{
      fromTime: '',
      toTime: '',
      timeError: '',
      contacts: [{ name: '', number: '' }]
    }]);
    setError('');
  };

  const getWhatsAppNumbers = async () => {
    setLoading(true)
    try {
      const response = await httpsGet('get/WhatsApp_numbers', 0, router)
      console.log(response, "response");
    } catch (error) {
      console.error(error)
      showMessage('Failed to fetch WhatsApp numbers', 'error')
    } finally {
      setLoading(false)
    }
  }

  const postWhatsAppNumbers = async (numbers: string[]) => {
    setLoading(true)
    try {
      const response = await httpsPost('set/WhatsApp_numbers', { mobileNos:numbers }, router, 0, false)
      if (response.statusCode === 200) {
        showMessage(`Successfully notified ${numbers.length} numbers.`, 'success');
      } else {
        showMessage('Failed to notify', 'error')
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
      showMessage('Failed to notify', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getWhatsAppNumbers()
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#20114d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  };

  return (
    <div>
      <div className="whatsApp-notify-container">
        <Box sx={{ width: '100%', backgroundColor: '#fff' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <StyledTabs value={value} onChange={handleChange} aria-label="dashboard tabs">
              <StyledTab label="Stabled" />
              <StyledTab label="Delay At Plant" />
              <StyledTab label="Delay At Destination" />
              <StyledTab label="Notification" />
            </StyledTabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <h3 className="whatsApp-notify-title">WhatsApp Notify</h3>
            {containers.map((container, containerIndex) => (
              <div key={containerIndex} className="whatsApp-notify-contactsContainer">
                <div className="whatsApp-notify-timeContainer">
                  <div className="whatsApp-notify-timeField">
                    <label className="whatsApp-notify-indexLabel">From</label>
                    <div className="whatsApp-notify-timeInputWrapper">
                      <input
                        type="time"
                        value={container.fromTime}
                        onChange={(e) => handleFromTimeChange(containerIndex, e.target.value)}
                        onClick={(e) => handleTimeInputClick(e.target as HTMLInputElement)}
                        className="whatsApp-notify-timeInput"
                      />
                      <span className="whatsApp-notify-timeLabel">hrs</span>
                    </div>
                  </div>
                  <div className="whatsApp-notify-timeField">
                    <label className="whatsApp-notify-indexLabel">To</label>
                    <div className="whatsApp-notify-timeInputWrapper">
                      <input
                        type="time"
                        value={container.toTime}
                        onChange={(e) => handleToTimeChange(containerIndex, e.target.value)}
                        min={container.fromTime || undefined}
                        onClick={(e) => {
                          if (container.fromTime) {
                            handleTimeInputClick(e.target as HTMLInputElement);
                          }
                        }}
                        className={`whatsApp-notify-timeInput ${!container.fromTime ? 'disabled' : ''}`}
                        disabled={!container.fromTime}
                      />
                      <span className="whatsApp-notify-timeLabel">hrs</span>
                    </div>
                    {container.timeError && <div className="whatsApp-notify-timeError">{container.timeError}</div>}
                  </div>
                  <button
                    type="button"
                    onClick={addContainer}
                    className="whatsApp-notify-addIconButton"
                  >
                    +
                  </button>
                  {containerIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => removeContainer(containerIndex)}
                      className="whatsApp-notify-removeButton"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="whatsApp-notify-inputContainer">
                  {container.contacts.map((contact, contactIndex) => (
                    <div key={contactIndex} className="whatsApp-notify-inputGroup">
                      <div className="whatsApp-notify-inputWithButton">
                        <div className="whatsaApp-notify-inputWithLabel">
                          <label className="whatsApp-notify-indexLabel">Name</label>
                          <input
                            type="text"
                            placeholder="Contact Name"
                            value={contact.name}
                            onChange={(e) => handleContactChange(containerIndex, contactIndex, 'name', e.target.value)}
                            className="whatsApp-notify-input"
                          />
                        </div>
                        <div className="whatsaApp-notify-inputWithLabel">
                          <label className="whatsApp-notify-indexLabel">Contact Number</label>
                          <input
                            type="text"
                            placeholder="WhatsApp Number"
                            value={contact.number}
                            onChange={(e) => handleContactChange(containerIndex, contactIndex, 'number', e.target.value)}
                            className="whatsApp-notify-input"
                          />
                        </div>
                        {contactIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => removeContactField(containerIndex, contactIndex)}
                            className="whatsApp-notify-removeButton"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addContactField(containerIndex)}
                  className="whatsApp-notify-addButton"
                >
                  + Add Another Contact Details
                </button>
                {error && <div className="whatsApp-notify-error">{error}</div>}
              </div>
            ))}
            <div className="whatsApp-notify-timeContainer">
              <div className="whatsApp-notify-timeField">
                <label className="whatsApp-notify-triggerLabel">Notification Trigger Time</label>
                <div className="whatsApp-notify-timeInputWrapper">
                  <input
                    type="time"
                    value={triggerTime}
                    onChange={(e) => setTriggerTime(e.target.value)}
                    onClick={(e) => handleTimeInputClick(e.target as HTMLInputElement)}
                    className="whatsApp-notify-timeInput"
                  />
                  <span className="whatsApp-notify-timeLabel">hrs</span>
                </div>
              </div>
            </div>
            <div className="whatsApp-notify-buttonContainer">
              <button type="button" onClick={handleSubmit} className="whatsApp-notify-submitButton">
                Submit
              </button>
              <button type="button" onClick={handleClear} className="whatsApp-notify-clearButton">
                Clear
              </button>
            </div>  
          </CustomTabPanel>
        </Box>
      </div>
    </div>
  );
};

export default WhatsAppNotify;
