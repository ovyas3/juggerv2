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
  useTheme,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InfoIcon from '@mui/icons-material/Info';

export interface Material {
  id?: string;
  sku: string;
  description: string;
  quantity: number;
  uom: string;
  customer_order_number?: string;
  customer_name?: string;
  [key: string]: any; // for additional properties
}

export interface CustomerMaterial {
  customer_order_number: string;
  customer_name: string;
  materials: Material[];
  [key: string]: any; // for additional properties
}

export interface CustomerData {
  delivery: string | number;
  name: string;
  customer_materials: CustomerMaterial[];
  [key: string]: any; // for additional properties
}

interface MaterialsTabProps {
  customerData: CustomerData[];
  loading: boolean;
  isRSPL: boolean;
  commercialInvoices?: Array<{
    num: string;
    materials?: Material[];
    others?: {
      sold_to_code: string;
      sold_to_contact_name: string;
      [key: string]: any;
    };
    [key: string]: any;
  }>;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({
  customerData = [],
  loading = false,
  isRSPL = false,
  commercialInvoices = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (isRSPL && commercialInvoices.length > 0) {
    return (
      <Box p={3}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          {t('shipment.productDescription')}
        </Typography>
        
        {commercialInvoices.map((invoice, index) => (
          <Accordion key={index} defaultExpanded={index === 0} sx={{ mb: 2, boxShadow: 1 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              sx={{
                backgroundColor: theme.palette.grey[100],
                '&:hover': { backgroundColor: theme.palette.grey[200] },
              }}
            >
              <Box display="flex" alignItems="center" width="100%">
                <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                <Typography sx={{ fontWeight: 500 }}>
                  {index + 1}) {t('shipment.referenceNumber')}: {invoice.num}
                </Typography>
                {invoice.others && (
                  <Chip
                    label={`${invoice.others.sold_to_code} - ${invoice.others.sold_to_contact_name}`}
                    size="small"
                    sx={{ ml: 2 }}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {invoice.materials && invoice.materials.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>{t('shipment.description')}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('shipment.quantity')}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('shipment.uom')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoice.materials.map((material, matIndex) => (
                        <TableRow
                          key={matIndex}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {material.description}
                          </TableCell>
                          <TableCell align="right">{material.quantity}</TableCell>
                          <TableCell align="right">{material.uom}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box display="flex" alignItems="center" p={2} color="text.secondary">
                  <InfoIcon sx={{ mr: 1 }} />
                  <Typography>{t('shipment.noMaterialsFound')}</Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }

  if (customerData.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <InfoIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {t('shipment.noCustomerData')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('shipment.noCustomerDataDescription')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        {t('shipment.productDescription')}
      </Typography>
      
      {customerData.map((customer, index) => (
        <Accordion key={index} defaultExpanded={index === 0} sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${index}-content`}
            id={`panel${index}-header`}
            sx={{
              backgroundColor: theme.palette.grey[100],
              '&:hover': { backgroundColor: theme.palette.grey[200] },
            }}
          >
            <Box display="flex" alignItems="center">
              <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
              <Box>
                <Typography sx={{ fontWeight: 500 }}>
                  D{customer.delivery} - {customer.name}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {customer.customer_materials && customer.customer_materials.length > 0 ? (
              customer.customer_materials.map((custMaterial, custIndex) => (
                <Box key={custIndex} mb={2}>
                  <Box mb={1}>
                    <Typography variant="subtitle2" color="primary">
                      {t('shipment.referenceNumber')}: {custMaterial.customer_order_number} - {custMaterial.customer_name}
                    </Typography>
                  </Box>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>{t('shipment.description')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('shipment.quantity')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{t('shipment.uom')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {custMaterial.materials.map((material, matIndex) => (
                          <TableRow
                            key={matIndex}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">
                              {material.description}
                            </TableCell>
                            <TableCell align="right">{material.quantity}</TableCell>
                            <TableCell align="right">{material.uom}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {custIndex < customer.customer_materials.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))
            ) : (
              <Box display="flex" alignItems="center" p={2} color="text.secondary">
                <InfoIcon sx={{ mr: 1 }} />
                <Typography>{t('shipment.noMaterialsFound')}</Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default MaterialsTab;
