// AddRemarkModal.tsx

import React, { useState } from 'react';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
import { httpsPost } from '../../../../utils/Communication';
import { useRouter } from 'next/navigation';
import { useSnackbar } from "@/hooks/snackBar";
interface AddRemarkModalProps {
  title: string;
  shipmentId: string;
  driverId: string; 
  onClose: () => void;
  sin: string;
}

const AddRemarkModal: React.FC<AddRemarkModalProps> = ({ title, shipmentId, onClose, driverId, sin }) => {
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { showMessage } = useSnackbar();
  
  const handleSubmit = async () => {
    if (!remark.trim()) {
      showMessage("Please enter a remark before submitting.", "error");
      return;
    }

    setIsSubmitting(true);
    
    const url = `InplantDashboard/notes/${shipmentId}`;

    const payload = {
      stageId: 'GI',
      notes: remark.trim(),
    };

    try {
      const response = await httpsPost(
        url, 
        payload, 
        router, 
        1,
        false
      );

      if (response?.statusCode === 200) {
        showMessage("Note added successfully!", "success")
        onClose();
      } else {
        console.error("Failed to submit remark:", response?.message || "Unknown error");
        showMessage(`Failed to submit remark. ${response?.message || ''}`, "error");
      }
    } catch (error) {
      console.error("API call error during remark submission:", error);
      showMessage("An error occurred during submission.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        width: '400px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        <ModalHeader 
          title={`${title} - #${sin}`}
          onClose={onClose}
        />

        <div style={{ padding: '20px' }}>
          <textarea 
            value={remark} 
            onChange={(e) => {
              const inputValue = e.target.value;
              const filteredValue = inputValue.replace(/[^a-zA-Z\s0-9]/g, '');
              setRemark(filteredValue);
            }}
            placeholder="Enter your remark here..." 
            rows={4}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <div style={{ 
            marginTop: '10px', 
            textAlign: 'right', 
            gap: '10px', 
            display: 'flex',    
            justifyContent: 'flex-end',
          }}>
            <button 
              onClick={onClose}
              className="cancel-btn-modal"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="submit-btn-modal"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRemarkModal;
