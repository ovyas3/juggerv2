import React from 'react';
import styles from './OpenVideosModal.module.css';

interface OpenVideosModalProps {
  show: boolean;
  videoUrl: string;
  onClose: () => void;
  title?: string;
}

const OpenVideosModal: React.FC<OpenVideosModalProps> = ({
  show,
  videoUrl,
  onClose,
  title = "Shipment Video"
}) => {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.uploadDialogMain}>
        <div className={styles.header}>
          <div className={styles.label}>
            {title}
          </div>
          <div className={styles.close}>
            <span 
              className={`${styles.materialIcons} ${styles.closeButton}`} 
              onClick={onClose}
              title="Close"
            >
              close
            </span>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.videoContainer}>
            <div className={styles.videoWrapper}>
              <iframe 
                src={videoUrl} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title="Shipment Video"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenVideosModal;