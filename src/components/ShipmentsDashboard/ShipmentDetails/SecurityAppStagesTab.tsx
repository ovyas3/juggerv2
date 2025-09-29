// components/ShipmentsDashboard/ShipmentDetails/SecurityAppStagesTab.tsx
import React, { useMemo } from 'react';
import { Typography, Box, Paper, IconButton, Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import styles from './SecurityAppStagesTab.module.css'; // You will need to create this CSS module

// Helper to format date/time
const toShortDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
};

const SecurityAppStagesTab = ({ shipmentData }: { shipmentData: any }) => {

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
    
    const hasAnyImages = useMemo(() => {
        return securityCheckStages.some((stage: any) =>
            stage.checklist?.some((item: any) => item.images && item.images.length > 0)
        );
    }, [securityCheckStages]);
    
    if (!hasAnyImages) {
        return (
            <Box className={styles.noImagesContainer}>
                <Typography>No Images have been uploaded via the Security App.</Typography>
            </Box>
        );
    }
    
    // Helper to download all images for a stage
    const downloadAllImages = (stage: any) => {
        const images: string[] = stage.checklist?.flatMap((item: any) => item.images?.map((img: any) => img.imageURL) || []) || [];
        images.forEach((url, index) => {
            setTimeout(() => {
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `stage_${stage.name}_image_${index + 1}.jpg`);
              link.setAttribute('target', '_blank');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }, index * 500); // Stagger downloads to prevent browser blocking
        });
    };

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
                if (stage.stageCode === 'VGI') return null; // Skip VGI as per Angular logic
                
                const stageImages: string[] = stage.checklist?.flatMap((item: any) => item.images?.map((img: any) => img.imageURL) || []) || [];

                return (
                    <Box key={stage._id} className={styles.stageContainer}>
                        <Box className={styles.stageHeader}>
                            <Typography variant="body1">
                                <strong>{stage.name || 'N/A'}</strong> - {toShortDateTime(stage.completed_at)}
                            </Typography>
                            {stageImages.length > 0 && (
                                <Tooltip title="Download All Images for this Stage">
                                    <IconButton size="small" onClick={() => downloadAllImages(stage)}>
                                        <DownloadIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                        <Paper variant="outlined" className={styles.imageGallery}>
                            {stageImages.length > 0 ? (
                                stageImages.map((imageUrl, index) => (
                                    <a href={imageUrl} target="_blank" rel="noopener noreferrer" key={index}>
                                        <img src={imageUrl} alt={`Stage ${stage.name} image ${index + 1}`} className={styles.thumbnail} />
                                    </a>
                                ))
                            ) : (
                                <Typography color="text.secondary" className={styles.noImagesText}>No images for this stage.</Typography>
                            )}
                        </Paper>
                    </Box>
                );
            })}
        </Box>
    );
};

export default SecurityAppStagesTab;