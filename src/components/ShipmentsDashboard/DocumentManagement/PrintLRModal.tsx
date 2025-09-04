import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, Select, MenuItem, FormControl, InputLabel, Checkbox, ListItemText, SelectChangeEvent } from '@mui/material';
import styles from './PrintLRModal.module.css';
import CloseIcon from '@mui/icons-material/Close';

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
  const { t } = useTranslation();
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

  const handleSubmit = () => {
    if (selectedCopy.length === 0) {
      // Show error: Type of copy is required
      return;
    }
    
    if (!selectedProvider) {
      // Show error: Provider is required
      return;
    }

    if (shipmentIds.length === 0) {
      // Show error: No shipments selected
      return;
    }

    if (shipmentIds.length > 10) {
      // Show error: Too many shipments selected
      return;
    }

    onPrint({
      type: selectedProvider.value,
      copyTypes: selectedCopy,
    });
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
        
        <div className={styles.header}>
          {t('PRINT_LR.title')}
          <CloseIcon className={styles.closeIcon} onClick={onClose} />
        </div>
        
        <DialogContent className={styles.section}>
          <div className={styles.inputContainer}>
            <div className={styles.title}>
              {t('PRINT_LR.type_of_copy')}<span className={styles.required}>*</span>
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
                  <span>{t('PRINT_LR.select_all')}</span>
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
              {t('PRINT_LR.provided_by')}<span className={styles.required}>*</span>
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
              {t('PRINT_LR.submit')}
            </button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

export default PrintLRModal;
