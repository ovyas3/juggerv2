import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './CreatePaymentAdviceModal.module.css';

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
  isLoading = false,
}) => {
  const [paymentType, setPaymentType] = useState<string>('bank');
  const [tdsPercent, setTdsPercent] = useState<number>(1);
  const [billsList, setBillsList] = useState<Bill[]>([]);
  const [shipmentList, setShipmentList] = useState<Bill[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    name: '',
    account_number: '',
    ifsc_code: '',
  });
  const [request, setRequest] = useState({
    carrier: '',
    payment_mode: 'bank',
    transaction_id: '',
    payer_info: {
      UTR_no: '',
      cheque_no: '',
      cheque_date: new Date(),
      transaction_ID: '',
      bank_details: {
        bank_name: '',
        account_no: '',
        IFSC_no: '',
      },
    },
    payment_date: new Date(),
    pre_tax_amount: 0,
    tax_amount: 0,
    tax_percent: 0,
    total_amount: 0,
    bills: [] as any[],
  });

  // Initialize component
  useEffect(() => {
    if (data) {
      if (data.shipmentAdvice && data.shipment) {
        const shipment = data.shipment;
        const temp: any = {
          _id: shipment._id,
          SIN: shipment.SIN,
          total_amount: shipment.estimated?.price || shipment.estimated?.price_per_weight || 0,
          advance: shipment.advance_amount || 0,
          remaining_actual: 0,
          remaining: 0,
          paying_now: 0,
          tds: 0,
          paying_out: 0,
          balance: 0,
        };
        temp.remaining_actual = temp.remaining = (Number(temp.total_amount) - Number(temp.advance)) || 0;
        setShipmentList([temp]);
        setRequest(prev => ({
          ...prev,
          carrier: shipment.carrier?._id || '',
        }));
      } else if (data.bills?.length) {
        const bills = data.bills.map((bill: any) => ({
          bill_id: bill.bill_id,
          total: bill.amount ? Number(bill.amount).toFixed(2) : '0.00',
          advance: bill.settled?.net_amount ? Number(bill.settled.net_amount.toFixed(2)) : 0,
          remaining_actual: 0,
          remaining: 0,
          paying_now: 0,
          tds: 0,
          paying_out: 0,
          _id: bill.id,
          balance: 0,
        }));
        bills.forEach((bill: any) => {
          bill.remaining_actual = bill.remaining = (Number(bill.total) - Number(bill.advance)) || 0;
          bill.balance = (Number(bill.total) - (Number(bill.advance) + Number(bill.paying_now))) || 0;
        });
        setBillsList(bills);
        setRequest(prev => ({
          ...prev,
          carrier: data.carrier || '',
        }));
      }
    }
  }, [data]);

  // Get bank details
  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchBankDetails = async () => {
      try {
        // const response = await http.get('settings/constants');
        // const data = response.data;
        // setBankDetails({
        //   account_number: data.payment?.bank_details?.account_number || '',
        //   name: data.payment?.bank_details?.name || '',
        //   ifsc_code: data.payment?.bank_details?.branch_code || '',
        // });
        // setTdsPercent(data.tds_percentage || 1);
      } catch (error) {
        console.error('Error fetching bank details:', error);
      }
    };

    if (show) {
      fetchBankDetails();
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span>Create Payment Advice</span>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>
          {/* Payment Mode Selection */}
          <div className={styles.paymentMode}>
            <div className={styles.paymentModeSelect}>
              <span>Payment Mode</span>
              <select 
                className={styles.selectInput}
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="bank">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div className={styles.tdsInput}>
              <span>TDS Percentage: </span>
              <span>{tdsPercent}%</span>
            </div>
          </div>

          {/* Payment Details */}
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
            
            {(paymentType === 'bank' || paymentType === 'UPI' || paymentType === 'cash') && (
              <div className={styles.transactionId}>
                <span>Date of Payment</span>
                <div className={styles.datePickerContainer}>
                  <DatePicker
                    selected={request.payment_date}
                    // onChange={(date: Date) => setRequest(prev => ({
                    //   ...prev,
                    //   payment_date: date
                    // }))}
                    dateFormat="dd/MM/yyyy"
                    className={styles.dateInput}
                  />
                </div>
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
                  <div className={styles.datePickerContainer}>
                    <DatePicker
                      selected={request.payer_info.cheque_date}
                    //   onChange={(date: Date) => setRequest(prev => ({
                    //     ...prev,
                    //     payer_info: {
                    //       ...prev.payer_info,
                    //       cheque_date: date
                    //     }
                    //   }))}
                      dateFormat="dd/MM/yyyy"
                      className={styles.dateInput}
                    />
                  </div>
                </div>
              </>
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
          </div>

          {/* Bank Details */}
          {(paymentType === 'cheque' || paymentType === 'bank') && (
            <div className={styles.bankDetails}>
              <div className={styles.heading}>
                <b>Bank Details</b>
              </div>
              <div className={styles.accountDetails}>
                <div className={styles.item}>
                  Bank Name: {bankDetails.name || 'N/A'}
                </div>
                <div className={styles.item}>
                  Account Number: {bankDetails.account_number || 'N/A'}
                </div>
                <div className={styles.item}>
                  IFSC: {bankDetails.ifsc_code || 'N/A'}
                </div>
              </div>
            </div>
          )}

          {/* Bills/Shipments Table */}
          <div className={styles.tableContainer}>
            {data.shipmentAdvice ? (
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
                      <td>{item.advance}</td>
                      <td>{item.total_amount}</td>
                      <td>{item.remaining}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.paying_now}
                          onChange={(e) => handlePayingNowChange(index, e.target.value, true)}
                          className={styles.amountInput}
                        />
                      </td>
                      <td>{item.tds}</td>
                      <td>{item.currency_symbol || '$'} {item.paying_out}</td>
                      <td>{item.currency_symbol || '$'} {item.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Bill No</th>
                    <th>Advance</th>
                    <th>Total Bill</th>
                    <th>Remaining</th>
                    <th>Paying Now</th>
                    <th>TDS ({tdsPercent}%)</th>
                    <th>Paying Out</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {billsList.map((item, index) => (
                    <tr key={item._id}>
                      <td>{item.bill_id}</td>
                      <td>{item.advance}</td>
                      <td>{item.total}</td>
                      <td>{item.remaining}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.paying_now}
                          onChange={(e) => handlePayingNowChange(index, e.target.value, false)}
                          className={styles.amountInput}
                        />
                      </td>
                      <td>{item.tds}</td>
                      <td>{item.currency_symbol || '$'} {item.paying_out}</td>
                      <td>{item.currency_symbol || '$'} {item.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Submit Button */}
          <div className={styles.footer}>
            <button 
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Payment Advice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function handlePayingNowChange(index: number, value: string, isShipment: boolean) {
    const amount = parseFloat(value) || 0;
    
    if (isShipment) {
      const updatedShipments = [...shipmentList];
      const item = updatedShipments[index];
      
      if (amount > item.remaining_actual) {
        // Show error or handle validation
        return;
      }
      
      item.paying_now = amount;
      item.tds = parseFloat((amount * (tdsPercent / 100)).toFixed(2));
      item.paying_out = parseFloat((amount - item.tds).toFixed(2));
      item.balance = parseFloat(((item.total_amount as number) - item.advance - amount).toFixed(2));
      item.remaining = parseFloat((item.remaining_actual - amount).toFixed(2));
      
      setShipmentList(updatedShipments);
    } else {
      const updatedBills = [...billsList];
      const item = updatedBills[index];
      
      if (amount > item.remaining_actual) {
        // Show error or handle validation
        return;
      }
      
      item.paying_now = amount;
      item.tds = parseFloat((amount * (tdsPercent / 100)).toFixed(2));
      item.paying_out = parseFloat((amount - item.tds).toFixed(2));
      item.balance = parseFloat((Number(item.total) - item.advance - amount).toFixed(2));
      item.remaining = parseFloat((item.remaining_actual - amount).toFixed(2));
      
      setBillsList(updatedBills);
    }
  }

  function validateForm() {
    // Basic validation
    if (paymentType === 'bank' && !request.payer_info.UTR_no) {
      alert('Please enter UTR number');
      return false;
    }
    
    if (paymentType === 'cheque') {
      if (!request.payer_info.cheque_no) {
        alert('Please enter cheque number');
        return false;
      }
      if (!request.payer_info.cheque_date) {
        alert('Please select cheque date');
        return false;
      }
    }
    
    if (paymentType === 'UPI' && !request.payer_info.transaction_ID) {
      alert('Please enter transaction ID');
      return false;
    }
    
    // Check if any payment is being made
    const hasPayments = data.shipmentAdvice 
      ? shipmentList.some(item => item.paying_now > 0)
      : billsList.some(item => item.paying_now > 0);
      
    if (!hasPayments) {
      alert('Please enter amount to pay');
      return false;
    }
    
    return true;
  }

  function handleSubmit() {
    if (!validateForm()) return;
    
    const payload = {
      carrier: request.carrier,
      payment_mode: paymentType,
      tax_percent: tdsPercent,
      payer_info: {
        ...request.payer_info,
        bank_details: {
          bank_name: bankDetails.name,
          account_no: bankDetails.account_number,
          IFSC_no: bankDetails.ifsc_code,
        },
      },
      payment_date: request.payment_date,
    };
    
    if (data.shipmentAdvice) {
      (payload as any).shipments = shipmentList
        .filter(item => item.paying_now > 0)
        .map(item => ({
          shipment_id: item._id,
          gross_amount: item.paying_now,
        }));
    } else {
      (payload as any).bills = billsList
        .filter(item => item.paying_now > 0)
        .map(item => ({
          _id: item._id,
          gross_amount: item.paying_now,
        }));
    }
    
    onSubmit(payload);
  }
};

export default CreatePaymentAdviceModal;
