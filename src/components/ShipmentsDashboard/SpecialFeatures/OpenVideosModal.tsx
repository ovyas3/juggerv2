import React from 'react';
import styles from './OpenVideosModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

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
        <ModalHeader
          title={title}
          onClose={onClose}
        />
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