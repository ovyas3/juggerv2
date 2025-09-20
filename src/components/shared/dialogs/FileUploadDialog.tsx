import React, { useState, useCallback, ChangeEvent } from 'react';
import { Button, Typography, Box, List, ListItem, ListItemIcon, ListItemText, IconButton, Chip, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { CloudUpload, InsertDriveFile, Close } from '@mui/icons-material';
import BaseDialog, { BaseDialogProps } from './BaseDialog';

export interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface FileUploadDialogProps extends Omit<BaseDialogProps, 'title' | 'children' | 'actions'> {
  title?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  onUpload: (files: File[]) => Promise<void> | void;
  onClose?: () => void;
  uploadButtonText?: string;
  cancelButtonText?: string;
  allowedFileTypes?: string[];
  showPreview?: boolean;
}

const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  title,
  accept = '*/*',
  multiple = true,
  maxFiles = 10,
  maxSizeMB = 10,
  onUpload,
  onClose,
  uploadButtonText,
  cancelButtonText,
  allowedFileTypes,
  showPreview = true,
  ...rest
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFiles([]);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    if (onClose) onClose();
    if (rest.onClose) rest.onClose({}, 'backdropClick');
  }, [onClose, reset, rest]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const newFiles = Array.from(event.target.files || []);
      
      // Check file count
      if (files.length + newFiles.length > maxFiles) {
        setError(t('fileUpload.maxFilesError', { maxFiles }));
        return;
      }

      // Check file types if specified
      if (allowedFileTypes && allowedFileTypes.length > 0) {
        const invalidFiles = newFiles.filter(
          file => !allowedFileTypes.some(type => file.type.includes(type))
        );
        
        if (invalidFiles.length > 0) {
          setError(
            t('fileUpload.invalidFileType', { 
              types: allowedFileTypes.join(', ')
            })
          );
          return;
        }
      }

      // Check file sizes
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      const oversizedFiles = newFiles.filter(file => file.size > maxSizeBytes);
      
      if (oversizedFiles.length > 0) {
        setError(
          t('fileUpload.fileTooLarge', { 
            fileName: oversizedFiles[0].name,
            maxSize: maxSizeMB
          })
        );
        return;
      }

      // Create previews for images
      const filesWithPreviews = newFiles.map(file => {
        const fileWithPreview = Object.assign(file, {
          id: Math.random().toString(36).substr(2, 9),
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        });
        return fileWithPreview;
      });

      setFiles(prevFiles => [...prevFiles, ...filesWithPreviews]);
    },
    [files.length, maxFiles, maxSizeMB, allowedFileTypes, t]
  );

  const removeFile = useCallback((id: string) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(file => file.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prevFiles.filter(file => file.id !== id);
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) {
      setError(t('fileUpload.noFilesSelected'));
      return;
    }

    try {
      setIsUploading(true);
      await onUpload(files);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('fileUpload.uploadFailed'));
    } finally {
      setIsUploading(false);
    }
  }, [files, onUpload, handleClose, t]);

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  return (
    <BaseDialog
      title={title || t('fileUpload.uploadFiles')}
      {...rest}
      onClose={handleClose}
      actions={
        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
          <Button 
            onClick={handleClose} 
            disabled={isUploading}
            variant="outlined"
          >
            {cancelButtonText || t('common.cancel')}
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || files.length === 0}
            variant="contained"
            color="primary"
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading 
              ? t('common.uploading') 
              : uploadButtonText || t('common.upload')
            }
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 3 }}>
        <input
          type="file"
          id="file-upload"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        
        <Box
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
            p: 4,
            textAlign: 'center',
            mb: 2,
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <CloudUpload fontSize="large" color="action" sx={{ mb: 1 }} />
          <Typography variant="body1" gutterBottom>
            {t('fileUpload.dragAndDrop')}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('fileUpload.supportedFormats', { 
              types: allowedFileTypes?.join(', ') || t('fileUpload.anyFileType')
            })}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {t('fileUpload.maxSize', { size: maxSizeMB })}
          </Typography>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {files.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('fileUpload.selectedFiles', { count: files.length, maxFiles })}
            </Typography>
            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
              {files.map((file) => (
                <ListItem 
                  key={file.id}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      aria-label="remove"
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading}
                    >
                      <Close />
                    </IconButton>
                  }
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    pr: 6,
                  }}
                >
                  <ListItemIcon>
                    <InsertDriveFile />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography noWrap sx={{ maxWidth: 300 }}>
                        {file.name}
                      </Typography>
                    } 
                    secondary={`${(file.size / 1024).toFixed(1)} KB`} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </BaseDialog>
  );
};

export default FileUploadDialog;
