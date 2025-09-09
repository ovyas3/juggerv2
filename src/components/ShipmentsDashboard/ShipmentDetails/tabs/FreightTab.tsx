import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
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
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  IconButton,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface FreightInvoice {
  _id: string;
  version_id: number;
  invoice: string;
  datetime: string;
  updated_by: string;
  finalAmount: number;
  status: 'PENDING' | 'APPROVED' | 'DISAPPROVED';
  comment: string;
  view: string;
  action: string;
  freight: boolean;
  role_based: boolean;
}

interface FreightTabProps {
  freightInvoices: FreightInvoice[];
  loading: boolean;
  currencySymbol: string;
  roles: {
    owner: boolean;
    fleet: boolean;
    fleet_admin: boolean;
    unit_admin: boolean;
    shipment: boolean;
  };
  onRefresh: () => void;
  onApprove: (invoice: FreightInvoice) => void;
  onDisapprove: (invoice: FreightInvoice) => void;
  onViewDetails: (invoice: FreightInvoice) => void;
  onDownload: (invoice: FreightInvoice) => void;
  onEdit: (invoice: FreightInvoice) => void;
  onDelete: (invoice: FreightInvoice) => void;
  onAddNew: () => void;
  onRegenerate: () => void;
  onGenerateInvoice: () => void;
  disableGenerateInvoice: boolean;
}

const FreightTab: React.FC<FreightTabProps> = ({
  freightInvoices = [],
  loading = false,
  currencySymbol = '₹',
  roles = {
    owner: false,
    fleet: false,
    fleet_admin: false,
    unit_admin: false,
    shipment: false,
  },
  onRefresh,
  onApprove,
  onDisapprove,
  onViewDetails,
  onDownload,
  onEdit,
  onDelete,
  onAddNew,
  onRegenerate,
  onGenerateInvoice,
  disableGenerateInvoice = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof FreightInvoice>('datetime');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedInvoice, setSelectedInvoice] = useState<FreightInvoice | null>(null);
  const [disapproveReason, setDisapproveReason] = useState('');
  const [freightType, setFreightType] = useState<'estimated' | 'actual'>('estimated');

  const handleRequestSort = (property: keyof FreightInvoice) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFreightTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'estimated' | 'actual'
  ) => {
    if (newType !== null) {
      setFreightType(newType);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'DISAPPROVED':
        return 'error';
      default:
        return 'default';
    }
  };

  const sortedInvoices = [...freightInvoices].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - freightInvoices.length) : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('shipment.freightDetails')}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            sx={{ mr: 1 }}
          >
            {t('common.refresh')}
          </Button>
          {(roles.owner || roles.unit_admin) && (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddNew}
              sx={{ mr: 1 }}
            >
              {t('common.addNew')}
            </Button>
          )}
          {!disableGenerateInvoice && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<MoneyIcon />}
              onClick={onGenerateInvoice}
            >
              {t('shipment.generateInvoice')}
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mr: 2 }}>
            {t('shipment.freightType')}:
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={freightType}
            exclusive
            onChange={handleFreightTypeChange}
            aria-label="freight type"
            size="small"
          >
            <ToggleButton value="estimated">
              {t('shipment.estimated')}
            </ToggleButton>
            <ToggleButton value="actual">
              {t('shipment.actual')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'version_id'}
                  direction={orderBy === 'version_id' ? order : 'asc'}
                  onClick={() => handleRequestSort('version_id')}
                >
                  {t('shipment.versionId')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'invoice'}
                  direction={orderBy === 'invoice' ? order : 'asc'}
                  onClick={() => handleRequestSort('invoice')}
                >
                  {t('shipment.invoice')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'datetime'}
                  direction={orderBy === 'datetime' ? order : 'desc'}
                  onClick={() => handleRequestSort('datetime')}
                >
                  {t('common.dateTime')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'updated_by'}
                  direction={orderBy === 'updated_by' ? order : 'asc'}
                  onClick={() => handleRequestSort('updated_by')}
                >
                  {t('common.updatedBy')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'finalAmount'}
                  direction={orderBy === 'finalAmount' ? order : 'asc'}
                  onClick={() => handleRequestSort('finalAmount')}
                >
                  {t('shipment.amount')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  {t('common.status')}
                </TableSortLabel>
              </TableCell>
              <TableCell>{t('common.comment')}</TableCell>
              <TableCell>{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {t('common.loading')}...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : sortedInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="textSecondary">
                    {t('shipment.noFreightInvoices')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sortedInvoices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((invoice) => (
                  <TableRow key={invoice._id} hover>
                    <TableCell>{invoice.version_id}</TableCell>
                    <TableCell>{invoice.invoice}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.datetime), 'PPpp')}
                    </TableCell>
                    <TableCell>{invoice.updated_by}</TableCell>
                    <TableCell align="right">
                      {currencySymbol} {invoice.finalAmount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`status.${invoice.status.toLowerCase()}`)}
                        color={getStatusColor(invoice.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={invoice.comment || t('common.noComment')}>
                        <Typography noWrap sx={{ maxWidth: 200 }}>
                          {invoice.comment || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={t('common.viewDetails')}>
                          <IconButton
                            size="small"
                            onClick={() => onViewDetails(invoice)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {invoice.status === 'PENDING' && (
                          <>
                            <Tooltip title={t('common.approve')}>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => onApprove(invoice)}
                                disabled={!invoice.freight}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('common.disapprove')}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setDisapproveReason('');
                                }}
                                disabled={!invoice.freight}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title={t('common.download')}>
                          <IconButton
                            size="small"
                            onClick={() => onDownload(invoice)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {invoice.status === 'PENDING' && (
                          <Tooltip title={t('common.edit')}>
                            <IconButton
                              size="small"
                              onClick={() => onEdit(invoice)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {invoice.status === 'PENDING' && (
                          <Tooltip title={t('common.delete')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onDelete(invoice)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={8} />
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={freightInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Disapprove Reason Dialog */}
      <Dialog
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('shipment.disapproveFreight')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('common.reason')}
            type="text"
            fullWidth
            multiline
            rows={4}
            value={disapproveReason}
            onChange={(e) => setDisapproveReason(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedInvoice(null)} color="primary">
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => {
              if (selectedInvoice) {
                onDisapprove({ ...selectedInvoice, comment: disapproveReason });
                setSelectedInvoice(null);
              }
            }}
            color="error"
            variant="contained"
            disabled={!disapproveReason.trim()}
          >
            {t('common.disapprove')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FreightTab;
