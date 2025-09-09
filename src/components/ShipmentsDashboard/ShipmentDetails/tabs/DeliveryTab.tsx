import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Divider,
  Paper,
  Button,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Delivery, Document } from '../types';

interface DeliveryTabProps {
  deliveries: Delivery[];
  formatDate: (dateString: string, formatStr?: string) => string;
  onRefresh: () => void;
  onDocumentUpload: (deliveryId: string, file: File, type: string) => Promise<void>;
  onDocumentDelete: (deliveryId: string, documentId: string) => Promise<void>;
  onStatusUpdate: (deliveryId: string, status: string, notes?: string) => Promise<void>;
  onAddNotes: (deliveryId: string, notes: string) => Promise<void>;
  onAddInvoice: (deliveryId: string, invoiceData: any) => Promise<void>;
  roles: {
    owner: boolean;
    fleet: boolean;
    fleet_admin: boolean;
    unit_admin: boolean;
    shipment: boolean;
  };
}

const DeliveryTab: React.FC<DeliveryTabProps> = ({
  deliveries = [],
  formatDate,
  onRefresh,
  onDocumentUpload,
  onDocumentDelete,
  onStatusUpdate,
  onAddNotes,
  onAddInvoice,
  roles,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{deliveryId: string; doc: Document} | null>(null);
  const [documentToUpload, setDocumentToUpload] = useState<{deliveryId: string; type: string; file: File | null} | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{deliveryId: string; status: string; notes: string} | null>(null);
  const [notes, setNotes] = useState<{deliveryId: string; notes: string} | null>(null);
  const [newInvoice, setNewInvoice] = useState<{deliveryId: string; data: any} | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, deliveryId: string, type: string) => {
    if (event.target.files && event.target.files.length > 0) {
      setDocumentToUpload({
        deliveryId,
        type,
        file: event.target.files[0]
      });
    }
  };

  const handleUploadDocument = async () => {
    if (documentToUpload && documentToUpload.file) {
      await onDocumentUpload(
        documentToUpload.deliveryId,
        documentToUpload.file,
        documentToUpload.type
      );
      setDocumentToUpload(null);
      setFileInputKey(prev => prev + 1);
    }
  };

  const handleDeleteDocument = async () => {
    if (documentToDelete) {
      await onDocumentDelete(documentToDelete.deliveryId, documentToDelete.doc._id);
      setDocumentToDelete(null);
    }
  };

  const handleStatusUpdate = async () => {
    if (statusUpdate) {
      await onStatusUpdate(statusUpdate.deliveryId, statusUpdate.status, statusUpdate.notes);
      setStatusUpdate(null);
    }
  };

  const handleSaveNotes = async () => {
    if (notes) {
      await onAddNotes(notes.deliveryId, notes.notes);
      setNotes(null);
    }
  };

  const handleSaveInvoice = async () => {
    if (newInvoice) {
      await onAddInvoice(newInvoice.deliveryId, newInvoice.data);
      setNewInvoice(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
      case 'in_transit':
      case 'delivered':
        return 'info';
      case 'pending':
      case 'scheduled':
        return 'warning';
      case 'delayed':
      case 'cancelled':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return <PdfIcon />;
    if (type.includes('image')) return <ImageIcon />;
    return <FileIcon />;
  };

  const renderInvoiceBadge = (invoices: any[] = []) => {
    const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
    const completedCount = invoices.filter(inv => inv.status === 'completed').length;
    
    return (
      <Tooltip title={`${completedCount} completed, ${pendingCount} pending`}>
        <Badge 
          badgeContent={invoices.length} 
          color={pendingCount > 0 ? 'warning' : 'success'}
          sx={{ ml: 1 }}
        >
          <ReceiptIcon color="action" />
        </Badge>
      </Tooltip>
    );
  };

  const renderDeliveryCard = (delivery: Delivery, index: number) => {
    const documentsByType: Record<string, Document[]> = {};
    
    delivery.documents?.forEach(doc => {
      if (!documentsByType[doc.type]) {
        documentsByType[doc.type] = [];
      }
      documentsByType[doc.type].push(doc);
    });

    return (
      <Paper key={delivery._id} elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 2, 
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              {t('shipment.delivery')} {index + 1}
              {delivery.location?.name && ` • ${delivery.location.name}`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <TimeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(delivery.scheduled_date, 'PPpp')}
              </Typography>
              {delivery.actual_date && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                  <ShippingIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {t('shipment.actual')}: {formatDate(delivery.actual_date, 'PPpp')}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {renderInvoiceBadge(delivery.invoices)}
            <Chip 
              label={t(`status.${delivery.status}`)} 
              size="small" 
              color={getStatusColor(delivery.status) as any}
              sx={{ ml: 1 }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          {/* Location Details */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('shipment.locationDetails')}
            </Typography>
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2">
                <strong>{t('common.name')}:</strong> {delivery.location?.name || t('common.notAvailable')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('common.address')}:</strong> {delivery.location?.address || t('common.notAvailable')}
              </Typography>
              {delivery.location?.contact_person && (
                <Typography variant="body2">
                  <strong>{t('common.contact')}:</strong> {delivery.location.contact_person}
                  {delivery.location.contact_number && ` (${delivery.location.contact_number})`}
                </Typography>
              )}
              {delivery.notes && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    "{delivery.notes}"
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Invoices */}
          {delivery.invoices && delivery.invoices.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('shipment.invoices')} ({delivery.invoices.length})
              </Typography>
              <Box sx={{ ml: 1 }}>
                <Grid container spacing={2}>
                  {delivery.invoices.map((invoice) => (
                    <Grid item xs={12} sm={6} md={4} key={invoice._id}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: 'divider',
                          borderRadius: 1,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': { boxShadow: 1 }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                            {invoice.invoice_number || t('shipment.invoice')}
                          </Typography>
                          <Chip 
                            label={t(`status.${invoice.status}`)} 
                            size="small" 
                            color={getStatusColor(invoice.status) as any}
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {t('common.amount')}: {invoice.amount ? `$${invoice.amount.toFixed(2)}` : t('common.notAvailable')}
                        </Typography>
                        {invoice.date && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatDate(invoice.date, 'PP')}
                          </Typography>
                        )}
                        {invoice.notes && (
                          <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" component="div">
                              {invoice.notes}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          )}

          {/* Documents */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.documents')}
              </Typography>
              {(roles.owner || roles.fleet_admin) && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  {t('common.addDocument')}
                </Button>
              )}
            </Box>
            
            {Object.entries(documentsByType).length > 0 ? (
              <Box sx={{ ml: 1 }}>
                {Object.entries(documentsByType).map(([type, docs]) => (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {t(`documentTypes.${type}`)} ({docs.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {docs.map(doc => (
                        <Chip
                          key={doc._id}
                          icon={getDocumentIcon(doc.type)}
                          label={doc.name || doc.type}
                          onClick={() => window.open(doc.url, '_blank')}
                          onDelete={(e) => {
                            e.stopPropagation();
                            setDocumentToDelete({ deliveryId: delivery._id, doc });
                          }}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' } 
                          }}
                          deleteIcon={<DeleteIcon />}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                p: 3,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                textAlign: 'center',
                bgcolor: 'background.paper'
              }}>
                <UploadIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {t('shipment.noDocumentsUploaded')}
                </Typography>
                <Button 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  {t('common.uploadNow')}
                </Button>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Button 
                size="small" 
                startIcon={<EditIcon />}
                onClick={() => setNotes({ deliveryId: delivery._id, notes: delivery.notes || '' })}
                sx={{ mr: 1 }}
              >
                {t('common.addNotes')}
              </Button>
              {(roles.owner || roles.fleet_admin) && (
                <Button 
                  size="small" 
                  startIcon={<ReceiptIcon />}
                  onClick={() => setNewInvoice({ 
                    deliveryId: delivery._id, 
                    data: { 
                      delivery_id: delivery._id,
                      invoice_number: `INV-${Date.now()}`,
                      date: new Date().toISOString(),
                      amount: 0,
                      status: 'pending',
                      notes: ''
                    } 
                  })}
                >
                  {t('shipment.addInvoice')}
                </Button>
              )}
            </Box>
            <Box>
              <Button 
                variant="contained" 
                size="small" 
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={() => setStatusUpdate({ 
                  deliveryId: delivery._id, 
                  status: delivery.status === 'completed' ? 'in_progress' : 'completed',
                  notes: ''
                })}
              >
                {delivery.status === 'completed' 
                  ? t('actions.markInProgress')
                  : t('actions.markAsCompleted')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('shipment.deliveryDetails')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {deliveries.length > 0 ? (
        <Box>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {deliveries.map((delivery, index) => (
              <Tab 
                key={delivery._id} 
                label={`${t('shipment.delivery')} ${index + 1}`} 
                iconPosition="start"
                icon={
                  <Badge 
                    badgeContent={delivery.documents?.length || 0} 
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <FileIcon />
                  </Badge>
                }
              />
            ))}
          </Tabs>
          
          {deliveries.map((delivery, index) => (
            <Box key={delivery._id} sx={{ display: activeTab === index ? 'block' : 'none' }}>
              {renderDeliveryCard(delivery, index)}
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 300,
          textAlign: 'center',
          p: 3
        }}>
          <InfoIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('shipment.noDeliveriesScheduled')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('shipment.noDeliveriesDescription')}
          </Typography>
        </Box>
      )}

      {/* Document Upload Dialog */}
      <Dialog 
        open={!!selectedDelivery} 
        onClose={() => setSelectedDelivery(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('shipment.uploadDocument')}
          <IconButton
            aria-label="close"
            onClick={() => setSelectedDelivery(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <input
            key={fileInputKey}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={(e) => selectedDelivery && handleFileChange(e, selectedDelivery._id, 'delivery_document')}
            style={{ display: 'none' }}
            id="delivery-document-upload"
          />
          <label htmlFor="delivery-document-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ mb: 2 }}
            >
              {documentToUpload?.file?.name || t('common.selectFile')}
            </Button>
          </label>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="document-type-label">{t('common.documentType')}</InputLabel>
            <Select
              labelId="document-type-label"
              value={documentToUpload?.type || ''}
              label={t('common.documentType')}
              onChange={(e) => selectedDelivery && setDocumentToUpload({
                deliveryId: selectedDelivery._id,
                type: e.target.value,
                file: documentToUpload?.file || null
              })}
            >
              <MenuItem value="pod">{t('documentTypes.pod')}</MenuItem>
              <MenuItem value="invoice">{t('documentTypes.invoice')}</MenuItem>
              <MenuItem value="lading_bill">{t('documentTypes.ladingBill')}</MenuItem>
              <MenuItem value="other">{t('common.other')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDelivery(null)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleUploadDocument} 
            variant="contained"
            disabled={!documentToUpload?.file || !documentToUpload?.type}
          >
            {t('common.upload')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={!!documentToDelete} 
        onClose={() => setDocumentToDelete(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('common.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('shipment.confirmDeleteDocument', { name: documentToDelete?.doc.name || t('common.thisDocument') })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentToDelete(null)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleDeleteDocument} 
            color="error"
            variant="contained"
          >
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog 
        open={!!statusUpdate} 
        onClose={() => setStatusUpdate(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {statusUpdate?.status === 'completed' 
            ? t('shipment.markAsCompleted')
            : t('shipment.markAsInProgress')}
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label={t('common.notes')}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={statusUpdate?.notes || ''}
            onChange={(e) => statusUpdate && setStatusUpdate({
              ...statusUpdate,
              notes: e.target.value
            })}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusUpdate(null)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleStatusUpdate} 
            variant="contained"
            color="primary"
          >
            {t('common.update')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Notes Dialog */}
      <Dialog 
        open={!!notes} 
        onClose={() => setNotes(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('common.addNotes')}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label={t('common.notes')}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={notes?.notes || ''}
            onChange={(e) => notes && setNotes({
              ...notes,
              notes: e.target.value
            })}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotes(null)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleSaveNotes} 
            variant="contained"
            color="primary"
            disabled={!notes?.notes.trim()}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Invoice Dialog */}
      <Dialog 
        open={!!newInvoice} 
        onClose={() => setNewInvoice(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('shipment.addInvoice')}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('shipment.invoiceNumber')}
                fullWidth
                value={newInvoice?.data.invoice_number || ''}
                onChange={(e) => newInvoice && setNewInvoice({
                  ...newInvoice,
                  data: {
                    ...newInvoice.data,
                    invoice_number: e.target.value
                  }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('shipment.invoiceDate')}
                type="date"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                value={newInvoice?.data.date ? newInvoice.data.date.split('T')[0] : ''}
                onChange={(e) => newInvoice && setNewInvoice({
                  ...newInvoice,
                  data: {
                    ...newInvoice.data,
                    date: new Date(e.target.value).toISOString()
                  }
                })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('shipment.amount')}
                type="number"
                fullWidth
                value={newInvoice?.data.amount || ''}
                onChange={(e) => newInvoice && setNewInvoice({
                  ...newInvoice,
                  data: {
                    ...newInvoice.data,
                    amount: parseFloat(e.target.value) || 0
                  }
                })}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="invoice-status-label">{t('common.status')}</InputLabel>
                <Select
                  labelId="invoice-status-label"
                  value={newInvoice?.data.status || 'pending'}
                  label={t('common.status')}
                  onChange={(e) => newInvoice && setNewInvoice({
                    ...newInvoice,
                    data: {
                      ...newInvoice.data,
                      status: e.target.value
                    }
                  })}
                >
                  <MenuItem value="pending">{t('status.pending')}</MenuItem>
                  <MenuItem value="paid">{t('status.paid')}</MenuItem>
                  <MenuItem value="overdue">{t('status.overdue')}</MenuItem>
                  <MenuItem value="cancelled">{t('status.cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('common.notes')}
                multiline
                rows={3}
                fullWidth
                value={newInvoice?.data.notes || ''}
                onChange={(e) => newInvoice && setNewInvoice({
                  ...newInvoice,
                  data: {
                    ...newInvoice.data,
                    notes: e.target.value
                  }
                })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewInvoice(null)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleSaveInvoice} 
            variant="contained"
            color="primary"
            disabled={!newInvoice?.data.invoice_number || !newInvoice?.data.amount}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryTab;
