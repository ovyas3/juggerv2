import React from 'react';
import { Button, Typography, Box, DialogProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BaseDialog from './BaseDialog';

export interface ConfirmationDialogProps extends Omit<DialogProps, 'title' | 'children' | 'onClose'> {
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmButtonProps?: object;
  cancelButtonProps?: object;
  severity?: 'error' | 'warning' | 'info' | 'success';
  onClose?: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel: onCancelProp,
  confirmButtonProps = {},
  cancelButtonProps = {},
  severity = 'warning',
  onClose,
  ...rest
}) => {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancelProp) onCancelProp();
    if (onClose) onClose();
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'primary';
    }
  };

  return (
    <BaseDialog
      title={title || t('common.confirmAction')}
      {...rest}
      onClose={onClose || (() => {})}
      actions={
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            color="inherit"
            {...cancelButtonProps}
          >
            {cancelText || t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            color={getSeverityColor()}
            {...confirmButtonProps}
          >
            {confirmText || t('common.confirm')}
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 3 }}>
        {typeof message === 'string' ? (
          <Typography>{message}</Typography>
        ) : (
          message
        )}
      </Box>
    </BaseDialog>
  );
};

export default ConfirmationDialog;
