import React, { useState } from 'react';
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
  TableSortLabel,
  TablePagination,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  CloudDownload as CloudDownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface LorryReceipt {
  _id: string;
  type: 'Carrier' | 'Customer' | 'Technova' | 'FWB' | 'CWB';
  pick: string;
  drop: string;
  name: string;
  lr_number: string;
  status?: string;
  FWB?: {
    manual?: string;
    custom?: string;
    default: string;
  };
  CWB?: {
    manual?: string;
    custom?: string;
    default: string;
  };
  consignor_copy?: string;
  consignee_copy?: string;
  invoice_info?: {
    invoice: Array<{ num: string }>;
  };
  pdf_link?: string;
  documents?: Array<{
    url: string;
    type: string;
    name?: string;
  }>;
}

interface LRTabProps {
  lorryReceipts: LorryReceipt[];
  loading: boolean;
  ownFleet: boolean;
  shipmentStatus: string;
  roles: {
    owner: boolean;
    fleet: boolean;
    fleet_admin: boolean;
    unit_admin: boolean;
    shipment: boolean;
  };
  onRefresh: () => void;
  onUpdateLR: (lrId: string, newValue: string, index: number) => void;
  onUpdateCWS: (lrId: string, index: number) => void;
  onDownloadDocument: (url: string, fileName?: string) => void;
  onDownloadAllImages: (documents: any[], isLR: boolean) => void;
  onUploadDocument: (lrId: string, file: File, type: string) => void;
}

const LRTab: React.FC<LRTabProps> = ({
  lorryReceipts = [],
  loading = false,
  ownFleet = false,
  shipmentStatus = '',
  roles = {
    owner: false,
    fleet: false,
    fleet_admin: false,
    unit_admin: false,
    shipment: false,
  },
  onRefresh,
  onUpdateLR,
  onUpdateCWS,
  onDownloadDocument,
  onDownloadAllImages,
  onUploadDocument,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingLR, setEditingLR] = useState<{id: string | null, index: number, value: string}>({ id: null, index: -1, value: '' });
  const [selectedDocuments, setSelectedDocuments] = useState<{lrId: string, documents: any[]} | null>(null);
  const [documentToUpload, setDocumentToUpload] = useState<{lrId: string, type: string, file: File | null} | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditLR = (lr: LorryReceipt, index: number) => {
    let lrNumber = '';
    if (lr.FWB) {
      lrNumber = lr.FWB.manual || lr.FWB.custom || lr.FWB.default;
    } else if (lr.CWB) {
      lrNumber = lr.CWB.manual || lr.CWB.custom || lr.CWB.default;
    } else {
      lrNumber = lr.lr_number || '';
    }
    setEditingLR({ id: lr._id, index, value: lrNumber });
  };

  const handleSaveLR = (index: number) => {
    if (editingLR.id) {
      onUpdateLR(editingLR.id, editingLR.value, index);
      setEditingLR({ id: null, index: -1, value: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditingLR({ id: null, index: -1, value: '' });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, lrId: string, type: string) => {
    if (event.target.files && event.target.files.length > 0) {
      setDocumentToUpload({
        lrId,
        type,
        file: event.target.files[0]
      });
    }
  };

  const handleUploadDocument = () => {
    if (documentToUpload && documentToUpload.file) {
      onUploadDocument(
        documentToUpload.lrId,
        documentToUpload.file,
        documentToUpload.type
      );
      setDocumentToUpload(null);
      setFileInputKey(prev => prev + 1);
    }
  };

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return <PdfIcon />;
    if (type.includes('image')) return <ImageIcon />;
    return <FileIcon />;
  };

  const isEditable = (lr: LorryReceipt) => {
    if (shipmentStatus === 'Completed' || shipmentStatus === 'Cancelled') {
      return false;
    }
    
    if (lr.type === 'FWB') {
      return true;
    }
    
    if (lr.type === 'CWB') {
      return ownFleet && roles.owner || roles.fleet_admin;
    }
    
    return false;
  };

  const renderLRNumber = (lr: LorryReceipt, index: number) => {
    if (editingLR.id === lr._id) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            value={editingLR.value}
            onChange={(e) => setEditingLR({ ...editingLR, value: e.target.value })}
            autoFocus
          />
          <IconButton size="small" color="primary" onClick={() => handleSaveLR(index)}>
            <CheckIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={handleCancelEdit}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      );
    }

    let lrNumber = lr.lr_number || '-';
    let downloadLinks = [];

    if (lr.FWB) {
      lrNumber = lr.FWB.manual || lr.FWB.custom || lr.FWB.default || '-';
      if (lr.pdf_link) {
        downloadLinks.push({
          label: t('shipment.downloadFWB'),
          url: lr.pdf_link
        });
      }
    } else if (lr.CWB) {
      lrNumber = lr.CWB.manual || lr.CWB.custom || lr.CWB.default || '-';
      if (lr.consignor_copy) {
        const fileName = lr.invoice_info?.invoice?.[0]?.num 
          ? `${lr.invoice_info.invoice[0].num}-${t('shipment.downloadCWB_consignor')}`
          : t('shipment.downloadCWB_consignor');
        downloadLinks.push({
          label: t('shipment.downloadCWB_consignor'),
          url: lr.consignor_copy,
          fileName
        });
      }
      if (lr.consignee_copy) {
        const fileName = lr.invoice_info?.invoice?.[0]?.num 
          ? `${lr.invoice_info.invoice[0].num}-${t('shipment.downloadCWB_consignee')}`
          : t('shipment.downloadCWB_consignee');
        downloadLinks.push({
          label: t('shipment.downloadCWB_consignee'),
          url: lr.consignee_copy,
          fileName
        });
      }
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>{lrNumber}</span>
          {isEditable(lr) && (
            <IconButton 
              size="small" 
              onClick={() => handleEditLR(lr, index)}
              sx={{ p: 0.5 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        {downloadLinks.map((link, idx) => (
          <Button
            key={idx}
            size="small"
            startIcon={<CloudDownloadIcon fontSize="small" />}
            onClick={() => onDownloadDocument(link.url, link.fileName)}
            sx={{ 
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '0.75rem',
              p: 0,
              minWidth: 'auto',
              color: 'text.secondary'
            }}
          >
            {link.label}
          </Button>
        ))}
      </Box>
    );
  };

  const columns = ownFleet 
    ? ['pick', 'drop', 'lr_number'] 
    : ['pick', 'drop', 'name', 'lr_number'];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('shipment.lorryReceipts')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : lorryReceipts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('shipment.noLorryReceipts')}
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {t(`shipment.${column}`)}
                    </TableCell>
                  ))}
                  <TableCell>{t('common.documents')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lorryReceipts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((lr, index) => (
                    <TableRow key={lr._id} hover>
                      <TableCell>{lr.pick || '-'}</TableCell>
                      <TableCell>{lr.drop || '-'}</TableCell>
                      {!ownFleet && <TableCell>{lr.name || '-'}</TableCell>}
                      <TableCell>{renderLRNumber(lr, index)}</TableCell>
                      <TableCell>
                        {lr.documents && lr.documents.length > 0 ? (
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {lr.documents.map((doc, docIndex) => (
                              <Chip
                                key={docIndex}
                                icon={getDocumentIcon(doc.type)}
                                label={doc.name || doc.type}
                                onClick={() => onDownloadDocument(doc.url, doc.name)}
                                sx={{ cursor: 'pointer' }}
                              />
                            ))}
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => onDownloadAllImages(lr.documents || [], true)}
                            >
                              {t('common.downloadAll')}
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            startIcon={<CloudDownloadIcon />}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*,.pdf';
                              input.onchange = (e) => handleFileChange(e as any, lr._id, 'lr_document');
                              input.click();
                            }}
                          >
                            {t('common.uploadDocument')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={lorryReceipts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Document Upload Dialog */}
      <Dialog
        open={!!documentToUpload}
        onClose={() => setDocumentToUpload(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('shipment.uploadDocument')}</DialogTitle>
        <DialogContent>
          <input
            key={fileInputKey}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              if (documentToUpload) {
                handleFileChange(e, documentToUpload.lrId, documentToUpload.type);
              }
            }}
            style={{ display: 'none' }}
            id="lr-document-upload"
          />
          <label htmlFor="lr-document-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              startIcon={<CloudDownloadIcon />}
              sx={{ mb: 2 }}
            >
              {documentToUpload?.file?.name || t('common.selectFile')}
            </Button>
          </label>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentToUpload(null)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleUploadDocument}
            variant="contained"
            disabled={!documentToUpload?.file}
          >
            {t('common.upload')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LRTab;
