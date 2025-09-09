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
  FormHelperText,
  useTheme,
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
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Pickup, Document } from '../types';

interface PickupTabProps {
  pickups: Pickup[];
  formatDate: (dateString: string, formatStr?: string) => string;
  onRefresh: () => void;
  onDocumentUpload: (pickupId: string, file: File, type: string) => Promise<void>;
  onDocumentDelete: (pickupId: string, documentId: string) => Promise<void>;
  onStatusUpdate: (pickupId: string, status: string, notes?: string) => Promise<void>;
  onAddNotes: (pickupId: string, notes: string) => Promise<void>;
  roles: {
    owner: boolean;
    fleet: boolean;
    fleet_admin: boolean;
    unit_admin: boolean;
    shipment: boolean;
  };
}

const PickupTab: React.FC<PickupTabProps> = ({
  pickups = [],
  formatDate,
  onRefresh,
  onDocumentUpload,
  onDocumentDelete,
  onStatusUpdate,
  onAddNotes,
  roles,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{pickupId: string; doc: Document} | null>(null);
  const [documentToUpload, setDocumentToUpload] = useState<{pickupId: string; type: string; file: File | null} | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{pickupId: string; status: string; notes: string} | null>(null);
  const [notes, setNotes] = useState<{pickupId: string; notes: string} | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, pickupId: string, type: string) => {
    if (event.target.files && event.target.files.length > 0) {
      setDocumentToUpload({
        pickupId,
        type,
        file: event.target.files[0]
      });
    }
  };

  const handleUploadDocument = async () => {
    if (documentToUpload && documentToUpload.file) {
      await onDocumentUpload(
        documentToUpload.pickupId,
        documentToUpload.file,
        documentToUpload.type
      );
      setDocumentToUpload(null);
      setFileInputKey(prev => prev + 1);
    }
  };

  const handleDeleteDocument = async () => {
    if (documentToDelete) {
      await onDocumentDelete(documentToDelete.pickupId, documentToDelete.doc._id);
      setDocumentToDelete(null);
    }
  };

  const handleStatusUpdate = async () => {
    if (statusUpdate) {
      await onStatusUpdate(statusUpdate.pickupId, statusUpdate.status, statusUpdate.notes);
      setStatusUpdate(null);
    }
  };

  const handleSaveNotes = async () => {
    if (notes) {
      await onAddNotes(notes.pickupId, notes.notes);
      setNotes(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in_progress':
      case 'in_transit':
      case 'picked_up':
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

  const renderPickupCard = (pickup: Pickup, index: number) => {
    const documentsByType: Record<string, Document[]> = {};
    
    pickup.documents?.forEach(doc => {
      if (!documentsByType[doc.type]) {
        documentsByType[doc.type] = [];
      }
      documentsByType[doc.type].push(doc);
    });

    return (
      <Paper key={pickup._id} elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
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
              {t('shipment.pickup')} {index + 1}
              {pickup.location?.name && ` • ${pickup.location.name}`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <TimeIcon color="action" fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {formatDate(pickup.scheduled_date, 'PPpp')}
              </Typography>
            </Box>
          </Box>
          <Box>
            <Chip 
              label={t(`status.${pickup.status}`)} 
              size="small" 
              color={getStatusColor(pickup.status) as any}
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
                <strong>{t('common.name')}:</strong> {pickup.location?.name || t('common.notAvailable')}
              </Typography>
              <Typography variant="body2">
                <strong>{t('common.address')}:</strong> {pickup.location?.address || t('common.notAvailable')}
              </Typography>
              {pickup.location?.contact_person && (
                <Typography variant="body2">
                  <strong>{t('common.contact')}:</strong> {pickup.location.contact_person}
                  {pickup.location.contact_number && ` (${pickup.location.contact_number})`}
                </Typography>
              )}
              {pickup.notes && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    "{pickup.notes}"
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Documents */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('common.documents')}
              </Typography>
              {roles.owner || roles.fleet_admin ? (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setSelectedPickup(pickup)}
                >
                  {t('common.addDocument')}
                </Button>
              ) : null}
            </Box>
            
            {Object.entries(documentsByType).length > 0 ? (
              <Box sx={{ ml: 1 }}>
                {Object.entries(documentsByType).map(([type, docs]) => (
                  <Box key={type} sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {t(`documentTypes.${type}`)} ({docs.length})
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {docs.map(doc => (
                        <Chip
                          key={doc._id}
                          icon={getDocumentIcon(doc.type)}
                          label={doc.name || doc.type}
                          onClick={() => window.open(doc.url, '_blank')}
                          onDelete={(e) => {
                            e.stopPropagation();
                            setDocumentToDelete({ pickupId: pickup._id, doc });
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
                  onClick={() => setSelectedPickup(pickup)}
                >
                  {t('common.uploadNow')}
                </Button>
              </Box>
            )}
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Button 
                size="small" 
                startIcon={<EditIcon />}
                onClick={() => setNotes({ pickupId: pickup._id, notes: pickup.notes || '' })}
              >
                {t('common.addNotes')}
              </Button>
            </Box>
            <Box>
              <Button 
                variant="contained" 
                size="small" 
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={() => setStatusUpdate({ 
                  pickupId: pickup._id, 
                  status: pickup.status === 'completed' ? 'in_progress' : 'completed',
                  notes: ''
                })}
              >
                {pickup.status === 'completed' 
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
          {t('shipment.pickupDetails')}
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

      {pickups.length > 0 ? (
        <Box>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            {pickups.map((pickup, index) => (
              <Tab 
                key={pickup._id} 
                label={`${t('shipment.pickup')} ${index + 1}`} 
                iconPosition="start"
                icon={
                  <Chip 
                    label={pickup.documents?.length || 0}
                    size="small"
                    color="primary"
                    sx={{ minWidth: 20, height: 20, fontSize: '0.7rem' }}
                  />
                }
              />
            ))}
          </Tabs>
          
          {pickups.map((pickup, index) => (
            <Box key={pickup._id} sx={{ display: activeTab === index ? 'block' : 'none' }}>
              {renderPickupCard(pickup, index)}
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
            {t('shipment.noPickupsScheduled')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('shipment.noPickupsDescription')}
          </Typography>
        </Box>
      )}

      {/* Document Upload Dialog */}
      <Dialog 
        open={!!selectedPickup} 
        onClose={() => setSelectedPickup(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('shipment.uploadDocument')}
          <IconButton
            aria-label="close"
            onClick={() => setSelectedPickup(null)}
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
            onChange={(e) => selectedPickup && handleFileChange(e, selectedPickup._id, 'pickup_document')}
            style={{ display: 'none' }}
            id="pickup-document-upload"
          />
          <label htmlFor="pickup-document-upload">
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
              onChange={(e) => selectedPickup && setDocumentToUpload({
                pickupId: selectedPickup._id,
                type: e.target.value,
                file: documentToUpload?.file || null
              })}
            >
              <MenuItem value="pod">{t('documentTypes.pod')}</MenuItem>
              <MenuItem value="invoice">{t('documentTypes.invoice')}</MenuItem>
              <MenuItem value="permit">{t('documentTypes.permit')}</MenuItem>
              <MenuItem value="other">{t('common.other')}</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPickup(null)}>{t('common.cancel')}</Button>
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
    </Box>
  );
};

export default PickupTab;
