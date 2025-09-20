import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableFooter,
} from "@mui/material";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  ContentCopy as ContentCopyIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import styles from "./DriverExpenses.module.css";

interface Expense {
  expenseDate: string;
  expenseDateString: Date | null;
  expenseType: string;
  paymentMode: string;
  odometerReading?: string;
  expenseAmount: number;
  approvedAmount?: string;
  comment?: string;
}

interface DriverExpensesProps {
  open: boolean;
  onClose: () => void;
  shipment: any;
  onSuccess?: () => void;
}

const expenseTypes = [
  { name: "Toll", value: "toll" },
  { name: "Fuel", value: "fuel" },
  { name: "Other", value: "other" },
];

const paymentModes = [
  { name: "Cash", value: "cash" },
  { name: "Fuel Card", value: "fuel_card" },
  { name: "Fastag", value: "fastag" },
  { name: "Other", value: "other" },
];

const DriverExpenses: React.FC<DriverExpensesProps> = ({
  open,
  onClose,
  shipment,
  onSuccess,
}) => {
  const { showMessage } = useSnackbar();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [showComment, setShowComment] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  useEffect(() => {
    if (open) {
      const initialExpense: Expense = {
        expenseDate: "",
        expenseDateString: null,
        expenseType: "",
        paymentMode: "",
        expenseAmount: 0,
      };
      setExpenses([initialExpense]);
      setShowComment(false); 

      try {
        const shippers = JSON.parse(localStorage.getItem("shippers") || "[]");
        if (shippers.length) {
          setCurrencySymbol(shippers[0]?.country?.currency?.symbol || "₹");
        }
      } catch (e) {
        console.error("Error getting currency symbol:", e);
      }
    }
  }, [open]);

  const addRow = (index?: number) => {
    const newExpense: Expense = {
      expenseDate: "",
      expenseDateString: null,
      expenseType: "",
      paymentMode: "",
      expenseAmount: 0,
    };

    if (index !== undefined) {
      const newExpenses = [...expenses];
      const duplicatedExpense = { ...newExpenses[index] };
      newExpenses.splice(index + 1, 0, duplicatedExpense);
      setExpenses(newExpenses);
    } else {
      setExpenses([...expenses, newExpense]);
    }
    calculateTotals();
  };

  const removeRow = (index: number) => {
    if (expenses.length > 1) {
      const newExpenses = expenses.filter((_, i) => i !== index);
      setExpenses(newExpenses);
      calculateTotals(newExpenses);
    }
  };

  const handleExpenseChange = (
    index: number,
    field: keyof Expense,
    value: any
  ) => {
    // Handle string fields that should only contain digits
    if (field === 'odometerReading' || field === 'approvedAmount') {
      // Allow empty string or digits only
      if (value === '' || /^\d*$/.test(value)) {
        const newExpenses = [...expenses];
        (newExpenses[index] as any)[field] = value === '' ? undefined : value;
        setExpenses(newExpenses);
        calculateTotals(newExpenses);
      }
      return;
    }
  
    // Handle expenseAmount (keep as number for calculations)
    if (field === 'expenseAmount') {
      if (value === '') {
        value = 0;
      } else if (isNaN(Number(value)) || Number(value) < 0) {
        return;
      } else {
        value = Number(value);
      }
    }
  
    const newExpenses = [...expenses];
    (newExpenses[index] as any)[field] = value;
  
    if (field === "expenseType") {
      const hasOtherType =
        newExpenses.some((exp) => exp.expenseType === "other") ||
        value === "other";
      setShowComment(hasOtherType);
    }
  
    setExpenses(newExpenses);
    calculateTotals(newExpenses);
  };
  

  const calculateTotals = (expenseList = expenses) => {
    const expenseTotal = expenseList.reduce(
      (sum, exp) => sum + (exp.expenseAmount || 0),
      0
    );
    const approvedTotal = expenseList.reduce(
      (sum, exp) => sum + (exp.approvedAmount ? parseFloat(exp.approvedAmount) || 0 : 0),
      0
    );
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
        showMessage("Expense date is required for all entries", "error");
        return false;
      }
      if (!exp.expenseType) {
        showMessage("Expense type is required for all entries", "error");
        return false;
      }
      if (!exp.paymentMode) {
        showMessage("Payment mode is required for all entries", "error");
        return false;
      }
      if (!exp.expenseAmount || exp.expenseAmount <= 0) {
        showMessage("Expense amount must be greater than 0", "error");
        return false;
      }
      if (exp.expenseType === "other" && !exp.comment) {
        showMessage('Comment is required for expense type "Other"', "error");
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
        expense: expenses.map((exp) => ({
          expense_value: exp.expenseAmount,
          expense_type: exp.expenseType,
          expense_date: exp.expenseDate,
          payment_mode: exp.paymentMode,
          ...(exp.odometerReading && { odometer: parseInt(exp.odometerReading, 10) }), // Convert to number
          ...(exp.comment && { comments: exp.comment }),
          ...(exp.approvedAmount && { approved_value: parseFloat(exp.approvedAmount) }), // Convert to number
        })),
      };
  
      const response = await httpsPost("driver_expenses", request, 3);
      
      if (response.statusCode === 200) {
        showMessage("Expenses added successfully", "success");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        showMessage(response.message || "Failed to add expenses", "error");
      }
    } catch (error: any) {
      console.error("Error submitting expenses:", error);
      showMessage(error.message || "Failed to add expenses", "error");
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
        className: styles.modal,
      }}
    >
      <ModalHeader title={`Add Expenses - #${shipment.sin}`} onClose={onClose} />

      <DialogContent className={styles.dialogContent}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>Vehicle No.</InputLabel>
            <TextField
              value={shipment?.vehicleNumber || ""}
              disabled
              fullWidth
              size="small"
              className={styles.infoField}
              inputProps={{ style: { fontSize: "14px" } }}
              InputLabelProps={{ style: { fontSize: "14px" } }}
            />
          </div>

          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>Driver Name</InputLabel>
            <TextField
              value={shipment?.driverName || ""}
              disabled
              fullWidth
              size="small"
              className={styles.infoField}
              inputProps={{ style: { fontSize: "14px" } }}
              InputLabelProps={{ style: { fontSize: "14px" } }}
            />
          </div>

          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>Shipment ID</InputLabel>
            <TextField
              value={shipment?.sin || ""}
              disabled
              fullWidth
              size="small"
              className={styles.infoField}
              inputProps={{ style: { fontSize: "14px" } }}
              InputLabelProps={{ style: { fontSize: "14px" } }}
            />
          </div>

          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>From</InputLabel>
            <TextField
              value={
                shipment?.pickDate
                  ? format(new Date(shipment.pickDate), "dd-MMM-yyyy")
                  : ""
              }
              disabled
              fullWidth
              size="small"
              className={styles.infoField}
              inputProps={{ style: { fontSize: "14px" } }}
              InputLabelProps={{ style: { fontSize: "14px" } }}
            />
          </div>

          <div className={styles.infoItem}>
            <InputLabel className={styles.infoLabel}>To</InputLabel>
            <TextField
              value={
                shipment?.deliveryDate
                  ? format(new Date(shipment.deliveryDate), "dd-MMM-yyyy")
                  : ""
              }
              disabled
              fullWidth
              size="small"
              className={styles.infoField}
              inputProps={{ style: { fontSize: "14px" } }}
              InputLabelProps={{ style: { fontSize: "14px" } }}
            />
          </div>
        </div>

        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table size="small" className={styles.table}>
            <TableHead className={styles.tableHead}>
              <TableRow>
                <TableCell className={styles.headerCell}>S.No.</TableCell>
                <TableCell className={styles.headerCell}>
                  Expense Date <span className={styles.required}>*</span>
                </TableCell>
                <TableCell className={styles.headerCell}>
                  Expense Type <span className={styles.required}>*</span>
                </TableCell>
                <TableCell className={styles.headerCell}>
                  Payment Mode <span className={styles.required}>*</span>
                </TableCell>
                <TableCell className={styles.headerCell}>
                  Odometer Reading
                </TableCell>
                <TableCell className={styles.headerCell}>
                  Expense Amount ({currencySymbol}){" "}
                  <span className={styles.required}>*</span>
                </TableCell>
                <TableCell className={styles.headerCell}>
                  Approved Amount ({currencySymbol})
                </TableCell>
                {showComment && (
                  <TableCell className={styles.headerCell}>Comment</TableCell>
                )}
                <TableCell className={styles.headerCell}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={styles.tableBody}>
              {expenses.map((expense, index) => (
                <TableRow key={index} className={styles.tableRow}>
                  <TableCell className={styles.cell}>{index + 1}</TableCell>
                  <TableCell className={styles.cell}>
                    <DatePicker
                      value={
                        expense.expenseDate ? dayjs(expense.expenseDate) : null
                      }
                      onChange={(date) =>
                        handleDateChange(index, date ? date.toDate() : null)
                      }
                      format="DD/MM/YYYY"
                      style={{ width: "100%", height: "40px" }}
                      placeholder="Select date"
                      disabledDate={(current) => {
                        if (!current) return false;
                        return current.isBefore(dayjs(minDate), "day") && current.isAfter(dayjs(maxDate), "day");
                      }}
                      popupStyle={{ zIndex: 99999 }}
                      status={!expense.expenseDate ? "error" : ""}
                      className={expense.expenseDate ? "datepicker-filled" : "datepicker-empty"}
                    />
                  </TableCell>
                  <TableCell className={styles.cell}>
                    <FormControl
                      fullWidth
                      size="small"
                      className={styles.selectControl}
                    >
                      <Select
                        value={expense.expenseType}
                        onChange={(e) =>
                          handleExpenseChange(
                            index,
                            "expenseType",
                            e.target.value
                          )
                        }
                        displayEmpty
                        error={!expense.expenseType}
                        className={styles.select}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: expense.expenseType ? '#4f46e5' : '#d32f2f',
                            borderWidth: '2px',
                          },
                          '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4f46e5',
                            borderWidth: '2px',
                          }
                        }}
                      >
                        {/* <MenuItem value="">Select Type</MenuItem> */}
                        {expenseTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell className={styles.cell}>
                    <FormControl
                      fullWidth
                      size="small"
                      className={styles.selectControl}
                    >
                      <Select
                        value={expense.paymentMode}
                        onChange={(e) =>
                          handleExpenseChange(
                            index,
                            "paymentMode",
                            e.target.value
                          )
                        }
                        displayEmpty
                        error={!expense.paymentMode}
                        className={styles.select}
                        sx={{
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: expense.paymentMode ? '#4f46e5' : '#d32f2f',
                            borderWidth: '2px',
                          },
                          '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4f46e5',
                            borderWidth: '2px',
                          }
                        }}
                      >
                        {/* <MenuItem value="">Select Mode</MenuItem> */}
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
  value={expense.odometerReading || ''}
  onChange={(e) => {
    handleExpenseChange(index, 'odometerReading', e.target.value);
  }}
  fullWidth
  size="small"
  inputProps={{
    style: { fontSize: "14px" },
    inputMode: 'numeric',
    pattern: '[0-9]*',
  }}
  sx={{
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4f46e5',
      borderWidth: '2px',
    }
  }}
/>

                  </TableCell>
                  <TableCell className={styles.cell}>
                    <TextField
                      value={expense.expenseAmount === 0 ? '' : expense.expenseAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        handleExpenseChange(index, 'expenseAmount', value || '0');
                      }}
                      fullWidth
                      size="small"
                      required
                      inputProps={{ 
                        style: { fontSize: "14px" },
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        min: '0'
                      }}
                      error={!expense.expenseAmount && expense.expenseAmount !== 0}
                      helperText={!expense.expenseAmount && expense.expenseAmount !== 0 ? 'Required' : ''}
                      sx={{
                        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: (expense.expenseAmount && expense.expenseAmount > 0) ? '#4f46e5' : '#d32f2f',
                          borderWidth: '2px',
                        },
                        '& .MuiOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4f46e5',
                          borderWidth: '2px',
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className={styles.cell}>
                  <TextField
  value={expense.approvedAmount || ''}
  onChange={(e) => {
    handleExpenseChange(index, 'approvedAmount', e.target.value);
  }}
  fullWidth
  size="small"
  inputProps={{
    style: { fontSize: "14px" },
    inputMode: 'numeric',
    pattern: '[0-9]*',
  }}
  sx={{
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4f46e5',
      borderWidth: '2px',
    }
  }}
/>


                  </TableCell>
                  {showComment && (
                    <TableCell className={styles.cell}>
                      <TextField
                        size="small"
                        value={expense.comment || ""}
                        onChange={(e) =>
                          handleExpenseChange(index, "comment", e.target.value)
                        }
                        fullWidth
                        error={
                          expense.expenseType === "other" && !expense.comment
                        }
                        className={styles.commentField}
                        sx={{
                          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: expense.comment ? '#4f46e5' : '#d32f2f',
                            borderWidth: '2px',
                          },
                          '& .MuiOutlinedInput-root.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#4f46e5',
                            borderWidth: '2px',
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell className={styles.cell}>
                    <div className={styles.actionButtons}>
                      {(index > 0 || expenses.length > 1) && (
                        <IconButton
                          size="small"
                          onClick={() => removeRow(index)}
                          title="Remove"
                          className={styles.iconButton}
                          sx={{ color: "#d8081a" }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}

                      <IconButton
                        size="small"
                        onClick={() => addRow(index)}
                        title="Duplicate"
                        className={styles.iconButton}
                        sx={{ color: "#3f84a7" }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>

                      {index === expenses.length - 1 && (
                        <IconButton
                          size="small"
                          onClick={() => addRow()}
                          title="Add Row"
                          className={styles.iconButton}
                          sx={{ color: "#2962Ff" }}
                        >
                          <AddCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className={styles.tableFooter}>
              <TableRow>
                <TableCell
                  colSpan={showComment ? 6 : 5}
                  className={styles.footerCell}
                  sx={{ textAlign: "right", fontWeight: "bold" }}
                >
                  Total
                </TableCell>
                <TableCell
                  className={styles.footerCell}
                  sx={{ fontWeight: "bold" }}
                >
                  {totalExpense}
                </TableCell>
                <TableCell
                  className={styles.footerCell}
                  sx={{ fontWeight: "bold" }}
                >
                  {totalApproved}
                </TableCell>
                {showComment && <TableCell></TableCell>}
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <button onClick={onClose} className={styles.cancelButton}>
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || !expenses.length}
          className={styles.submitButton}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default DriverExpenses;
