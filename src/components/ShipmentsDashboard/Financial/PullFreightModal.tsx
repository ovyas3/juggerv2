import React, { useState } from 'react';
import styles from '../ShipmentsDashboard.module.css';
import { X } from 'lucide-react';

interface PullFreightModalProps {
    show: boolean;
    sin: string;
    vehicleNo: string;
    pickup: string;
    destinations: Array<{_id: string, name: string}>;
    onClose: () => void;
    onGetFreight: (data: {destination: string, freightRate: string}) => void;
  }
  
  const PullFreightModal: React.FC<PullFreightModalProps> = ({
    show,
    sin,
    vehicleNo,
    pickup,
    destinations,
    onClose,
    onGetFreight
  }) => {
    console.log('PullFreightModal rendered with:', { 
      show, 
      sin, 
      vehicleNo, 
      pickup,
      destinations: destinations?.length 
    });
  
    if (!show) {
      console.log('Modal not shown because show is false');
      return null;
    }
  
    const [selectedDestination, setSelectedDestination] = useState('');
    const [freightRate, setFreightRate] = useState('');
  
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }} onClick={onClose}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '500px',
          maxWidth: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Pull Freight</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
              ×
            </button>
          </div>
          
          {/* Rest of your modal content */}
          <div>
            <p>SIN: {sin}</p>
            <p>Vehicle: {vehicleNo}</p>
            <p>Pickup: {pickup}</p>
            
            <div style={{ margin: '20px 0' }}>
              <select 
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              >
                <option value="">Select Destination</option>
                {destinations?.map(dest => (
                  <option key={dest._id} value={dest._id}>
                    {dest.name}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                value={freightRate}
                onChange={(e) => setFreightRate(e.target.value)}
                placeholder="Freight Rate"
                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
              />
              
              <button 
                onClick={() => onGetFreight({ destination: selectedDestination, freightRate })}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#0070f3', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Get Freight
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default PullFreightModal;