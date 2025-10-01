// components/ShipmentsDashboard/ShipmentDetails/SecurityAppStagesTab.tsx
import React, { useMemo, useState } from 'react';
import {
    Typography,
    Box,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import styles from './SecurityAppStagesTab.module.css';
import { format } from 'date-fns';


// Helper to format date/time
const toShortDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
        return format(new Date(dateString), "dd-MMM-yyyy hh:mm a");
    } catch (e) {
        return 'N/A';
    }
};

const SecurityAppStagesTab = ({ shipmentData }: { shipmentData: any }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const securityCheckStages = useMemo(() => shipmentData?.security_check?.stages || [], [shipmentData]);

    const { loadingBay, executiveName } = useMemo(() => {
        let bay: string | null = null;
        let name: string | null = null;
        let lastRelevantStage: any = null;
        const relevantStageCodes = ['LIBA', 'LOBA', 'VGOA'];
        
        for (const stage of securityCheckStages) {
            if (relevantStageCodes.includes(stage.stageCode)) {
                if (stage.loadingBay || stage.loadingExecutiveName) {
                    if (!lastRelevantStage || stage.order > lastRelevantStage.order) {
                        lastRelevantStage = stage;
                    }
                }
            }
        }
        bay = lastRelevantStage?.loadingBay || null;
        name = lastRelevantStage?.loadingExecutiveName || null;
        
        return { loadingBay: bay, executiveName: name };
    }, [securityCheckStages]);
    
    // Helper to download all images for a stage
    const downloadAllImages = (stage: any) => {
        const images: string[] = stage.checklist?.flatMap((item: any) => 
            item.images?.map((img: any) => img.imageURL).filter((url: string | undefined) => url) || []
        ) || [];
        images.forEach((url, index) => {
            setTimeout(() => {
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `stage_${stage.name}_image_${index + 1}.jpg`);
              link.setAttribute('target', '_blank');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }, index * 500);
        });
    };

    const handleDownloadSingleImage = (imageUrl: string) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        const fileName = imageUrl.split('/').pop() || 'download.jpg';
        link.setAttribute('download', fileName);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCloseImage = () => setSelectedImage(null);

    // Check if there are any stages or any images across all stages
    const hasAnyImages = useMemo(() => {
        if (!securityCheckStages || securityCheckStages.length === 0) {
            return false;
        }
        return securityCheckStages.some((stage: any) => 
            stage.checklist?.some((item: any) => 
                item.images?.some((img: any) => img.imageURL)
            )
        );
    }, [securityCheckStages]);

    if (!hasAnyImages) {
        return (
            <Box className={styles.container} sx={{ alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <Typography color="text.secondary">
                    No Images uploaded yet
                </Typography>
            </Box>
        );
    }
    return (
        <Box className={styles.container}>
            {(loadingBay || executiveName) && (
                <Paper variant="outlined" className={styles.loadingDetails}>
                    <Typography variant="h6" className={styles.loadingTitle}>Loading Details</Typography>
                    {loadingBay && <Typography><strong>Loading Bay:</strong> {loadingBay}</Typography>}
                    {executiveName && <Typography><strong>Loading Executive:</strong> {executiveName}</Typography>}
                </Paper>
            )}

            {securityCheckStages.map((stage: any) => {
                // Skip VGI as per Angular logic and stages that have no images with a valid imageURL
                const stageImages = stage.checklist?.flatMap((item: any) =>
                    item.images?.filter((img: any) => img.imageURL).map((img: any) => img.imageURL) || []
                ) || [];

                if (stage.stageCode === 'VGI' || stageImages.length === 0) {
                    // Check if there are any images at all within this stage
                    const hasAnyImagesInStage = stage.checklist?.some((item: any) => item.images?.length > 0) || false;

                    if (!hasAnyImagesInStage) {
                        return null; // Don't render any block if there are no image entries
                    }

                    // Otherwise, render the block with the "No Images uploaded yet" message
                    return (
                        <Box key={stage._id} className={styles.stageContainer}>
                            <Box className={styles.stageHeader}>
                                <Typography variant="body1">
                                    <strong>{stage.name || 'N/A'}</strong> - {toShortDateTime(stage.completed_at)}
                                </Typography>
                            </Box>
                            <Paper variant="outlined" className={styles.imageGallery_2} >
                                <Typography 
                                    color="text.secondary" 
                                    sx={{ 
                                        width: 'auto',
                                        textAlign: 'center', 
                                        backgroundColor: '#f9f9f9', 
                                        p: 1 
                                    }}
                                >
                                    No Images uploaded yet
                                </Typography>
                            </Paper>
                        </Box>
                    );
                }

                return (
                    <Box key={stage._id} className={styles.stageContainer}>
                        <Box className={styles.stageHeader}>
                            <Typography variant="body1">
                                <strong>{stage.name || 'N/A'}</strong> - {toShortDateTime(stage.completed_at)}
                            </Typography>
                            <Tooltip title="Download All Images for this Stage">
                                <IconButton size="small" onClick={() => downloadAllImages(stage)}>
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Paper variant="outlined" className={styles.imageGallery}>
                            {stageImages.map((imageUrl: string, index: number) => (
                                <img 
                                    key={index} 
                                    src={imageUrl} 
                                    alt="" 
                                    className={styles.thumbnail}
                                    onClick={() => setSelectedImage(imageUrl)}
                                />
                            ))}
                        </Paper>
                    </Box>
                );
            })}

            {selectedImage && (
                <Dialog open={!!selectedImage} onClose={handleCloseImage} sx = {{maxWidth: '90vw', '& .MuiDialog-paper': { width: '35vw', maxHeight: '40vh' }
                }}>
                    <DialogTitle sx={{ m: 0, p: 2 }}>
                        Image Preview
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseImage}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent
                        dividers
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5', // Match stage header background
                        }}
                    >
                        <img src={selectedImage} alt="Selected" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </DialogContent>
                    <DialogActions sx={{
                        backgroundColor: '#f5f5f5', // Match stage header background
                    }}>
                        <Button 
                            onClick={() => handleDownloadSingleImage(selectedImage)} 
                            startIcon={<DownloadIcon />}
                            variant="contained"
                            sx={{ mr: 2, textTransform: 'Capitalize', backgroundColor: '#4f46e5', color: 'white' }}
                        >
                            Download
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
};

export default SecurityAppStagesTab;