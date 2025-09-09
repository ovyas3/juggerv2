// AddManagedByModal.tsx
import React, { useState, useEffect } from 'react';
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from '@/utils/Communication';
import styles from './AddManagedByModal.module.css';
import ModalHeader from '@/components/UI/ModalHeader/ModalHeader';

interface Carrier {
  _id: string;
  name: string;
  parent_name?: string;
}

interface AddManagedByModalProps {
  show: boolean;
  shipmentId: string;
  shipmentNo: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddManagedByModal: React.FC<AddManagedByModalProps> = ({
  show,
  shipmentId,
  shipmentNo,
  onClose,
  onSuccess
}) => {
  const { showMessage } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<{ id: string; name: string }>({ id: '', name: '' });
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (show) {
      fetchCarriers();
    }
  }, [show]);

  const fetchCarriers = async () => {
    try {
      setIsLoading(true);
      const response = await httpsGet('carriers', 4);
      
      if (response.data?.length) {
        const formattedCarriers = response.data.map((carrier: any) => ({
          _id: carrier._id,
          name: carrier.name,
          parent_name: carrier.parent_name || ''
        }));
        setCarriers(formattedCarriers);
      }
    } catch (error: any) {
      console.error('Error fetching carriers:', error);
      showMessage(error.response?.data?.message || 'Failed to load carriers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCarrierSelect = (carrier: Carrier) => {
    setSelectedCarrier({
      id: carrier._id,
      name: carrier.parent_name || carrier.name
    });
    setSearchTerm(carrier.parent_name || carrier.name);
    setShowDropdown(false);
  };

  const handleSubmit = async () => {
    if (!selectedCarrier.id) {
      showMessage('Please select a carrier', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await httpsPost(
        'shipment/add_managed_by',
        {
          shipment: shipmentId,
          managedBy: selectedCarrier.id
        },
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage('Carrier Added Successfully', 'success');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error adding managed by:', error);
      showMessage(error.response?.data?.message || 'Failed to add carrier', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCarriers = carriers.filter(carrier => {
    const searchText = searchTerm.toLowerCase();
    const carrierName = (carrier.parent_name || carrier.name).toLowerCase();
    return carrierName.includes(searchText);
  });

  if (!show) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <ModalHeader title={`Add Managed By - #${shipmentNo}`} onClose={onClose} />

        <div className={styles.body}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Carrier:</label>
            <div className={styles.searchContainer}>
              <input
                type="text"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search carrier..."
              />
              {showDropdown && (
                <div className={styles.dropdown}>
                  {filteredCarriers.length > 0 ? (
                    filteredCarriers.map((carrier) => (
                      <div
                        key={carrier._id}
                        className={styles.dropdownItem}
                        onClick={() => handleCarrierSelect(carrier)}
                      >
                        {carrier.parent_name ? `${carrier.parent_name} - ${carrier.name}` : carrier.name}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noResults}>No carriers found</div>
                  )}
                </div>
              )}
            </div>
            {selectedCarrier.id && (
              <div className={styles.selectedCarrier}>
                Selected: {selectedCarrier.name}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={!selectedCarrier.id || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        {(isLoading || isSubmitting) && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddManagedByModal;