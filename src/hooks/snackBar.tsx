"use client"

import React, { useState, createContext, useContext, ReactNode } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import Slide, { SlideProps } from '@mui/material/Slide';

const Alert = React.forwardRef((props: AlertProps, ref: React.ForwardedRef<any>) => {
  return <MuiAlert elevation={6} variant="filled" ref={ref} {...props} />;
});

Alert.displayName = 'Alert';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const SnackbarContext = createContext<{
  showMessage: (message: string, severity: AlertProps['severity']) => void;
} | null>(null);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertProps['severity'],
    vertical: 'bottom' as const,
    horizontal: 'center' as const,
  });

  const showMessage = (message: string, severity: AlertProps['severity']) => {
    setState({
      ...state,
      open: true,
      message,
      severity,
    });
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setState({ ...state, open: false });
  };

  return (
    <SnackbarContext.Provider value={{ showMessage }}>
      {children}
      <Snackbar
        anchorOrigin={{
          vertical: state.vertical,
          horizontal: state.horizontal,
        }}
        open={state.open}
        autoHideDuration={2000}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
      >
        <Alert onClose={handleClose} severity={state.severity}>
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
