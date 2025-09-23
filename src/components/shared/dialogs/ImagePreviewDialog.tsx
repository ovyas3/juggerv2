import React, { useCallback, useRef } from 'react';
import { Box, Button, IconButton, Typography, useTheme, DialogProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Download, Close, ZoomIn, ZoomOut, RotateLeft, RotateRight } from '@mui/icons-material';
import BaseDialog from './BaseDialog';

export interface ImagePreviewDialogProps extends Omit<DialogProps, 'title' | 'children' | 'onClose'> {
  imageUrl: string;
  title?: string;
  fileName?: string;
  onDownload?: (imageUrl: string, fileName?: string) => void;
  onClose?: () => void;
  downloadButtonText?: string;
  closeButtonText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showDownloadButton?: boolean;
  showZoomControls?: boolean;
  showRotationControls?: boolean;
}

const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  imageUrl,
  title: dialogTitle,
  fileName,
  onDownload,
  onClose,
  downloadButtonText,
  closeButtonText,
  maxWidth = 'md',
  showDownloadButton = true,
  showZoomControls = true,
  showRotationControls = true,
  ...rest
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload(imageUrl, fileName);
    } else {
      // Default download behavior
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = fileName || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [imageUrl, fileName, onDownload]);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const rotateLeft = useCallback(() => {
    setRotation(prev => (prev - 90) % 360);
  }, []);

  const rotateRight = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const resetTransform = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const title = dialogTitle || (fileName ? `${t('imagePreview.previewOf')} ${fileName}` : t('imagePreview.imagePreview'));

  return (
    <BaseDialog
      title={title}
      maxWidth={maxWidth}
      onClose={onClose || (() => {})}
      {...rest}
      actions={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {(showZoomControls || showRotationControls) && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {showZoomControls && (
                  <>
                    <IconButton 
                      onClick={zoomOut} 
                      disabled={zoom <= 0.5}
                      title={t('imagePreview.zoomOut')}
                      size="small"
                    >
                      <ZoomOut />
                    </IconButton>
                    <IconButton 
                      onClick={zoomIn} 
                      disabled={zoom >= 3}
                      title={t('imagePreview.zoomIn')}
                      size="small"
                    >
                      <ZoomIn />
                    </IconButton>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                      {Math.round(zoom * 100)}%
                    </Typography>
                  </>
                )}
                {showRotationControls && (
                  <>
                    <IconButton 
                      onClick={rotateLeft} 
                      title={t('imagePreview.rotateLeft')}
                      size="small"
                    >
                      <RotateLeft />
                    </IconButton>
                    <IconButton 
                      onClick={rotateRight} 
                      title={t('imagePreview.rotateRight')}
                      size="small"
                    >
                      <RotateRight />
                    </IconButton>
                  </>
                )}
                {(zoom !== 1 || rotation !== 0) && (
                  <Button 
                    size="small" 
                    onClick={resetTransform}
                    sx={{ ml: 1 }}
                  >
                    {t('imagePreview.reset')}
                  </Button>
                )}
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {showDownloadButton && (
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownload}
                size="small"
              >
                {downloadButtonText || t('common.download')}
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleClose}
              size="small"
            >
              {closeButtonText || t('common.close')}
            </Button>
          </Box>
        </Box>
      }
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          bgcolor: 'background.default',
          overflow: 'auto',
          height: '100%',
          maxHeight: '70vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box
          sx={{
            position: 'relative',
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-in-out',
            transformOrigin: 'center center',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={fileName || t('imagePreview.previewImage')}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[2],
            }}
            draggable={false}
          />
        </Box>
      </Box>
      
      {fileName && (
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Typography variant="body2" color="textSecondary">
            {t('imagePreview.fileName')}: {fileName}
          </Typography>
        </Box>
      )}
    </BaseDialog>
  );
};

export default ImagePreviewDialog;
