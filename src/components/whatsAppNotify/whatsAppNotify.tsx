"use client";

import React, { useEffect, useState } from "react";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import "./whatsAppNotify.css";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
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


const WhatsAppNotify = () => {
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const mobile = useWindowSize(500);
  const [loading, setLoading] = useState(false);
  const [numbers, setNumbers] = useState<string[]>(['']);
  const [error, setError] = useState<string>('');
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const handleNumberChange = (index: number, value: string) => {
    const isValidInput = /^[0-9, ]*$/.test(value);
    if (!isValidInput) {
      setError('Only numbers, commas, and spaces are allowed.');
      return;
    }
    
    const newNumbers = [...numbers]
    newNumbers[index] = value
    setNumbers(newNumbers)
    setError('');
  };

  const addNumberField = () => {
    setNumbers([...numbers, ''])
  };

  const removeNumberField = (index: number) => {
    const newNumbers = numbers.filter((_, i) => i !== index)
    setNumbers(newNumbers)
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate numbers
    const validNumberRegex = /^\d{10}$/
    const errors: string[] = []
    const validNumbers = numbers.filter((num) => num.trim() !== '')

    validNumbers.forEach((num) => {
      if (!validNumberRegex.test(num)) {
        if (num.length < 10) {
          errors.push(`Number "${num}" is too short by ${10 - num.length} digits.`)
        } else if (num.length > 10) {
          errors.push(`Number "${num}" is too long by ${num.length - 10} digits.`)
        } else {
          errors.push(`Number "${num}" is invalid.`)
        }
      }
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
      return
    }

    setError('')
    if(validNumbers && validNumbers.length > 0) {
      postWhatsAppNumbers(validNumbers)
    } else {
      showMessage('Please enter at least one WhatsApp number to notify', 'error')
    }
  };

  const getWhatsAppNumbers = async () => {
    setLoading(true)
    try {
      const response = await httpsGet('get/WhatsApp_numbers', 0, router)
      if (response.statusCode === 200) {
        const numbers = response?.data
          && response?.data?.notification 
          && response?.data?.notification?.whatsApp ? 
          response?.data?.notification?.whatsApp : ['']
        setNumbers(numbers)
      } else {
        showMessage('Failed to fetch WhatsApp numbers', 'error')
      }
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
      const response = await httpsPost('set/WhatsApp_numbers', { numbers }, router, 0, false)
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
            <div className="whatsApp-notify-inputContainer">
            {numbers && numbers.map((number, index) => (
              <div key={index} className="whatsApp-notify-inputGroup">
                <label className="whatsApp-notify-indexLabel">Contact Number</label>
                <div className="whatsApp-notify-inputWithButton">
                  <input
                    type="text"
                    placeholder={`Contact Number ${index + 1}`}
                    value={number}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    className="whatsApp-notify-input"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeNumberField(index)}
                      className="whatsApp-notify-removeButton"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
            </div>
            <button type="button" onClick={addNumberField} className="whatsApp-notify-addButton">
              + Add Another Contact Details
            </button>
          
            {error && <div className="whatsApp-notify-error">{error}</div>}

            <div className="whatsApp-notify-buttonContainer">
              <button type="button" onClick={handleSubmit} className="whatsApp-notify-submitButton">
                Submit
              </button>
              <button type="button" onClick={() => {
                getWhatsAppNumbers()
                setError('')
                setNumbers([''])
              }} className="whatsApp-notify-clearButton">
                Clear
              </button>
            </div>  
          </CustomTabPanel>
        </Box>
        {/* <div className="whatsApp-notify-card">
          <h1 className="whatsApp-notify-title">
            <WhatsAppIcon style={{ fontSize: '1.8rem', color: '#4caf50', marginRight: 5 }} />
            WhatsApp Notify
          </h1>
          <form onSubmit={handleSubmit} className="whatsApp-notify-form">
            <label className="whatsApp-notify-label">Enter WhatsApp Numbers to Get Notified</label>
            <div className="whatsApp-notify-inputContainer">
            {numbers && numbers.map((number, index) => (
              <div key={index} className="whatsApp-notify-inputGroup">
                <label className="whatsApp-notify-indexLabel">{index + 1}</label>
                <input
                  type="text"
                  placeholder={`WhatsApp Number ${index + 1}`}
                  value={number}
                  onChange={(e) => handleNumberChange(index, e.target.value)}
                  className="whatsApp-notify-input"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeNumberField(index)}
                    className="whatsApp-notify-removeButton"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            </div>
            <button type="button" onClick={addNumberField} className="whatsApp-notify-addButton">
              + Add Another Number
            </button>
          
            {error && <div className="whatsApp-notify-error">{error}</div>}
          
            <button type="submit" className="whatsApp-notify-submitButton">
              Notify
            </button>
          </form>
        </div> */}
      </div>
    </div>
  );
};

export default WhatsAppNotify;

