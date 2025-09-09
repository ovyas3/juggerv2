import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './CreatePaymentAdvanceModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';
import { httpsGet, httpsPost } from '@/utils/Communication';
import { useSnackbar } from '@/hooks/snackBar';


interface ShipmentItem {
  _id: string;
  SIN: string;
  total_amount: number;
  advance: number;
  remaining_actual: number;
  remaining: number;
  paying_now: number;
  paying_out: number;
  tds: number;
  balance: number;
  currency_symbol?: string;
}

interface BankDetails {
  name: string;
  account_number: string;
  ifsc_code: string;
}

interface PayerInfo {
  UTR_no: string;
  transaction_ID: string;
  cheque_no: string;
  cheque_date: string;
  bank_details: BankDetails;
}

interface PaymentRequest {
  carrier: string;
  payment_mode: string;
  payment_date: string;
  payer_info: PayerInfo;
  pre_tax_amount: number;
  tax_amount: number;
  tax_percent: number;
  total_amount: number;
  bills: any[];
}

interface Bill {
  _id: string;
  bill_id?: string;
  total: string | number;
  advance: number;
  remaining_actual: number;
  remaining: number;
  paying_now: number;
  tds: number;
  paying_out: number;
  balance: number;
  currency_symbol?: string;
  payment_status?: string;
  SIN?: string;
  total_amount?: number;
}

interface BankDetails {
  name: string;
  account_number: string;
  ifsc_code: string;
}

interface CreatePaymentAdviceModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  shipmentId?: string;
  data: {
    shipmentAdvice?: boolean;
    shipment?: any;
    bills?: Bill[];
    carrier?: string;
  };
  isLoading?: boolean;
}

const CreatePaymentAdviceModal: React.FC<CreatePaymentAdviceModalProps> = ({
  show,
  onClose,
  onSubmit,
  data,
  shipmentId,
  // isLoading = false,
}) => {
  const { showMessage } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    name: '',
    account_number: '',
    ifsc_code: ''
  });
  const [tdsPercent, setTdsPercent] = useState<number>(1);
  const [paymentType, setPaymentType] = useState<string>('bank');
  const [shipmentList, setShipmentList] = useState<ShipmentItem[]>([]);
  const [request, setRequest] = useState<PaymentRequest>({
    carrier: '',
    payment_mode: 'bank',
    payment_date: new Date().toISOString().split('T')[0],
    payer_info: {
      UTR_no: '',
      transaction_ID: '',
      cheque_no: '',
      cheque_date: '',
      bank_details: {
        name: '',
        account_number: '',
        ifsc_code: ''
      }
    },
    pre_tax_amount: 0,
    tax_amount: 0,
    tax_percent: 1,
    total_amount: 0,
    bills: []
  });

  useEffect(() => {
    const fetchShipmentDetails = async () => {
      try {
        setIsLoading(true);
        const [settingsRes, shipmentRes] = await Promise.all([
          httpsGet('settings/constants'),
          httpsGet(`shipment/one?shipmentId=${shipmentId}`)
        ]);
  
        if (settingsRes.statusCode === 200) {
          const { payment } = settingsRes.data;
          setBankDetails(payment?.bank_details || {});
          setTdsPercent(payment?.tds_percentage || 1);
        }
  
        if (shipmentRes.statusCode === 200) {
          const shipmentData = shipmentRes.data;
          const temp: ShipmentItem = {
            _id: shipmentData._id,
            SIN: shipmentData.SIN,
            total_amount: shipmentData.estimated?.price || shipmentData.estimated?.price_per_weight || 0,
            advance: shipmentData.advance_amount || 0,
            remaining_actual: (shipmentData.estimated?.price || 0) - (shipmentData.advance_amount || 0),
            remaining: (shipmentData.estimated?.price || 0) - (shipmentData.advance_amount || 0),
            paying_now: 0,
            paying_out: 0,
            tds: 0,
            balance: 0,
            currency_symbol: shipmentData.currency_symbol || '₹'
          };
          setShipmentList([temp]);
          setRequest(prev => ({
            ...prev,
            carrier: shipmentData.carrier?._id || '',
            tax_percent: tdsPercent
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showMessage('Failed to load required data', 'error');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
  
    if (show && shipmentId) {
      fetchShipmentDetails();
    }
  }, [show, shipmentId]);

  if (!show) return null;

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      if (!validateForm()) {
        return;
      }
  
      const payload = {
        carrier: request.carrier,
        payment_mode: paymentType,
        tax_percent: tdsPercent,
        payment_date: request.payment_date,
        payer_info: {
          ...(paymentType === 'bank' && { UTR_no: request.payer_info.UTR_no }),
          ...(paymentType === 'UPI' && { transaction_ID: request.payer_info.transaction_ID }),
          ...(paymentType === 'cheque' && { 
            cheque_no: request.payer_info.cheque_no,
            cheque_date: request.payer_info.cheque_date 
          }),
          bank_details: bankDetails
        },
        shipments: shipmentList.map(item => ({
          shipment_id: item._id,
          gross_amount: item.paying_now
        }))
      };
  
      const response = await httpsPost('carrier_bill_advice_shipment/create', payload);
      if (response.statusCode === 200) {
        showMessage('Payment advice created successfully', 'success');
        // onSuccess?.();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to create payment advice');
      }
    } catch (error: any) {
      console.error('Error creating payment advice:', error);
      showMessage(error.message || 'Failed to create payment advice', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const validateForm = (): boolean => {
    if (paymentType === 'bank' && !request.payer_info.UTR_no) {
      showMessage('Please enter UTR number', 'error');
      return false;
    }
    
    if (paymentType === 'cheque') {
      if (!request.payer_info.cheque_no) {
        showMessage('Please enter cheque number', 'error');
        return false;
      }
      if (!request.payer_info.cheque_date) {
        showMessage('Please select cheque date', 'error');
        return false;
      }
    }
    
    if (paymentType === 'UPI' && !request.payer_info.transaction_ID) {
      showMessage('Please enter transaction ID', 'error');
      return false;
    }
    
    const hasPayments = shipmentList.some(item => item.paying_now > 0);
    if (!hasPayments) {
      showMessage('Please enter amount to pay', 'error');
      return false;
    }
    
    return true;
  };

  const calculatePayNow = (index: number) => {
    const updatedShipments = [...shipmentList];
    const currentShipment = updatedShipments[index];
    
    if (currentShipment.paying_now > currentShipment.remaining_actual) {
      showMessage('Payment amount cannot be greater than remaining amount', 'error');
      currentShipment.paying_now = 0;
      currentShipment.remaining = currentShipment.remaining_actual;
      currentShipment.balance = currentShipment.remaining_actual;
    } else if (currentShipment.paying_now < 0) {
      showMessage('Payment amount cannot be negative', 'error');
      currentShipment.paying_now = 0;
      currentShipment.remaining = currentShipment.remaining_actual;
      currentShipment.balance = currentShipment.remaining_actual;
    } else {
      // Calculate TDS
      const tds = parseFloat((currentShipment.paying_now * (tdsPercent / 100)).toFixed(2));
      const payingOut = parseFloat((currentShipment.paying_now - tds).toFixed(2));
      const remaining = parseFloat((currentShipment.total_amount - currentShipment.advance - currentShipment.paying_now).toFixed(2));
      
      currentShipment.tds = tds;
      currentShipment.paying_out = payingOut;
      currentShipment.remaining = remaining;
      currentShipment.balance = remaining;
    }
  
    setShipmentList(updatedShipments);
  };
  
  const handlePayingNowChange = (index: number, value: number) => {
    const updatedShipments = [...shipmentList];
    updatedShipments[index].paying_now = value;
    setShipmentList(updatedShipments);
    calculatePayNow(index);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <ModalHeader
           title='Create Payment Advice'
           onClose={onClose}
        />
  
        <div className={styles.paymentMode}>
          <div className={styles.paymentModeSelect}>
            <span>Payment Mode</span>
            <select 
              value={paymentType} 
              onChange={(e) => setPaymentType(e.target.value)}
              className={styles.selectInput}
            >
              <option value="bank">Bank Transfer (NEFT/RTGS)</option>
              <option value="UPI">UPI</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className={styles.tdsInput} style={{ marginTop: '16px' }}>
            <span style={{ marginRight: '5px' }}>TDS %: </span>
            <span>{tdsPercent}</span>
          </div>
        </div>
  
        <div className={styles.paymentDetails}>
          {paymentType === 'bank' && (
            <div className={styles.transactionId}>
              <span>UTR Number</span>
              <input
                type="text"
                value={request.payer_info.UTR_no}
                onChange={(e) => setRequest(prev => ({
                  ...prev,
                  payer_info: {
                    ...prev.payer_info,
                    UTR_no: e.target.value
                  }
                }))}
                placeholder="Enter UTR Number"
              />
            </div>
          )}
  
          {paymentType === 'UPI' && (
            <div className={styles.transactionId}>
              <span>Transaction ID</span>
              <input
                type="text"
                value={request.payer_info.transaction_ID}
                onChange={(e) => setRequest(prev => ({
                  ...prev,
                  payer_info: {
                    ...prev.payer_info,
                    transaction_ID: e.target.value
                  }
                }))}
                placeholder="Enter Transaction ID"
              />
            </div>
          )}
  
          {(paymentType === 'bank' || paymentType === 'UPI' || paymentType === 'cash') && (
            <div className={styles.transactionId}>
              <span>Date of Payment</span>
              <input
                type="date"
                value={request.payment_date}
                onChange={(e) => setRequest((prev: any) => ({
                  ...prev,
                  payment_date: e.target.value
                }))}
              />
            </div>
          )}
  
          {paymentType === 'cheque' && (
            <>
              <div className={styles.transactionId}>
                <span>Cheque Number</span>
                <input
                  type="text"
                  value={request.payer_info.cheque_no}
                  onChange={(e) => setRequest(prev => ({
                    ...prev,
                    payer_info: {
                      ...prev.payer_info,
                      cheque_no: e.target.value
                    }
                  }))}
                  placeholder="Enter Cheque Number"
                />
              </div>
              <div className={styles.transactionId}>
                <span>Cheque Date</span>
                <input
                  type="date"
                  value={request.payer_info.cheque_date}
                  onChange={(e) => setRequest((prev: any) => ({
                    ...prev,
                    payer_info: {
                      ...prev.payer_info,
                      cheque_date: e.target.value
                    }
                  }))}
                />
              </div>
            </>
          )}
        </div>
  
        {(paymentType === 'cheque' || paymentType === 'bank') && (
          <div className={styles.bankDetails}>
            <div className={styles.heading}>
              <b>Bank Details</b>
            </div>
            <div className={styles.accountDetails}>
              <div className={styles.item}>
                Bank Name: {bankDetails.name}
              </div>
              <div className={styles.item}>
                Account Number: {bankDetails.account_number}
              </div>
              <div className={styles.item}>
                IFSC: {bankDetails.ifsc_code}
              </div>
            </div>
          </div>
        )}
  
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>SIN</th>
                <th>Advance</th>
                <th>Total</th>
                <th>Remaining</th>
                <th>Paying Now</th>
                <th>TDS ({tdsPercent}%)</th>
                <th>Paying Out</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {shipmentList.map((item, index) => (
                <tr key={item._id}>
                  <td>{item.SIN}</td>
                  <td>{item.currency_symbol} {item.advance}</td>
                  <td>{item.currency_symbol} {item.total_amount}</td>
                  <td>{item.currency_symbol} {item.remaining}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.paying_now}
                      onChange={(e) => handlePayingNowChange(index, parseFloat(e.target.value) || 0)}
                      className={styles.amountInput}
                    />
                  </td>
                  <td>{item.currency_symbol} {item.tds}</td>
                  <td>{item.currency_symbol} {item.paying_out}</td>
                  <td>{item.currency_symbol} {item.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        <div className={styles.footer}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Create Payment Advice'}
          </button>
        </div>
      </div>
    </div>
  );

};

export default CreatePaymentAdviceModal;
