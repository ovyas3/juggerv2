import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Define the BillTo data interface
export interface BillToData {
  invoiceNumber: string;
  grossWeight: string | number;
  billTo: string;
  [key: string]: any; // for additional properties
}

interface BillToTabProps {
  billToData: BillToData[];
  loading: boolean;
  isTechnova?: boolean;
  getDeliveryInfo?: (index: number) => string;
}

const BillToTab: React.FC<BillToTabProps> = ({
  billToData = [],
  loading = false,
  isTechnova = false,
  getDeliveryInfo = (index) => `Delivery ${index + 1}`,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Define table columns
  const columns = [
    { id: 'invoiceNumber', label: t('shipment.invoiceNumber') },
    { id: 'grossWeight', label: t('shipment.grossWeight') },
    { id: 'billTo', label: t('shipment.billTo') },
  ];

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Show empty state if not Technova or no bill data
  if (!isTechnova) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="h6" color="textSecondary">
          {t('shipment.billToNotAvailable')}
        </Typography>
      </Box>
    );
  }

  // Show empty state if no bill data
  if (billToData.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <ReceiptIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {t('shipment.noBillToData')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('shipment.noBillToDataDescription')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <ReceiptIcon color="primary" sx={{ mr: 1 }} />
        {t('shipment.billTo')}
      </Typography>
      
      {billToData.map((invoiceGroup, index) => (
        <Box key={index} mb={4}>
          <Box display="flex" alignItems="center" mb={2}>
            <Box 
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                mr: 1,
              }}
            >
              {index + 1}
            </Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {getDeliveryInfo(index)}
            </Typography>
          </Box>
          
          <Paper variant="outlined" sx={{ mb: 4, overflow: 'hidden' }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell 
                        key={column.id}
                        sx={{ 
                          fontWeight: 'bold',
                          backgroundColor: theme.palette.grey[100],
                          color: theme.palette.text.primary,
                          textAlign: 'center',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          py: 1.5,
                        }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell 
                        key={column.id}
                        sx={{ 
                          textAlign: 'center',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          py: 1.5,
                        }}
                      >
                        {invoiceGroup[column.id] || '--'}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default BillToTab;
