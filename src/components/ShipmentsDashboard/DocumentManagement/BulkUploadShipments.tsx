import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Box, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CircularProgress,
  IconButton,
  styled
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { httpsPost, httpsGet } from '@/utils/Communication';
import { useSnackbar } from "@/hooks/snackBar";
import CloseIcon from '@mui/icons-material/Close';

export interface Organization {
  _id: string;
  name: string;
  id?: string;
}

interface BulkUploadShipmentsProps {
  open: boolean;
  onClose: () => void;
  type: 'order' | 'shipment' | 'commercial_invoice' | 'commercial_invoice_Tcode';
  onSuccess: () => void;
}

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#2962FF',
  color: 'white',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 16px',
  '& .MuiTypography-root': {
    fontSize: '16px',
    fontWeight: 400,
  },
}));

const BulkUploadShipments: React.FC<BulkUploadShipmentsProps> = ({ 
  open, 
  onClose, 
  type, 
  onSuccess 
}) => {
   const { showMessage } = useSnackbar();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shipperType, setShipperType] = useState<string>('normal');

  const sampleLinks = {
    order: 'https://docs.google.com/spreadsheets/d/1RtK3Y96Y8FjimQ0nlRXwmCfLKyzdDWJfaz4srpnFxvs/edit?usp=sharing',
    shipment: 'https://docs.google.com/spreadsheets/d/1RFcx3RJbKI1qZ6OQ_WW-d2UKjffDx9RR-uXw1JPNhdY/edit#gid=182892430',
    commercial_invoice: 'https://docs.google.com/spreadsheets/d/1dapcJ4y5hE_3TMwMdkQVs9OwPilNcqkJiDqJQV1ewLY/edit?usp=sharing',
    commercial_invoice_Tcode: 'https://docs.google.com/spreadsheets/d/1dapcJ4y5hE_3TMwMdkQVs9OwPilNcqkJiDqJQV1ewLY/edit?usp=sharing'
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
    },
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (type !== 'commercial_invoice' && type !== 'commercial_invoice_Tcode') {
        setIsLoading(true);
        try {
          const response = await httpsGet('shipper_pref', 0);
          if (response.data?.organizations?.length) {
            setOrganizations(response.data.organizations);
            if (shipperType !== '4pl' && response.data.organizations[0]) {
              setSelectedOrganization(response.data.organizations[0]);
            }
          }
        } catch (error) {
          console.error('Error fetching organizations:', error);
          showMessage('Failed to load organizations', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    // Get shipper type from localStorage
    const typeData = JSON.parse(localStorage.getItem('shippers') || '[]');
    if (typeData[0]?.type) {
      setShipperType(typeData[0].type);
    }

    fetchOrganizations();
  }, [type]);

  const validate = (): boolean => {
    if (type !== 'commercial_invoice' && type !== 'commercial_invoice_Tcode' && !selectedOrganization) {
      showMessage('Please select an organization', 'error');
      return false;
    }
    
    if (!file) {
      showMessage('Please select a file to upload', 'error');
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!validate()) return;

    const formData = new FormData();
    let url = '';
    let apiUrl = ''; // Will be set based on the environment

    // Set the appropriate API URL based on the environment
    if (process.env.NODE_ENV === 'production') {
      apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    } else {
      apiUrl = process.env.NEXT_PUBLIC_API_URL_DEV || '';
    }

    // Check if file exists before proceeding
    if (!file) {
      showMessage('No file selected', 'error');
      return;
    }

    // Set the appropriate endpoint and form data based on the upload type
    if (type === 'order') {
      formData.append('orders', file);
      url = `v2/shipment/create_bulk/${selectedOrganization?._id}`;
    } else if (type === 'shipment') {
      formData.append('shipments', file);
      formData.append('organization', selectedOrganization?._id || '');
      url = 'shipment/create_bulk';
    } else if (type === 'commercial_invoice') {
      formData.append('commercial_invoices', file);
      url = 'v1/update_commercial_invoices/bulk';
    } else if (type === 'commercial_invoice_Tcode') {
      formData.append('commercial_invoices', file);
      url = '/v1/upload_bmwisl_commercial_invoices_tcode/bulk';
    }

    try {
      setIsUploading(true);
      
      // Get the access token and shipper ID from cookies
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1] || '';
        
      const shipperId = document.cookie
        .split('; ')
        .find(row => row.startsWith('shipper_id='))
        ?.split('=')[1] || '';

      // Create headers with authorization
      const headers = {
        'Authorization': `bearer ${accessToken} Shipper ${shipperId}`,
      };

      // Make the request using the httpsPost utility
      const response = await httpsPost(
        url,
        formData,
        { headers }
      );
      
      if (response && response.statusCode === 200) {
        const successMessage = type === 'order' 
          ? 'Bulk order upload completed successfully'
          : type === 'shipment'
          ? 'Bulk shipment upload completed successfully'
          : 'Bulk commercial invoice upload completed successfully';
          
        showMessage(successMessage, 'success');
        onSuccess();
        onClose();
      } else {
        showMessage(response?.message || 'Failed to process the file', 'error');
      }
    } catch (error: any) {
      console.error('Error during bulk upload:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        // Handle unauthorized access (e.g., token expired)
        showMessage('Your session has expired. Please login again.', 'error');
        // Redirect to login or refresh token logic here
      } else {
        // Show the error message from the server or a generic message
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to process the file. Please check the format and try again.';
        
        showMessage(errorMessage, 'error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setSelectedOrganization(organizations[0] || null);
    onClose();
  };

  const getUploadButtonText = () => {
    if (isUploading) return 'Processing...';
    return 'Upload';
  };

  const getSampleLinkText = () => {
    switch (type) {
      case 'order':
        return 'Download Order Sample';
      case 'shipment':
        return 'Download Shipment Sample';
      case 'commercial_invoice':
      case 'commercial_invoice_Tcode':
        return 'Download Commercial Invoice Sample';
      default:
        return 'Download Sample';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        style: {
          minHeight: '50vh',
          maxHeight: '80vh',
        },
      }}
    >
      <StyledDialogTitle>
        Bulk Upload {type.replace(/_/g, ' ').replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1))}
        <IconButton onClick={handleClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <DialogContent sx={{ p: 2 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {(type !== 'commercial_invoice' && type !== 'commercial_invoice_Tcode') && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="organization-select-label">Select Organization *</InputLabel>
                <Select
                  labelId="organization-select-label"
                  value={selectedOrganization?._id || ''}
                  label="Select Organization *"
                  onChange={(e) => {
                    const org = organizations.find(o => o._id === e.target.value);
                    if (org) setSelectedOrganization(org);
                  }}
                  disabled={isUploading}
                >
                  {organizations.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 1,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
                mb: 2,
              }}
            >
              <input {...getInputProps()} />
              <Typography variant="body1">
                {file ? (
                  file.name
                ) : isDragActive ? (
                  'Drop the file here'
                ) : (
                  'Drag and drop a file here, or click to select a file'
                )}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Supported formats: .xlsx, .xls, .csv
              </Typography>
            </Box>

            <Box textAlign="center" mb={2}>
              <Typography variant="body2" color="textSecondary">
                <a 
                  href={sampleLinks[type]} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#2962FF', textDecoration: 'none' }}
                  download
                >
                  {getSampleLinkText()}
                </a>
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          disabled={isUploading}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpload} 
          color="primary" 
          variant="contained"
          disabled={!file || isUploading}
          startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            backgroundColor: '#E54131',
            '&:hover': {
              backgroundColor: '#c62828',
            },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {getUploadButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkUploadShipments;
