import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { httpsGet, httpsPost } from "@/utils/Communication";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import Loader from "@/components/UI/Loader/Loader";
import styles from "./UpdateCarrierFreight.module.css";
import { useSnackbar } from "@/hooks/snackBar";

interface FreightData {
  freight: number | string;
  weight: number | string;
  weight_price: number | string;
  uom: string;
  price: number | string;
  reason: string;
}

interface UpdateCarrierFreightProps {
  open: boolean;
  onClose: () => void;
  shipmentId: string;
  onSuccess?: () => void;
  freightType: "rate" | "client_rate";
  sin?: string;
}

const UpdateCarrierFreight: React.FC<UpdateCarrierFreightProps> = ({
  open,
  onClose,
  shipmentId,
  onSuccess,
  freightType = "rate",
  sin,
}) => {
  const { t } = useTranslation();
  const { showMessage } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [showOtherReason, setShowOtherReason] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [weightUnits, setWeightUnits] = useState<
    Array<{ value: string; label: string }>
  >([{ value: "KG", label: "KG" }]);
  const [reasons, setReasons] = useState<string[]>(["Other"]);
  const [freightData, setFreightData] = useState<FreightData>({
    freight: "",
    weight: "",
    weight_price: "",
    uom: "KG",
    price: "",
    reason: "",
  });

  useEffect(() => {
    if (open) {
      fetchWeightUnits();
      fetchReasons();
    }
  }, [open]);

  const fetchWeightUnits = async () => {
    try {
      const response = await httpsGet(
        "constants/get_reasons?name=UOMConstants",
        4
      );
      if (
        response?.statusCode === 200 &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const items = response.data[0]?.value || [];
        const units = items
          .map((item: any) => {
            if (item && typeof item === "object") {
              return {
                value: String(item.value || "").trim(),
                label: String(item.name || item.value || "").trim(),
              };
            }
            const str = String(item || "").trim();
            return { value: str, label: str };
          })
          .filter((unit: { value: string }) => unit.value);

        setWeightUnits(
          units.length > 0 ? units : [{ value: "KG", label: "KG" }]
        );
      }
    } catch (error) {
      console.error("Error fetching weight units:", error);
      showMessage("Failed to load weight units", "error");
      setWeightUnits([{ value: "KG", label: "KG" }]);
    }
  };

  const fetchReasons = async () => {
    try {
      const response = await httpsGet(
        "constants/get_reasons?name=updateFreight",
        4
      );
      if (response.statusCode === 200 && response.data?.length > 0) {
        const reasonList = [...response.data[0].reason, "Other"];
        setReasons(reasonList);
      }
    } catch (error) {
      console.error("Error fetching reasons:", error);
      setReasons([
        "Price Negotiation",
        "Additional Charges",
        "Discount",
        "Other",
      ]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFreightData((prev) => ({
      ...prev,
      [name]:
        name.endsWith("price") ||
        name.endsWith("freight") ||
        name.endsWith("weight")
          ? value === ""
            ? ""
            : parseFloat(value) || 0
          : value,
    }));

    if (name === "freight" && value) {
      setFreightData((prev) => ({
        ...prev,
        weight: "",
        weight_price: "",
        uom: "KG",
      }));
    }

    if (
      (name === "weight" || name === "weight_price" || name === "uom") &&
      value
    ) {
      setFreightData((prev) => ({
        ...prev,
        freight: "",
      }));
      setTimeout(calculateFreightValues, 0);
    }
  };

  const calculateFreightValues = () => {
    if (freightData.weight && freightData.weight_price) {
      const totalPrice = (
        parseFloat(freightData.weight as string) *
        parseFloat(freightData.weight_price as string)
      ).toFixed(2);
      setFreightData((prev) => ({
        ...prev,
        price: totalPrice,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload: any = {
        reason: freightData.reason || "Carrier accepted this Freight rate",
        shipment: shipmentId,
        ...(freightData.freight && { price: freightData.freight }),
        ...(freightData.weight && {
          weight: freightData.weight,
          price_per_weight: freightData.weight_price,
          uom: freightData.uom,
        }),
      };

      if (payload.price || (payload.weight && payload.price_per_weight)) {
        const response = await httpsPost(
          "shipment/update_manual_rate",
          payload,
          {},
          4
        );

        if (response.status === 200) {
          showMessage("Freight updated successfully", "success");
          if (onSuccess) onSuccess();
          onClose();
        } else {
          showMessage(response.message || "Failed to update freight", "error");
        }
      } else {
        showMessage(
          "Please fill either Freight Amount or both Weight and Price Per Weight",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating freight:", error);
      showMessage("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const reason = e.target.value as string;
    setSelectedReason(reason);
    setShowOtherReason(reason === "Other");
    setFreightData((prev) => ({
      ...prev,
      reason: reason !== "Other" ? reason : "",
    }));
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          title={t(
            freightType === "rate"
              ? `Update Carrier Freight - #${sin}`
              : `Update Client Freight - #${sin}`
          )}
          onClose={onClose}
        />
        <div className={styles.content}>
          {loading ? (
            <Loader />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <input
                  type="number"
                  name="freight"
                  value={freightData.freight}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  placeholder="Freight Amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className={styles.divider}>
                <span>OR</span>
              </div>

              <div className={styles.weightSection}>
                <div className={styles.weightUomContainer}>
                  <div className={styles.weightInput}>
                    <input
                      type="number"
                      name="weight"
                      value={freightData.weight}
                      onChange={handleInputChange}
                      className={styles.inputField}
                      placeholder="Weight"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className={styles.uomSelect}>
                    <select
                      name="uom"
                      value={freightData.uom}
                      onChange={handleInputChange}
                      className={styles.selectField}
                    >
                      {weightUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="number"
                    name="weight_price"
                    value={freightData.weight_price}
                    onChange={handleInputChange}
                    className={styles.inputField}
                    placeholder="Price Per Weight"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <hr className={styles.horizontalRuler} />

              <div className={styles.finalDetailsSection}>
                <div className={styles.formGroup}>
                  <input
                    type="number"
                    name="price"
                    value={freightData.price}
                    onChange={handleInputChange}
                    className={styles.inputField}
                    placeholder="Freight Amount"
                    disabled={freightType !== "rate"}
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <select
                    value={selectedReason}
                    onChange={handleReasonChange}
                    className={styles.selectField}
                  >
                    <option value="">Select Reason</option>
                    {reasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {showOtherReason && (
                  <div className={styles.formGroup}>
                    <textarea
                      value={freightData.reason}
                      onChange={handleInputChange}
                      name="reason"
                      placeholder="Please specify the reason"
                      className={styles.reasonTextarea}
                    />
                  </div>
                )}
              </div>

              <div className={styles.footer}>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || !freightData.reason}
                >
                  {loading ? "Saving..." : "Submit"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateCarrierFreight;
