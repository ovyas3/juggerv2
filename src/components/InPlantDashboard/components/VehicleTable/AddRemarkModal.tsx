// AddRemarkModal.tsx

import React from 'react';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface AddRemarkModalProps {
  title: string;
  shipmentId: string;
  onClose: () => void;
}

const AddRemarkModal: React.FC<AddRemarkModalProps> = ({ title, shipmentId, onClose }) => {
  return (
    // Simple modal background and centered content wrapper
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000 // High z-index to overlay everything
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        width: '400px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Modal Header */}
        <ModalHeader 
          title={`${title} - ${shipmentId}`} // Title combined with shipment ID
          onClose={onClose}
          // The title prop for ModalHeader is assumed to handle the full string
        />

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
     
          {/* Example form field */}
          <textarea 
            placeholder="Enter your remark here..." 
            rows={4}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <div style={{ marginTop: '10px', textAlign: 'right' , gap: '10px', display: 'flex',    justifyContent: 'flex-end', 
              }}>
          <button 
              onClick={onClose} // Simply close the modal on cancel
            //   style={{ 
            //     padding: '8px 15px', 
               
            //     background: '#d8511f', // Light gray background
            //     color: '#fff', 
            //     border: '1px solid #d1d5db', 
            //     borderRadius: '4px', 
            //     cursor: 'pointer',
            //     fontWeight: '500' 
            //   }}
            className="cancel-btn-modal"
            >
              Cancel
            </button>
            <button 
              onClick={onClose} 
              className="submit-btn-modal" 
            //   style={{ padding: '8px 15px', background: '#20104d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
             >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRemarkModal;