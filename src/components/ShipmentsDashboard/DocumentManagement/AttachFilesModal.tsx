import React, { useState, useRef, ChangeEvent } from 'react';
import styles from './AttachFilesModal.module.css';

interface AttachFilesModalProps {
  show: boolean;
  onClose: () => void;
  onAttach: (files: FileList) => void;
  isLoading?: boolean;
}

const AttachFilesModal: React.FC<AttachFilesModalProps> = ({
  show,
  onClose,
  onAttach,
  isLoading = false
}) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleAttach = () => {
    if (files) {
      onAttach(files);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  if (!show) return null;

  return (
    <div className={styles.attachDialogMain}>
      {isLoading && (
        <div className={styles.loader}>
          <div className={styles.load}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      )}
      <div className={styles.section}>
        <div className={styles.header}>
          <div className={styles.label}>Attach Files</div>
          <i className={`${styles.materialIcons} ${styles.closeIcon}`} onClick={onClose}>
            clear
          </i>
        </div>
        <div className={styles.commentSection}>
          <div className={styles.uploadFile}>
            <input
              type="file"
              ref={fileInputRef}
              className={styles.inputField}
              onChange={handleFileChange}
              multiple
              style={{ display: 'none' }}
            />
            <button 
              className={styles.browseButton}
              onClick={(e) => {
                e.preventDefault();
                handleClickUpload();
              }}
            >
              Browse Files
            </button>
            {files && (
              <div className={styles.selectedFiles}>
                {Array.from(files).map((file, index) => (
                  <div key={index} className={styles.fileItem}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div 
          className={`${styles.submitButton} ${!files ? styles.disabled : ''}`}
          onClick={handleAttach}
        >
          <div className={styles.button}>
            {isLoading ? 'Uploading...' : 'OK'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttachFilesModal;