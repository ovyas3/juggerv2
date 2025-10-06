// AddRemarkModal.tsx

import React,{useState} from 'react';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
import { httpsPost } from '../../../../utils/Communication'; // Adjust the import path for httpsPost
import { useRouter } from 'next/navigation';
interface AddRemarkModalProps {
  title: string;
  shipmentId: string;
  driverId: string; 
  onClose: () => void;
}

const AddRemarkModal: React.FC<AddRemarkModalProps> = ({ title, shipmentId, onClose, driverId}) => {
  const [remark, setRemark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  console.log("AddRemarkModal received driverId:", driverId);
  const handleSubmit = async () => {
    if (!remark.trim()) {
      alert("Please enter a remark before submitting.");
      return;
    }

    setIsSubmitting(true);
    const url = 'inPlantVehicles/updateRemarks'; // API endpoint

    // Payload structure for the API call
    const payload = {
      // Assuming the API expects the shipment ID and the remark content
      attached_driver: driverId, 
      shipper_remark: remark.trim(),
    };

    try {
      // Use httpsPost for the API call
      const response = await httpsPost(
        url, 
        payload, 
        router, 
        1, // Retries
        false // Is external
      );

      if (response?.statusCode === 200) {
        // Success feedback (e.g., toast/snackbar)
        console.log("Remark submitted successfully:", response);
        onClose(); // Close modal on success
      } else {
        // Failure feedback
        console.error("Failed to submit remark:", response?.message || "Unknown error");
        alert(`Failed to submit remark. ${response?.message || ''}`);
      }
    } catch (error) {
      console.error("API call error during remark submission:", error);
      alert("An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };
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
           value={remark} 
          //  onChange={(e) => setRemark(e.target.value)} 
          onChange={(e) => {
            const inputValue = e.target.value;
            const filteredValue = inputValue.replace(/[^a-zA-Z\s0-9]/g, '');
           setRemark(filteredValue);}}
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
                  onClick={handleSubmit} 
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