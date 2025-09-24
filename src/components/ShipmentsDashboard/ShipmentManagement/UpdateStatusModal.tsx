import React, { useState } from 'react';
import styles from './UpdateStatusModal.module.css';
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from '@/utils/Communication';
import ModalHeader from '../../UI/ModalHeader/ModalHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";

interface StatusOption {
  name: string;
  value: string;
}

interface UpdateStatusModalProps {
  show: boolean;
  shipmentNo: string;
  shipmentId: string;
  shipmentDetails: {
    from: { location: { reference?: string; name: string; city: string; }};
    to: { location: { reference?: string; name: string; city: string; }};
  };
  onClose: () => void;
  onSuccess?: () => void;
  isLoading?: boolean;
  dIndex?: number;
}

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  show, shipmentNo, shipmentId, shipmentDetails, onClose, onSuccess, isLoading = false, dIndex = 1
}) => {
  const { showMessage } = useSnackbar();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const shipmentStatus: StatusOption[] = [
    { name: 'Towards Pickup', value: 'SP' },
    { name: 'At Pickup', value: 'AP' }
  ];

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      showMessage('Please select a status', 'error');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await httpsPost(
        'shipment/update_status',
        { shipment: shipmentId, status: selectedStatus },
        {},
        4
      );

      if (response.statusCode === 200) {
        const statusName = shipmentStatus.find(s => s.value === selectedStatus)?.name || '';
        showMessage(`Shipment status updated to ${statusName}`, 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      showMessage(error.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.dialogMain} onClick={e => e.stopPropagation()}>
        {isLoading || isUpdating ? (
          <div className={styles.loader}>
            <div className={styles.load}><div className={styles.spinner}></div></div>
          </div>
        ) : null}
        
        <div className={styles.section}>
          <ModalHeader title={`Update Shipment Status - #${shipmentNo}`} onClose={onClose} />
          
          <div className={styles.commentSection}>
            <div className={styles.uploadFile}>
              <div className={styles.card}>
                <div className={styles.locTabs}>
                  <div className={styles.locTile}>
                    <div className={styles.icon}>
                      <span><label className={styles.pickIcon}>P1</label></span>
                      <span className={styles.location}>
                        {shipmentDetails.from.location.reference && `${shipmentDetails.from.location.reference} - `}
                        {shipmentDetails.from.location.name} - {shipmentDetails.from.location.city}
                      </span>
                    </div>
                  </div>
                  <div className={styles.locTile}>
                    <div className={styles.icon}>
                      <span><label className={styles.dropIcon}>D{dIndex}</label></span>
                      <span className={styles.location}>
                        {shipmentDetails.to.location.reference && `${shipmentDetails.to.location.reference} - `}
                        {shipmentDetails.to.location.name} - {shipmentDetails.to.location.city}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.reasonsMenu}>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  disabled={isLoading || isUpdating}
                >
                  <SelectTrigger className={styles.select}>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className={styles.selectContent}>
                    {shipmentStatus.map(status => (
                      <SelectItem 
                        key={status.value} 
                        value={status.value}
                        className={styles.selectItem}
                      >
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className={styles.submitButton} onClick={handleUpdateStatus}>
            <button className={styles.button} disabled={isLoading || isUpdating}>
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusModal;
