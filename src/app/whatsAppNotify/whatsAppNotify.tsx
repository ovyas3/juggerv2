"use client";

import React, { useState } from "react";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";
import "./whatsAppNotify.css";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const WhatsAppNotify = () => {
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const mobile = useWindowSize(500);
  const [loading, setLoading] = useState(false);
  const [numbers, setNumbers] = useState<string[]>(['']);
  const [error, setError] = useState<string>('');

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
        <div className="whatsApp-notify-card">
          <h1 className="whatsApp-notify-title">
            <WhatsAppIcon style={{ fontSize: '1.8rem', color: '#4caf50', marginRight: 5 }} />
            WhatsApp Notify
          </h1>
          <form onSubmit={handleSubmit} className="whatsApp-notify-form">
            <label className="whatsApp-notify-label">Enter WhatsApp Numbers to Get Notified</label>
            <div className="whatsApp-notify-inputContainer">
            {numbers.map((number, index) => (
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
        </div>
      </div>
      {mobile ? (
          <SideDrawer />
      ) : (
          <div className="bottom_bar">
              <MobileDrawer />
          </div>
      )}
    </div>
  );
};

export default WhatsAppNotify;

