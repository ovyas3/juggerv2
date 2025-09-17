"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Phone, MessageCircle, HelpCircle, X,Mail } from "lucide-react"
import { createPortal } from "react-dom"

import "./triptracker.css"

interface HelpModalProps {
  shipmentId?: string
  driverPhone?: string
  children: React.ReactNode
}

export function HelpModal({ shipmentId = "UHR0002-8", driverPhone = "9183526734", children }: HelpModalProps) {
  const [open, setOpen] = useState(false)

  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  
  const handleCopyEmail = async () => {
    const email = "support@smarttruck.com";
    try {
      await navigator.clipboard.writeText(email);
      setCopiedItem('email');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedItem('email');
    }
    
    // Clear the copied state after 2 seconds
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  }
  
  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(driverPhone);
      setCopiedItem('phone');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = driverPhone;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedItem('phone');
    }
    
    // Clear the copied state after 2 seconds
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  }

  


  
  
  
  const handleContactSupport = () => {
    window.open('https://ticket.instavans.com/', '_blank')  // Replace the email logic with the ticket URL
    setOpen(false)
  }
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // This function will close the modal when the backdrop is clicked
    setOpen(false);
  }

  const handleModalContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // This stops the click event from bubbling up to the backdrop, preventing modal closure
    e.stopPropagation();
  }

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [open]);

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>
      {open &&
        createPortal(
          <div className="modal-backdrop" onClick={handleBackdropClick}  >
            <div className="modal-content" onClick={handleModalContentClick} style={{
            maxWidth: '800px',  // Even wider
             // Ensure it doesn't exceed viewport on small screens
          }}>
              <div className="modal-header">
                <h2 className="modal-title">
                  <HelpCircle className="modal-title-icon" />
                  Get Help
                </h2>
                <button className="modal-close-button" onClick={() => setOpen(false)}>
                  <X className="modal-close-icon" />
                </button>
              </div>
              <p className="modal-description">Need assistance ? Choose an option below.</p>
              <div className="modal-buttons-container">
              <button 
  onClick={handleCopyEmail} 
  className="modal-button"
  style={{
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    textAlign: 'left',
    minHeight: '60px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: "230px",
  }}
>
<Mail  size={20} strokeWidth={2.5}  /> 
  <span style={{ flex: 1, lineHeight: '1.4', }}>
    {copiedItem === 'email' ? 'Email Copied!' : 'support@instavans.com'}
  </span>
</button>
<button 
  onClick={handleCopyPhone} 
  className="modal-button"
  style={{
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    textAlign: 'left',
    minHeight: '60px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: "230px",
  }}
>
  <Phone className="modal-button-icon" />
  <span style={{ flex: 1, lineHeight: '1.4' }}>
    {copiedItem === 'phone' ? 'Phone no Copied!' : driverPhone}
  </span>
</button>
               
                <button onClick={handleContactSupport} className="modal-button"   
                //  style={{minWidth: "230px",minHeight: '60px'}}
                 style={{
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  textAlign: 'left',
                  minHeight: '60px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: "230px",
                }}>
                  <MessageCircle className="modal-button-icon" />
                  <span style={{ flex: 1, lineHeight: '1.4' }}>
                  Create Ticket
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}