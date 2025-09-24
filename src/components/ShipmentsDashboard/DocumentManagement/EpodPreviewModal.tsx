import React, { useState, useEffect } from "react";
import {
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PreviewIcon from "@mui/icons-material/Preview";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import styles from "./EpodPreviewModal.module.css";
import service from "@/utils/timeService";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsPost } from "@/utils/Communication";
import ModalHeader from "../../UI/ModalHeader/ModalHeader";

interface EpodPreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    deliveries: any[];
    pickups: any[];
    do_numbers: string[];
    invoices: any[];
    carrier_waybills: any[];
    sin: string;
  };
}

const EpodPreviewModal = ({ open, onClose, data }: EpodPreviewModalProps) => {
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [previewPdf, setPreviewPdf] = useState("");
  const [isImage, setIsImage] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { showMessage } = useSnackbar();

  useEffect(() => {
    if (data?.deliveries?.length) {
      setSelectedDelivery(data.deliveries[0]);
      handleImagePreview(data.deliveries[0].epods[0]);
    }
  }, [data]);

  const handleImagePreview = (imageUrl: string) => {
    if (!imageUrl) return;

    const extension = imageUrl.split(".").pop()?.toLowerCase();
    if (extension === "pdf") {
      setPreviewPdf(imageUrl);
      setIsPdf(true);
      setIsImage(false);
    } else {
      setPreviewImage(imageUrl);
      setIsImage(true);
      setIsPdf(false);
    }
  };

  const handleDeliveryChange = (event: any) => {
    const delivery = data.deliveries.find(
      (d) => d.location.name === event.target.value
    );
    if (delivery) {
      setSelectedDelivery(delivery);
      handleImagePreview(delivery.epods[0]);
    }
  };

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const response = await httpsPost(
        "v1/shipment/approveEpod",
        {
          delivery: selectedDelivery._id,
          approved: true,
        },
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage("EPOD approved successfully", "success");
        onClose();
      }
    } catch (error: any) {
      console.error("Error approving EPOD:", error);
      showMessage(error.message || "Failed to approve EPOD", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) {
      showMessage("Please provide a reason for rejection", "error");
      return;
    }

    try {
      setIsLoading(true);
      const response = await httpsPost(
        "v1/shipment/approveEpod",
        {
          delivery: selectedDelivery._id,
          approved: false,
          reason: rejectReason,
        },
        {},
        4
      );

      if (response.statusCode === 200) {
        showMessage("EPOD has been rejected", "success");
        onClose();
      }
    } catch (error) {
      console.error("Error rejecting EPOD:", error);
      showMessage("Something went wrong", "error");
    } finally {
      setIsLoading(false);
      setIsRejecting(false);
    }
  };

  if (!selectedDelivery) return null;

  const {
    location,
    epods = [],
    finished_at,
    epod_uploaded_date,
    _id,
  } = selectedDelivery;
  const {
    invoices = [],
    carrier_waybills = [],
    pickups = [],
    do_numbers = [],
  } = data;

  const totalWeight = invoices.reduce((acc, curr) => {
    const invoiceNetWeight = curr.commercial_invoices?.reduce(
      (sum: number, ci: any) => sum + (ci.net_weight || 0),
      0
    );
    return acc + (invoiceNetWeight || 0);
  }, 0);

  const noOfPieces = invoices.reduce((acc, curr) => {
    return (
      acc +
      (curr.commercial_invoices?.reduce(
        (sum: number, ci: any) => sum + (ci.nop || 0),
        0
      ) || 0)
    );
  }, 0);

  const receivedQty = invoices.reduce((acc, curr) => {
    return (
      acc +
      (curr.commercial_invoices?.reduce(
        (sum: number, ci: any) => sum + (ci.others?.received_quantity || 0),
        0
      ) || 0)
    );
  }, 0);

  const invoiceNumber =
    invoices.length > 0
      ? invoices.flatMap(
          (i) => i.commercial_invoices?.map((c: any) => c.num) || []
        )
      : ["N/A"];

  const lrNumber =
    carrier_waybills.length > 0
      ? carrier_waybills
          .map((c) => c.CWB?.custom || c.CWB?.default || "")
          .filter(Boolean)
          .join(", ")
      : "N/A";

  const plantCode = pickups[0]?.location?.reference || "N/A";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.epodPreviewDialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.epodPreviewContainer}>
          <ModalHeader
            title={`Epods Preview - #${data.sin}`}
            onClose={onClose}
          />
          <div className={styles.epodPreviewBody}>
            <div className={styles.previewContainer}>
              <div className={styles.mainPreview}>
                {isImage && (
                  <img
                    src={previewImage}
                    alt="EPOD Preview"
                    className={styles.previewImage}
                  />
                )}
                {isPdf && (
                  <iframe
                    src={previewPdf}
                    className={styles.previewPdf}
                    title="PDF Viewer"
                  />
                )}
                <div className={styles.previewActions}>
                  <a
                    href={isImage ? previewImage : previewPdf}
                    download
                    className={styles.actionButton}
                  >
                    <DownloadIcon />
                  </a>
                  <button
                    onClick={() =>
                      window.open(isImage ? previewImage : previewPdf, "_blank")
                    }
                    className={styles.actionButton}
                  >
                    <PreviewIcon />
                  </button>
                </div>
              </div>

              <div className={styles.thumbnailContainer}>
                {epods.map((epod: string, index: number) => {
                  const ext = epod.split(".").pop()?.toLowerCase();
                  return (
                    <div
                      key={index}
                      className={styles.thumbnail}
                      onClick={() => handleImagePreview(epod)}
                    >
                      {ext === "pdf" ? (
                        <PictureAsPdfIcon className={styles.pdfIcon} />
                      ) : (
                        <img
                          src={epod}
                          alt={`Thumbnail ${index + 1}`}
                          className={styles.thumbnailImage}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.detailsPanel}>
              <div className={styles.deliverySelector}>
                <Select
                  fullWidth
                  value={selectedDelivery?.location?.name || ""}
                  onChange={handleDeliveryChange}
                  className={styles.selectInput}
                >
                  {data.deliveries.map((delivery) => (
                    <MenuItem key={delivery._id} value={delivery.location.name}>
                      {delivery.location.name}
                    </MenuItem>
                  ))}
                </Select>
              </div>

              <div className={styles.detailsSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Customer Name:</span>
                  <span className={styles.detailValue} title={location?.name}>
                    {location?.name}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Epod Upload Date:</span>
                  <span className={styles.detailValue}>
                    {epod_uploaded_date
                      ? service.utcToist(
                          epod_uploaded_date,
                          "dd-MMM-yy, hh:mm a"
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    Received Qty by Customer:
                  </span>
                  <span className={styles.detailValue}>{receivedQty}</span>
                </div>
              </div>

              <div className={styles.detailsSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>No of Pieces:</span>
                  <span className={styles.detailValue}>{noOfPieces}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Shipped Quantity:</span>
                  <span className={styles.detailValue}>{totalWeight} MT</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Plant Code:</span>
                  <span className={styles.detailValue}>{plantCode}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>DO Numbers:</span>
                  <span
                    className={styles.detailValue}
                    title={do_numbers.join(", ")}
                  >
                    {do_numbers.join(", ")}
                  </span>
                </div>
              </div>

              <div className={styles.detailsSection}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Invoice Number:</span>
                  <span
                    className={styles.detailValue}
                    title={invoiceNumber.join(", ")}
                  >
                    {invoiceNumber.join(", ")}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>LR Number:</span>
                  <span className={styles.detailValue} title={lrNumber}>
                    {lrNumber}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    Delivery Completion Date:
                  </span>
                  <span className={styles.detailValue}>
                    {finished_at
                      ? service.utcToist(finished_at, "dd-MMM-yy, hh:mm a")
                      : "N/A"}
                  </span>
                </div>
              </div>

              {isRejecting && (
                <div className={styles.rejectionDialog}>
                  <div className={styles.rejectionContent}>
                    <h3>Rejection Reason</h3>
                    <textarea
                      className={styles.reasonInput}
                      placeholder="Enter reason for rejection"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className={styles.rejectionActions}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsRejecting(false)}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleReject}
                        className={styles.submitButton}
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.actionButtons}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setIsRejecting(true)}
                  className={styles.rejectButton}
                >
                  Disapprove
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleApprove}
                  className={styles.approveButton}
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpodPreviewModal;
