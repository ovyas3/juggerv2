import React from 'react';
import styles from './OrdersPopuo.module.css';
import ModalHeader from '../UI/ModalHeader/ModalHeader';

interface OrdersPopupProps {
  orders: string[];
  onClose: () => void;
}

export const OrdersPopup: React.FC<OrdersPopupProps> = ({ orders, onClose }) => {
  return (
    <div className={styles.ordersPopupOverlay} onClick={onClose}>
      <div className={styles.ordersPopup} onClick={(e) => e.stopPropagation()}>
        <ModalHeader title="Additional Sale Order" onClose={onClose} />
        <div className={styles.ordersList}>
          {orders.map((order, index) => (
            <div key={index} className={styles.orderItem}>
              {order}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPopup;
