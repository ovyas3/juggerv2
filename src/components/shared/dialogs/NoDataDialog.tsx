import React, { ReactNode } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import BaseDialog, { BaseDialogProps } from './BaseDialog';

interface NoDataDialogProps extends Omit<BaseDialogProps, 'title' | 'children' | 'actions'> {
  title?: string;
  message?: string | ReactNode;
  icon?: ReactNode;
  primaryActionText?: string;
  secondaryActionText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  showPrimaryAction?: boolean;
  showSecondaryAction?: boolean;
  customActions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showCloseButton?: boolean;
  closeButtonText?: string;
}

const NoDataDialog: React.FC<NoDataDialogProps> = ({
  title,
  message,
  icon,
  primaryActionText,
  secondaryActionText,
  onPrimaryAction,
  onSecondaryAction,
  showPrimaryAction = true,
  showSecondaryAction = false,
  customActions,
  maxWidth = 'sm',
  showCloseButton = true,
  closeButtonText,
  onClose,
  ...rest
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown' | 'closeButtonClick') => {
    if (onClose) onClose(event, reason);
  };

  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    }
  };

  const defaultIcon = (
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        backgroundColor: theme.palette.grey[100],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          fill={theme.palette.grey[300]}
        />
        <path
          d="M12 7V13M12 17H12.01"
          stroke={theme.palette.grey[600]}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  );

  const defaultMessage = (
    <Typography variant="body1" align="center" color="textSecondary">
      {t('noData.noDataAvailable')}
    </Typography>
  );

  return (
    <BaseDialog
      title={title || t('noData.noData')}
      maxWidth={maxWidth}
      onClose={handleClose}
      {...rest}
      actions={
        customActions || (
          <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
            {showSecondaryAction && (
              <Button
                onClick={handleSecondaryAction}
                variant="outlined"
                color="primary"
              >
                {secondaryActionText || t('common.cancel')}
              </Button>
            )}
            {showPrimaryAction && (
              <Button
                onClick={handlePrimaryAction}
                variant="contained"
                color="primary"
              >
                {primaryActionText || t('common.ok')}
              </Button>
            )}
            {showCloseButton && (
              <Button
                onClick={() => handleClose({}, 'closeButtonClick')}
                variant={!showPrimaryAction ? 'contained' : 'text'}
                color="primary"
              >
                {closeButtonText || t('common.close')}
              </Button>
            )}
          </Box>
        )
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          textAlign: 'center',
        }}
      >
        {icon !== null && (icon || defaultIcon)}
        {message !== null && (
          <Box sx={{ mt: 2, mb: 1 }}>
            {message || defaultMessage}
          </Box>
        )}
      </Box>
    </BaseDialog>
  );
};

export default NoDataDialog;
