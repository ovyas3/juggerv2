import React, { ReactNode } from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  DialogProps as MuiDialogProps,
  SxProps,
  Theme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface BaseDialogProps extends Omit<MuiDialogProps, 'title'> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  fullScreen?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showCloseButton?: boolean;
  contentSx?: SxProps<Theme>;
}

const BaseDialog: React.FC<BaseDialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  fullScreen: fullScreenProp,
  maxWidth = 'sm',
  showCloseButton = true,
  contentSx,
  ...rest
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = fullScreenProp !== undefined ? fullScreenProp : isMobile;

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={maxWidth}
      fullWidth={!!maxWidth}
      aria-labelledby="dialog-title"
      {...rest}
      sx={{
        '& .MuiDialog-paper': {
          height: fullScreen ? '100%' : 'auto',
          maxHeight: fullScreen ? '100%' : '90%',
          ...(rest.sx as object),
        },
      }}
    >
      {title && (
        <MuiDialogTitle
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ typography: 'h6', fontWeight: 500 }}>{title}</Box>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </MuiDialogTitle>
      )}
      
      <MuiDialogContent 
        dividers 
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ...contentSx,
        }}
      >
        {children}
      </MuiDialogContent>
      
      {actions && (
        <MuiDialogActions sx={{ p: 2, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
          {actions}
        </MuiDialogActions>
      )}
    </MuiDialog>
  );
};

export default BaseDialog;
