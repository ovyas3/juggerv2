// src/components/ShipmentsDashboard/SpecialFeatures/DriverExpenses.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, InputLabel, FormControl, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableFooter } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { Add as AddIcon, ContentCopy as ContentCopyIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useSnackbar } from '@/hooks/snackBar';
import { httpsPost } from '@/utils/Communication';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
import styles from './DriverExpenses.module.css';

interface Expense {
  expenseDate: string;
  expenseDateString: Date | null;
  expenseType: string;
  paymentMode: string;
  odometerReading: string;
  expenseAmount: number;
  approvedAmount: number;
  comment?: string;
}

interface DriverExpensesProps {
  open: boolean;
  onClose: () => void;
  shipment: any;
  onSuccess?: () => void;
}

const expenseTypes = [
  { name: 'Toll', value: 'toll' },
  { name: 'Fuel', value: 'fuel' },
  { name: 'Other', value: 'other' }
];

const paymentModes = [
  { name: 'Cash', value: 'cash' },
  { name: 'Fuel Card', value: 'fuel_card' },
  { name: 'Fastag', value: 'fastag' },
  { name: 'Other', value: 'other' }
];

const DriverExpenses: React.FC<DriverExpensesProps> = ({ 
  open, 
  onClose, 
  shipment, 
  onSuccess 
}) => {
  const { showMessage } = useSnackbar();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [showComment, setShowComment] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  useEffect(() => {
    if (open) {
      // Initialize with one empty expense
      addExpense();
      try {
        const shippers = JSON.parse(localStorage.getItem('shippers') || '[]');
        if (shippers.length) {
          setCurrencySymbol(shippers[0]?.country?.currency?.symbol || '₹');
        }
      } catch (e) {
        console.error('Error getting currency symbol:', e);
      }
    }
  }, [open]);

  const addExpense = (index?: number) => {
    const newExpense: Expense = {
      expenseDate: '',
      expenseDateString: null,
      expenseType: '',
      paymentMode: '',
      odometerReading: '',
      expenseAmount: 0,
      approvedAmount: 0,
      comment: ''
    };

    if (index !== undefined) {
      const newExpenses = [...expenses];
      newExpenses.splice(index + 1, 0, { ...newExpenses[index] });
      setExpenses(newExpenses);
    } else {
      setExpenses([...expenses, newExpense]);
    }
  };

  const removeExpense = (index: number) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(newExpenses);
    calculateTotals(newExpenses);
  };

  const handleExpenseChange = (index: number, field: keyof Expense, value: any) => {
    const newExpenses = [...expenses];
    (newExpenses[index] as any)[field] = value;
    
    if (field === 'expenseType' && value === 'other') {
      setShowComment(true);
    }
    
    setExpenses(newExpenses);
    calculateTotals(newExpenses);
  };

  const calculateTotals = (expenseList = expenses) => {
    const expenseTotal = expenseList.reduce((sum, exp) => sum + (exp.expenseAmount || 0), 0);
    const approvedTotal = expenseList.reduce((sum, exp) => sum + (exp.approvedAmount || 0), 0);
    
    setTotalExpense(expenseTotal);
    setTotalApproved(approvedTotal);
  };

  const handleDateChange = (index: number, date: Date | null) => {
    if (!date) return;
    
    const newExpenses = [...expenses];
    newExpenses[index].expenseDateString = date;
    newExpenses[index].expenseDate = date.toISOString();
    setExpenses(newExpenses);
  };

  const validateExpenses = () => {
    for (const [index, exp] of expenses.entries()) {
      if (!exp.expenseDate) {
        showMessage('Expense date is required for all entries', 'error');
        return false;
      }
      if (!exp.expenseType) {
        showMessage('Expense type is required for all entries', 'error');
        return false;
      }
      if (!exp.paymentMode) {
        showMessage('Payment mode is required for all entries', 'error');
        return false;
      }
      if (!exp.expenseAmount || exp.expenseAmount <= 0) {
        showMessage('Expense amount must be greater than 0', 'error');
        return false;
      }
      if (exp.expenseType === 'other' && !exp.comment) {
        showMessage('Comment is required for expense type "Other"', 'error');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateExpenses()) return;

    setLoading(true);
    try {
      const request = {
        attached_driver: shipment.driver_id,
        vehicle_id: shipment.vehicle_id?._id,
        shipment_id: shipment._id,
        expense: expenses.map(exp => ({
          expense_value: exp.expenseAmount,
          expense_type: exp.expenseType,
          expense_date: exp.expenseDate,
          payment_mode: exp.paymentMode,
          ...(exp.odometerReading && { odometer: exp.odometerReading }),
          ...(exp.comment && { comments: exp.comment }),
          ...(exp.approvedAmount > 0 && { approved_value: exp.approvedAmount })
        }))
      };

      const response = await httpsPost('driver_expenses', request, 3);
      if (response.statusCode === 200) {
        showMessage('Expenses added successfully', 'success');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(response.message || 'Failed to add expenses');
      }
    } catch (error: any) {
      console.error('Error submitting expenses:', error);
      showMessage(error.message || 'Failed to add expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date(shipment.pickDate);
  const maxDate = new Date(shipment.deliveryDate);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: styles.modal
      }}
    >
      <ModalHeader title="Add Driver Expenses" onClose={onClose} />
      
      <DialogContent className={styles.dialogContent}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>Vehicle No</InputLabel>
            <TextField 
              value={shipment?.vehicleNumber || ''} 
              disabled 
              fullWidth 
              size="small"
              className={styles.infoField}
            />
          </div>
          
          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>Driver Name</InputLabel>
            <TextField 
              value={shipment?.driverName || ''} 
              disabled 
              fullWidth 
              size="small"
              className={styles.infoField}
            />
          </div>
          
          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>SIN</InputLabel>
            <TextField 
              value={shipment?.sin || ''} 
              disabled 
              fullWidth 
              size="small"
              className={styles.infoField}
            />
          </div>
          
          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>From</InputLabel>
            <TextField 
              value={shipment?.pickDate ? format(new Date(shipment.pickDate), 'dd/MM/yyyy') : ''} 
              disabled 
              fullWidth 
              size="small"
              className={styles.infoField}
            />
          </div>
          
          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>To</InputLabel>
            <TextField 
              value={shipment?.deliveryDate ? format(new Date(shipment.deliveryDate), 'dd/MM/yyyy') : ''} 
              disabled 
              fullWidth 
              size="small"
              className={styles.infoField}
            />
          </div>
        </div>

        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table size="small" className={styles.table}>
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell className={styles.headerCell}>S.No</TableCell>
                <TableCell className={styles.headerCell}>Expense Date*</TableCell>
                <TableCell className={styles.headerCell}>Expense Type*</TableCell>
                <TableCell className={styles.headerCell}>Payment Mode*</TableCell>
                <TableCell className={styles.headerCell}>Odometer Reading</TableCell>
                <TableCell className={styles.headerCell}>Expense Amount ({currencySymbol})*</TableCell>
                <TableCell className={styles.headerCell}>Approved Amount ({currencySymbol})</TableCell>
                {showComment && <TableCell className={styles.headerCell}>Comment</TableCell>}
                <TableCell className={styles.headerCell}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={styles.tableBody}>
              {expenses.map((expense, index) => (
                <TableRow key={index} className={styles.tableRow}>
                  <TableCell className={styles.cell}>{index + 1}</TableCell>
                  <TableCell className={styles.cell}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={expense.expenseDateString}
                        onChange={(date) => handleDateChange(index, date as Date | null)}
                        minDate={minDate}
                        maxDate={maxDate}
                        // renderInput={(params) => (
                        //   <TextField
                        //     {...params}
                        //     size="small"
                        //     className={styles.dateField}
                        //     error={!expense.expenseDate}
                        //   />
                        // )}
                      />
                    </LocalizationProvider>
                  </TableCell>
                  <TableCell className={styles.cell}>
                    <FormControl fullWidth size="small" className={styles.selectControl}>
                      <Select
                        value={expense.expenseType}
                        onChange={(e) => {
                          handleExpenseChange(index, 'expenseType', e.target.value);
                          if (e.target.value === 'other') {
                            setShowComment(true);
                          }
                        }}
                        displayEmpty
                        error={!expense.expenseType}
                        className={styles.select}
                      >
                        <MenuItem value="">Select Type</MenuItem>
                        {expenseTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell className={styles.cell}>
                    <FormControl fullWidth size="small" className={styles.selectControl}>
                      <Select
                        value={expense.paymentMode}
                        onChange={(e) => handleExpenseChange(index, 'paymentMode', e.target.value)}
                        displayEmpty
                        error={!expense.paymentMode}
                        className={styles.select}
                      >
                        <MenuItem value="">Select Mode</MenuItem>
                        {paymentModes.map((mode) => (
                          <MenuItem key={mode.value} value={mode.value}>
                            {mode.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell className={styles.cell}>
                    <TextField
                      type="number"
                      size="small"
                      value={expense.odometerReading}
                      onChange={(e) => handleExpenseChange(index, 'odometerReading', e.target.value)}
                      inputProps={{ min: 0 }}
                      className={styles.numberField}
                    />
                  </TableCell>
                  <TableCell className={styles.cell}>
                    <TextField
                      type="number"
                      size="small"
                      value={expense.expenseAmount || ''}
                      onChange={(e) => handleExpenseChange(index, 'expenseAmount', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, step: 0.01 }}
                      className={styles.numberField}
                      error={!expense.expenseAmount}
                    />
                  </TableCell>
                  <TableCell className={styles.cell}>
                    <TextField
                      type="number"
                      size="small"
                      value={expense.approvedAmount || ''}
                      onChange={(e) => handleExpenseChange(index, 'approvedAmount', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, step: 0.01 }}
                      className={styles.numberField}
                    />
                  </TableCell>
                  {showComment && (
                    <TableCell className={styles.cell}>
                      <TextField
                        size="small"
                        value={expense.comment || ''}
                        onChange={(e) => handleExpenseChange(index, 'comment', e.target.value)}
                        fullWidth
                        error={expense.expenseType === 'other' && !expense.comment}
                        className={styles.commentField}
                      />
                    </TableCell>
                  )}
                  <TableCell className={styles.cell}>
                    <div className={styles.actionButtons}>
                      <IconButton 
                        size="small" 
                        onClick={() => addExpense(index)}
                        title="Duplicate"
                        className={styles.iconButton}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => removeExpense(index)}
                        title="Remove"
                        disabled={expenses.length <= 1}
                        className={styles.iconButton}
                      >
                        <CancelIcon fontSize="small" color={expenses.length <= 1 ? 'disabled' : 'error'} />
                      </IconButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className={styles.tableFooter}>
              <TableRow>
                <TableCell colSpan={showComment ? 7 : 6} className={styles.footerCell}>
                  Total:
                </TableCell>
                <TableCell className={styles.footerCell}>
                  {totalExpense.toFixed(2)}
                </TableCell>
                <TableCell className={styles.footerCell}>
                  {totalApproved.toFixed(2)}
                </TableCell>
                {showComment && <TableCell></TableCell>}
                <TableCell className={styles.footerCell}>
                  <IconButton 
                    size="small" 
                    onClick={() => addExpense()}
                    title="Add New Row"
                    className={styles.addButton}
                  >
                    <AddIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>
      
      <DialogActions className={styles.dialogActions}>
        <button 
          onClick={onClose} 
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={loading || !expenses.length}
          className={styles.submitButton}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverExpenses;