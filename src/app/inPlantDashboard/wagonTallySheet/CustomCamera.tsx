import React, { useState, useCallback, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import Image from 'next/image';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Camera from '@/assets/camera.svg';
import CloseButtonIcon from "@/assets/close_icon.svg";
import CameraCapture from '@/assets/camera_capture.svg';
import CameraRotate from '@/assets/camera_rotate.svg';
import Lightning from '@/assets/lightning.svg';
import LightningSlash from '@/assets/lightning-slash.svg';
import Tooltip from "@mui/material/Tooltip";
import { TooltipProps } from "@mui/material/Tooltip";
import { useTranslations } from "next-intl";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface StyledTooltipProps extends TooltipProps {
  className?: string;
}

const CustomTooltip = styled(({ className, ...props }: StyledTooltipProps) => (
  <Tooltip 
    {...props} 
    classes={{ popper: className }} 
    PopperProps={{
      popperOptions: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [14, -10], // Adjust the second value to change the vertical offset
            },
          },
        ],
      },
    }}
  />
))({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#000',
    color: '#fff',
    width: '100px',
    height: '24px',
    boxShadow: '0px 0px 2px rgba(0,0,0,0.1)',
    fontSize: '8px',
    fontFamily: '"Inter", sans-serif',
  },
  '& .MuiTooltip-arrow': {
    color: '#000',
  },
});


interface PhotoCaptureComponentProps {
  label: string;
  onConfirm: (images: (string | null)[]) => void;
}

const PhotoCaptureComponent: React.FC<PhotoCaptureComponentProps> = ({ label, onConfirm }) => {
  const text = useTranslations("WAGONTALLYSHEET");
  const [open, setOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState('user');
  const webcamRef = useRef<Webcam>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setCapturedImage(null);
    setOpen(false);
  };

  const switchCamera = async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: {
        facingMode: { exact: facingMode }, // Access rear or front camera based on current mode
      },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      // Update webcam video source
      if (webcamRef.current && webcamRef.current.video) {
        webcamRef.current.video.srcObject = stream;
      }
      setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    } catch (error) {
      console.error("Error accessing camera: ", error);
    }
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const confirmPhoto = () => {
    if (capturedImage) {
      onConfirm([capturedImage]);
      setCapturedImage(null);
      handleClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const toggleFlash = () => {
    if (mediaStreamRef.current) {
        const videoTrack = mediaStreamRef.current.getVideoTracks()[0];

        if (videoTrack) {
            // Use type assertion to specify that capabilities have a torch property
            const capabilities = videoTrack.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };

            if (capabilities.torch !== undefined) { // Check if torch capability exists
              videoTrack.applyConstraints({
                  advanced: [{ torch: !isFlashOn } as any],
              });
              setIsFlashOn(prev => !prev); // Toggle flash state
          } else {
              console.warn("Torch not supported on this device.");
          }
        }
    }
};




  useEffect(() => {
    switchCamera(); 

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <div className="wagon-tally-sheet-body-content-wagon-details-photo" onClick={handleOpen}>
        <Image src={Camera} alt="Camera" />
        <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{label}</p>
      </div>

      <BootstrapDialog 
        open={open} 
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        className="camera-dialog-styles"
      >
        <div className='camera-dialog-container'>
          <DialogContent>
            <div
              aria-label="close"
              onClick={handleClose}
              className="camera-close-icon"
            >
              <Image src={CloseButtonIcon} alt="close" />
            </div>

            {capturedImage ? (
              <>
                <Image
                  src={capturedImage}
                  alt="Captured"
                  className="captured-image"
                  width={560}
                  height={320}
                />
                <div className='camera-buttons-container'>
                  <div 
                    onClick={confirmPhoto}
                    className='confirm-image-button'>
                    {text('confirm')} ✔
                  </div>
                  <div 
                    onClick={retakePhoto}
                    className='retake-image-button'>
                    {text('reTake')} ❌
                  </div>
                </div>
              </>
            ) : (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode }}
                  className="webcam-view"
                />
                <div className='camera-buttons-container'>
                <CustomTooltip 
                  arrow 
                  title={
                    <div 
                      style={{
                        display: 'flex', 
                        width: '100%',
                        flexDirection: 'row', 
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                        paddingTop: '2px',
                        gap: '2px'
                    }}>
                      {text('switchCamera')} 
                    </div>}>
                    <div onClick={switchCamera} className='switch-button' title="Switch Camera">
                      <Image src={CameraRotate} alt="Switch Camera" />
                    </div>
                </CustomTooltip>

                  <CustomTooltip 
                  arrow 
                  title={
                    <div 
                      style={{
                        display: 'flex', 
                        width: '100%',
                        flexDirection: 'row', 
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                        paddingTop: '2px',
                        gap: '2px'
                    }}>
                       {text('captureImage')} 
                    </div>}>
                    <div onClick={capturePhoto} className="capturing-button">
                      <div className="outer-circle">
                        <div className="inner-circle">
                          <Image src={CameraCapture} alt="Capture" />
                        </div>
                      </div>
                    </div>
                  </CustomTooltip>

                  <CustomTooltip 
                  arrow 
                  title={
                    <div 
                      style={{
                        display: 'flex', 
                        width: '100%',
                        flexDirection: 'row', 
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                        paddingTop: '2px',
                        gap: '2px'
                    }}>
                      {isFlashOn ?  text('turnFlashOff') :  text('turnFlashOn') }
                    </div>}>
                    <div onClick={toggleFlash} className='switch-button' title={isFlashOn ? "Turn Flash Off" : "Turn Flash On"}>
                      <Image src={isFlashOn ? LightningSlash : Lightning} alt={isFlashOn ? "Turn Flash Off" : "Turn Flash On"} />
                    </div>
                  </CustomTooltip>
                </div>
              </>
            )}
          </DialogContent>
        </div>
      </BootstrapDialog>
    </div>
  );
};

export default PhotoCaptureComponent;