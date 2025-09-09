import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, SelectChangeEvent } from '@mui/material';
import styles from './PrintLRModal.module.css';
import ModalHeader from '../../UI/ModalHeader/ModalHeader';
import { useSnackbar } from "@/hooks/snackBar"; 
import { httpsPost } from '@/utils/Communication';

type CopyType = {
  name: string;
  value: string;
};

type ProviderType = {
  name: string;
  value: string;
};

interface PrintLRModalProps {
  open: boolean;
  onClose: () => void;
  shipmentIds: string[];
  onPrint: (data: { type: string; copyTypes: string[] }) => void;
  loading?: boolean;
}

const PrintLRModal: React.FC<PrintLRModalProps> = ({
  open,
  onClose,
  shipmentIds = [],
  onPrint,
  loading = false,
}) => {
  const { showMessage } = useSnackbar();
  const [selectedCopy, setSelectedCopy] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [allSelected, setAllSelected] = useState(false);
  const [type, setType] = useState('normal');

  const copyTypes: CopyType[] = [
    { name: 'Consignee Copy', value: 'consignee' },
    { name: 'Consignor Copy', value: 'consignor' },
    { name: 'Driver Copy', value: 'driver' },
    { name: 'File Copy', value: 'file' },
    { name: 'Extra Copy', value: 'extra' },
  ];

  const [providers, setProviders] = useState<ProviderType[]>([
    { name: 'Carrier', value: 'carrier' },
  ]);

  useEffect(() => {
    // Check user type from localStorage if needed
    try {
      const typeData = JSON.parse(localStorage.getItem('shippers') || '[]');
      const userType = typeData[0]?.type || 'normal';
      setType(userType);
      
      if (userType === '4pl') {
        setProviders([
          { name: 'Carrier', value: 'carrier' },
          { name: '4PL', value: '4pl' },
        ]);
      }
    } catch (error) {
      console.error('Error parsing shippers from localStorage:', error);
    }
  }, []);

  const handleCopyChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedCopy(value);
    setAllSelected(value.length === copyTypes.length);
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allCopyValues = copyTypes.map((copy) => copy.value);
      setSelectedCopy(allCopyValues);
      setAllSelected(true);
    } else {
      setSelectedCopy([]);
      setAllSelected(false);
    }
  };

  const handleSubmit = async () => {
    const shipmentIdsArray = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds];


    if (selectedCopy.length === 0) {
      showMessage('Please select at least one copy type', 'error');
      return;
    }
    
    if (!selectedProvider) {
      showMessage('Please select a provider', 'error');
      return;
    }
  
    if (shipmentIdsArray.length === 0) {
      showMessage('No shipments selected', 'error');
      return;
    }
  
    if (shipmentIdsArray.length > 10) {
      showMessage('Cannot process more than 10 shipments at once', 'error');
      return;
    }
  
    try {
      const payload = {
        shipmentIds: shipmentIdsArray,
        type: selectedProvider.value,
        copy_types: selectedCopy
      };
  
      const response = await httpsPost('shipment/waybills', payload, {}, 4);
      
      if (response.statusCode === 200) {
        // Create a temporary anchor element to trigger download
        const a = document.createElement('a');
        a.href = response.data.link;
        a.setAttribute('download', 'waybills.pdf'); // You can customize the filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showMessage('Waybills downloaded successfully', 'success');
        onClose();
      } else {
        showMessage(response.message || 'Failed to download waybills', 'error');
      }
    } catch (error: any) {
      console.error('Error downloading waybills:', error);
      showMessage(error?.message || 'Failed to download waybills', 'error');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <div className={styles.main}>
        {loading && (
          <div className={styles.loader}>
            <div className={styles.load}>
              {/* Add your loading spinner component here */}
              <div>Loading...</div>
            </div>
          </div>
        )}
        
        <ModalHeader 
          title="Download LRs" 
          onClose={onClose} 
        />
        
        <DialogContent className={styles.section}>
          <div className={styles.inputContainer}>
            <div className={styles.title}>
              Type of Copy<span className={styles.required}>*</span>
            </div>
            <FormControl fullWidth>
              <Select
                multiple
                value={selectedCopy}
                onChange={handleCopyChange}
                renderValue={(selected) => selected.join(', ')}
                className={styles.inputSelect}
              >
                <div className={styles.selectAll}>
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAll}
                    inputProps={{ 'aria-label': 'select all copies' }}
                  />
                  <span>Select All</span>
                </div>
                {copyTypes.map((copy) => (
                  <MenuItem key={copy.value} value={copy.value}>
                    <Checkbox checked={selectedCopy.indexOf(copy.value) > -1} />
                    <ListItemText primary={copy.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          <div className={styles.inputContainer}>
            <div className={styles.title}>
              Provided By<span className={styles.required}>*</span>
            </div>
            <FormControl fullWidth>
              <Select
                value={selectedProvider?.value || ''}
                onChange={(e) => {
                  const provider = providers.find(p => p.value === e.target.value);
                  if (provider) setSelectedProvider(provider);
                }}
                className={styles.inputSelect}
              >
                {providers.map((provider) => (
                  <MenuItem key={provider.value} value={provider.value}>
                    {provider.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          
          <div className={styles.submitButton}>
            <button 
              className={styles.button} 
              onClick={handleSubmit}
              disabled={loading || !selectedProvider || selectedCopy.length === 0}
            >
              Submit
            </button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default PrintLRModal;
