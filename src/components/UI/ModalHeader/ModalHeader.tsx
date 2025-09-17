import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import styles from './ModalHeader.module.css';

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, className = '' }) => {
  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.label}>
        {title}
      </div>
      <button 
        type="button" 
        className={styles.close} 
        onClick={onClose}
        aria-label="Close"
      >
        <CloseIcon style={{ fontSize: 18 }} />
      </button>
    </div>
  );
};

export default ModalHeader;
