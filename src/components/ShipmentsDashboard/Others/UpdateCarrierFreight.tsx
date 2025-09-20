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
  const [weightUnits, setWeightUnits] = useState<string[]>(["KG"]);
  const [reasons, setReasons] = useState<string[]>(["Other"]);
  const [freightData, setFreightData] = useState<FreightData>({
    freight: "",
    weight: "",
    weight_price: "",
    uom: "KG",
    price: "",
    reason: "",
  });
  const [manualPrice, setManualPrice] = useState<string | number>("");

  useEffect(() => {
    if (open) {
      setFreightData({
        freight: "",
        weight: "",
        weight_price: "",
        uom: "KG",
        price: "",
        reason: "",
      });
      setManualPrice("");
      setSelectedReason("");
      setShowOtherReason(false);
      fetchWeightUnits();
      fetchReasons();
    }
    // eslint-disable-next-line
  }, [open]);

  // Fetch UOM units
  const fetchWeightUnits = async () => {
    try {
      const response = await httpsGet("constants/get_reasons?name=UOMConstants", 4);
      if (
        response?.statusCode === 200 &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const items = response.data[0]?.value || [];
        const units = items.map((item: any) =>
          typeof item === "object" ? String(item.value || "").trim() : String(item || "").trim()
        );
        setWeightUnits(units.length > 0 ? units : ["KG"]);
      }
    } catch {
      setWeightUnits(["KG"]);
    }
  };

  // Fetch reasons
  const fetchReasons = async () => {
    try {
      const response = await httpsGet(
        freightType === "client_rate"
          ? "constants/get_reasons?name=client_price"
          : "constants/get_reasons?name=updateFreight",
        4
      );
      if (response.statusCode === 200 && response.data?.length > 0) {
        setReasons([...response.data[0].reason, "Other"]);
      }
    } catch {
      setReasons(["Other"]);
    }
  };

  // Input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFreightData((prev) => ({
      ...prev,
      [name]:
        name === "freight" ||
        name === "weight" ||
        name === "weight_price" ||
        name === "price"
          ? value === "" ? "" : parseFloat(value)
          : value,
    }));

    // If entering freight, clear weight/price/uom
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
        Number(freightData.weight) * Number(freightData.weight_price)
      ).toFixed(2);
      setFreightData((prev) => ({
        ...prev,
        price: totalPrice,
      }));
    }
  };

  // Reason dropdown change
  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reason = e.target.value;
    setSelectedReason(reason);
    setShowOtherReason(reason === "Other");
    setFreightData((prev) => ({
      ...prev,
      reason: reason !== "Other" ? reason : "",
    }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: require reason and either freight or (weight & price per weight)
    if (!selectedReason && !freightData.reason) {
      showMessage("Please select a reason", "error");
      return;
    }
    if (
      !freightData.freight &&
      (!freightData.weight || !freightData.weight_price)
    ) {
      showMessage(
        "Please fill either Freight Amount or both Weight and Price Per Weight",
        "error"
      );
      return;
    }

    setLoading(true);

    // Prepare payload
    let payload: any = {
      reason: showOtherReason ? freightData.reason : selectedReason,
      shipment: shipmentId,
    };

    if (freightType === "rate") {
  if (manualPrice) payload.price = manualPrice;
  if (freightData.freight) payload.price = freightData.freight;
  if (freightData.weight && freightData.weight_price) {
    payload.weight = freightData.weight;
    payload.price_per_weight = freightData.weight_price;
    payload.uom = freightData.uom;
  }
} else {
  // client_rate
  if (freightData.freight) payload.client_price = freightData.freight;
  if (freightData.weight && freightData.weight_price) {
    payload.weight = freightData.weight;
    payload.price_per_weight = freightData.weight_price;
    payload.uom = freightData.uom;
  }
}

    try {
      const url =
        freightType === "rate"
          ? "shipment/update_manual_rate"
          : "shipment/add_client_price";
      const response = await httpsPost(url, payload, {}, 4);

      if (response.statusCode === 200) {
        showMessage("Freight updated successfully", "success");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showMessage(response.message || "Failed to update freight", "error");
      }
    } catch (error: any) {
      showMessage(error.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <ModalHeader
          title={
            freightType === "rate"
              ? `Update Carrier Freight${sin ? ` - #${sin}` : ""}`
              : `Update Client Freight${sin ? ` - #${sin}` : ""}`
          }
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
                        <option key={unit} value={unit}>
                          {unit}
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

             <div className={styles.formGroup}>
  <input
    type="number"
    className={styles.inputField}
    placeholder="Freight"
    value={
      freightData.freight !== ""
        ? freightData.freight
        : freightData.weight && freightData.weight_price
        ? Number(freightData.weight) * Number(freightData.weight_price)
        : ""
    }
    readOnly
    disabled={freightType !== "rate"}
  />
</div>

              <div className={styles.finalDetailsSection}>
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
                  disabled={
                    loading ||
                    (!selectedReason && !freightData.reason) ||
                    (!freightData.freight &&
                      (!freightData.weight || !freightData.weight_price))
                  }
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