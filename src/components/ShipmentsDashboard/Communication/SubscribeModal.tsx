import React, { useState, useEffect } from "react";
import { httpsPost, httpsGet } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";
import service from "@/utils/timeService"; // adjust path as needed
import styles from "./SubscribeModal.module.css"; // Use the CSS provided previously
import router from "next/router";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import { Loader2 } from "lucide-react";

const carrierMessages = {
  airtel: "Please provide your consent to track your location by your service provider, Please reply with Y to 5114040",
  vodafone: "Please provide your consent to track your location by your service provider, Please reply with Y to 55502 from Idea Number or send Y to 9167500066 from Vodafone number",
  jio: "Please provide your consent to track your location by your service provider, Please reply with Y to 5168524"
};

const SubscribeModal = ({ open, onClose, shipment }: { open: boolean, onClose: (value: boolean) => void, shipment: any }) => {
  const snackbar = useSnackbar();

  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState("");
  const [consent, setConsent] = useState("");
  const [carrier, setCarrier] = useState("");
  const [message, setMessage] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [unsubscribeNow, setUnsubscribeNow] = useState(true);

  // Fetch SIM status when modal opens
  useEffect(() => {
    if (!open || !shipment) return;
    setLoading(true);
    httpsGet("shipment/simTrack/status?id=" + shipment._id, 4)
      .then((resp) => {
        if (resp.statusCode === 200) {
          const d = resp.data;
          setSubStatus(d.isSubscribed ? "Yes" : "No");
          setConsent(d.isConsent ? "Yes" : "No");
          setCarrier(d.carrier || "");
          setMessage(carrierMessages[(d.carrier || "").toLowerCase() as keyof typeof carrierMessages] || d.message || "");
          setDateTime(d.consentDate ? service.utcToist(d.consentDate, 'dd-MMM-yy, hh:mm a') : "");
          setUnsubscribeNow(true);
        }
      })
      .catch((e) => {
        snackbar.showMessage(e.message || "Unable to fetch subscription status", "error");
        onClose(false);
      })
      .finally(() => setLoading(false));
  }, [open, shipment, snackbar, onClose]);

  // Subscribe/Unsubscribe actions
  const performAction = (action: string) => {
    setLoading(true);
    const url = action === "subscribe" 
      ? "shipment/simTrack/subscribe" 
      : "shipment/simTrack/unsubscribe";
    const payload = { id: shipment._id };
    // if (shipment.carrier?._id) payload.carrier = shipment.carrier._id;
  
    httpsPost(url, payload, {}, 4)
      .then((resp) => {
        if (resp.statusCode === 200) {
          setSubStatus(resp.data.isSubscribed ? "Yes" : "No");
          setConsent(resp.data.isConsent ? "Yes" : "No");
          setUnsubscribeNow(false);
          snackbar.showMessage(
            action === "subscribe"
              ? "Subscription Successful"
              : "Unsubscribed Successfully",
            "success"
          );
          onClose(true); // pass true if data was changed
        } else {
          throw new Error(resp.message || "Failed to perform action");
        }
      })
      .catch((e) => snackbar.showMessage(e.message || "An error occurred", "error"))
      .finally(() => {
        setLoading(false);
        setConfirm(false);
      });
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={() => onClose(false)}>
      <div
        className={styles.locationsPopupDialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.locationsPopupContainer}>
          <ModalHeader 
            title={`Shipment #${shipment.sin} | ${shipment.status}`} 
            onClose={() => onClose(false)} 
          />
          <div className={styles.body}>
            {loading ? (
              <div className={styles.loader}>
                <Loader2 className={styles.loaderIcon} />
              </div>
            ) : (
              <div className={styles.content}>
                <div
                  className={styles.firstRow}
                  style={{ display: unsubscribeNow ? "flex" : "none" }}
                >
                  <div className={styles.statusLabel}>Subscription status</div>
                  <div className={styles.colon}>:</div>
                  <div
                    className={styles.yesNo}
                    style={{
                      color: subStatus === "Yes" ? "#178c04" : "#ff0000"
                    }}
                  >
                    {subStatus}
                  </div>
                  <div
                    className={styles.submitButton}
                    style={{
                      backgroundColor: subStatus === "Yes" ? "#fff" : "#4f46e5"
                    }}
                  >
                    <div
                      className={styles.button}
                      onClick={() => setConfirm(true)}
                    >
                      {subStatus === "Yes"
                        ? "Unsubscribe"
                        : "Subscribe"}
                    </div>
                  </div>
                </div>
                <div
                  className={styles.secondRow}
                  style={{
                    display:
                      unsubscribeNow && subStatus === "Yes" ? "flex" : "none"
                  }}
                >
                  <div className={styles.consent}>Consent By Driver</div>
                  <div className={styles.colon}>:</div>
                  <div
                    className={styles.yesNo}
                    style={{
                      color: consent === "Yes" ? "#178c04" : "#ff0000"
                    }}
                  >
                    {consent}
                  </div>
                </div>
                {dateTime && (
                  <div className={styles.row}>
                    <div className={styles.label}>Consent Date</div>
                    <div className={styles.colon}>:</div>
                    <div className={styles.value}>{dateTime}</div>
                  </div>
                )}
                {carrier && (
                  <div className={styles.row}>
                    <div className={styles.label}>Carrier</div>
                    <div className={styles.colon}>:</div>
                    <div className={styles.value}>{carrier}</div>
                  </div>
                )}
                {message && (
                  <div className={styles.message}>
                    <div className={styles.mes}>{message}</div>
                  </div>
                )}
                {confirm && (
                  <div className={styles.confirmation}>
                    <span className={styles.text}>
                      Do you want to {subStatus === "Yes" ? "Unsubscribe" : "Subscribe"}?
                    </span>
                    <span className={styles.yes}>
                      <div className={styles.submitButtonYes}>
                        <div
                          className={styles.button}
                          onClick={() =>
                            performAction(
                              subStatus === "Yes" ? "unsubscribe" : "subscribe"
                            )
                          }
                        >
                          Yes
                        </div>
                      </div>
                    </span>
                    <span className={styles.no}>
                      <div className={styles.submitButtonNo}>
                        <div className={styles.button} onClick={() => setConfirm(false)}>
                          No
                        </div>
                      </div>
                    </span>
                  </div>
                )}
                {!unsubscribeNow && (
                  <div className={styles.unsubscribedNow}>
                    <div className={styles.unsubscribeText}>
                      You are {subStatus === "Yes" ? "Unsubscribed" : "Subscribed"} now
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.note}>
            <div className={styles["note-text"]}>Note</div>
            <div className={styles.text}>
              {/* Customize disclaimer as needed */}
              Unsubscribe and Subscribe to send SMS<br />
              SIM tracking request status takes at least 1 hour to update
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribeModal;
