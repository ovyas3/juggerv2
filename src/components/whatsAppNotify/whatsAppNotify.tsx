"use client";

import React, { useEffect, useState } from "react";
import { useWindowSize } from "@/utils/hooks";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import "./whatsAppNotify.css";
import { Tabs, Tab, Box } from '@mui/material'
import { styled } from '@mui/system'

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

const WhatsAppNotify = () => {
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const mobile = useWindowSize(500);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([{ name: '', number: '' }]);
  const [error, setError] = useState<string>('');
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const handleContactChange = (index: number, field: keyof Contact, value: string) => {
    // For number field, validate input to only allow numbers, commas, and spaces
    if (field === 'number') {
      const isValidInput = /^[0-9, ]*$/.test(value);
      if (!isValidInput) {
        setError('Only numbers, commas, and spaces are allowed for phone numbers.');
        return;
      }
      // Truncate to 10 digits after removing non-digits
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // For name field, validate input to only allow alphabetical characters and spaces
    if (field === 'name') {
      const isValidInput = /^[A-Za-z ]*$/.test(value);
      if (!isValidInput) {
        setError('Only alphabetical characters and spaces are allowed for names.');
        return;
      }
    }

    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
    setError('');
  };

  const addContactField = () => {
    setContacts([...contacts, { name: '', number: '' }]);
  };

  const removeContactField = (index: number) => {
    const newContacts = contacts.filter((_, i) => i !== index);
    setContacts(newContacts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate contacts
    const validNumberRegex = /^\d{10}$/;
    const errors: string[] = [];
    const validContacts = contacts.filter((contact) => contact.number.trim() !== '' || contact.name.trim() !== '');

    validContacts.forEach((contact, index) => {
      if (!contact.name.trim()) {
        errors.push(`Name is required for contact ${index + 1}`);
      }
      if (!contact.number.trim()) {
        errors.push(`Number is required for contact ${index + 1}`);
      } else if (!validNumberRegex.test(contact.number)) {
        if (contact.number.length < 10) {
          errors.push(`Number for ${contact.name || `contact ${index + 1}`} is too short by ${10 - contact.number.length} digits`);
        } else if (contact.number.length > 10) {
          errors.push(`Number for ${contact.name || `contact ${index + 1}`} is too long by ${contact.number.length - 10} digits`);
        } else {
          errors.push(`Number for ${contact.name || `contact ${index + 1}`} is invalid`);
        }
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    setError('');
    if (validContacts.length > 0) {
      postWhatsAppNumbers(validContacts);
    } else {
      showMessage('Please enter at least one contact to notify', 'error');
    }
  };

  const getWhatsAppNumbers = async () => {
    setLoading(true);
    try {
      const response = await httpsGet('get/WhatsApp_numbers', 0, router);
      if (response.statusCode === 200) {
        const numbers = response?.data?.notification?.whatsApp || [''];
        setContacts(numbers.map((number: string) => ({
          name: '',
          number: number.replace(/\D/g, '').slice(0, 10) // Remove non-digits and truncate to 10 digits
        })));
      } else {
        showMessage('Failed to fetch WhatsApp numbers', 'error');
      }
    } catch (error) {
      console.error(error);
      showMessage('Failed to fetch WhatsApp numbers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const postWhatsAppNumbers = async (contacts: Contact[]) => {
    setLoading(true);
    try {
      const response = await httpsPost('set/WhatsApp_numbers', { contacts }, router, 0, false);
      if (response.statusCode === 200) {
        showMessage(`Successfully notified ${contacts.length} contacts.`, 'success');
      } else {
        showMessage('Failed to notify', 'error');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      showMessage('Failed to notify', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWhatsAppNumbers();
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
            <div className="whatsApp-notify-inputContainer">
              {contacts.map((contact, index) => (
                <div key={index} className="whatsApp-notify-inputGroup">
                  <div className="whatsApp-notify-inputWithButton">
                    <div className="whatsaApp-notify-inputWithLabel">
                      <label className="whatsApp-notify-indexLabel">Name</label>
                      <input
                        type="text"
                        placeholder="Contact Name"
                        value={contact.name}
                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                        className="whatsApp-notify-input"
                      />
                    </div>
                    <div className="whatsaApp-notify-inputWithLabel">
                      <label className="whatsApp-notify-indexLabel">Contact Number</label>
                      <input
                        type="text"
                        placeholder="WhatsApp Number"
                        value={contact.number}
                        onChange={(e) => handleContactChange(index, 'number', e.target.value)}
                        className="whatsApp-notify-input"
                      />
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeContactField(index)}
                        className="whatsApp-notify-removeButton"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addContactField} className="whatsApp-notify-addButton">
              + Add Another Contact Details
            </button>
          
            {error && <div className="whatsApp-notify-error">{error}</div>}

            <div className="whatsApp-notify-buttonContainer">
              <button type="button" onClick={handleSubmit} className="whatsApp-notify-submitButton">
                Submit
              </button>
              <button type="button" onClick={() => {
                getWhatsAppNumbers();
                setError('');
                setContacts([{ name: '', number: '' }]);
              }} className="whatsApp-notify-clearButton">
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
