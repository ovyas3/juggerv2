import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import styles from './UploadModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface UploadModalProps {
  show: boolean;
  title?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onUpload: (files: FileList) => void;
  onClose: () => void;
  isLoading?: boolean;
}

const UploadModal: React.FC<UploadModalProps> = ({
  show,
  title = 'Upload Files',
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
  multiple = true,
  maxSizeMB = 10,
  onUpload,
  onClose,
  isLoading = false
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    newFiles.forEach(file => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        invalidFiles.push(`${file.name} (File too large)`);
      } else if (accept && !accept.split(',').some(type => {
        const ext = type.trim().toLowerCase();
        if (ext.startsWith('.')) {
          return file.name.toLowerCase().endsWith(ext);
        }
        if (ext.endsWith('/*')) {
          return file.type.startsWith(ext.replace('/*', ''));
        }
        return file.type === ext;
      })) {
        invalidFiles.push(`${file.name} (Invalid file type)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setError(`The following files could not be uploaded:\n${invalidFiles.join('\n')}`);
    } else {
      setError('');
    }

    setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    onUpload(dataTransfer.files);
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.uploadDialog} onClick={e => e.stopPropagation()}>
        <ModalHeader 
           title={title}
           onClose={onClose}
        />
        
        <div 
          className={`${styles.uploadArea} ${isDragging ? styles.dragOver : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept={accept}
            multiple={multiple}
          />
          <div className={styles.uploadIcon}>📤</div>
          <div className={styles.uploadText}>
            {isDragging ? 'Drop files here' : 'Drag & drop files here or click to browse'}
          </div>
          <div className={styles.uploadHint}>
            Supported formats: {accept.split(',').join(', ')}
            <br />
            Max size: {maxSizeMB}MB per file
          </div>
        </div>

        {files.length > 0 && (
          <div className={styles.fileList}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName} title={file.name}>
                    {file.name}
                  </span>
                  <span className={styles.fileSize}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <button 
                  className={styles.removeFile}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className={styles.errorText}>{error}</div>}

        <div className={styles.dialogFooter}>
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
            disabled={isLoading || files.length === 0}
          >
            {isLoading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
