import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { httpsGet, httpsPost } from "@/utils/Communication";
import ModalHeader from "@/components/UI/ModalHeader/ModalHeader";
import Loader from "@/components/UI/Loader/Loader";
import styles from "./UpdateCarrierFreight.module.css";
import { useSnackbar } from "@/hooks/snackBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../UI/select";

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // For number inputs, prevent negative values and minus symbol
    if (['freight', 'weight', 'weight_price', 'price'].includes(name)) {
      // Prevent typing minus symbol
      if (value.includes('-')) {
        return;
      }
      
      // If the value is empty, allow it (for clearing the field)
      if (value === '') {
        setFreightData(prev => ({
          ...prev,
          [name]: ''
        }));
        return;
      }
      
      // Check if the value is a valid positive number
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        return; // Don't update if not a valid positive number
      }
      
      // Update the state with the valid number
      setFreightData(prev => ({
        ...prev,
        [name]: numValue
      }));
      
      // Special handling for weight/price calculation
      if ((name === 'weight' || name === 'weight_price') && freightData.weight && freightData.weight_price) {
        calculateFreightValues();
      }
      return;
    }

    // For non-number inputs, update normally
    setFreightData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle clearing of related fields
    if (name === 'freight' && value) {
      setFreightData(prev => ({
        ...prev,
        weight: '',
        weight_price: '',
        uom: 'KG',
      }));
    }

    if ((name === 'weight' || name === 'weight_price' || name === 'uom') && value) {
      setFreightData(prev => ({
        ...prev,
        freight: '',
      }));
      if (name !== 'uom') {
        setTimeout(calculateFreightValues, 0);
      }
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

  // Put these inside UpdateCarrierFreight component
const preventMinusKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
  const k = e.key;
  // Block minus, plus, and scientific notation keys
  if (k === '-' || k === '+' || k === 'e' || k === 'E' || e.code === 'Minus' || e.code === 'NumpadSubtract') {
    e.preventDefault();
  }
};

const preventInvalidBeforeInput: React.FormEventHandler<HTMLInputElement> = (e) => {
  // React's nativeEvent carries the inserted character
  const data = (e as unknown as React.SyntheticEvent & { nativeEvent: InputEvent }).nativeEvent?.data ?? '';
  if (data && /[^0-9.]/.test(data)) {
    e.preventDefault();
  }
};

const sanitizeOnPaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
  const text = e.clipboardData.getData('text');
  if (/[-+eE]/.test(text) || /[^\d.]/.test(text)) {
    e.preventDefault();
    const clean = text.replace(/[^0-9.]/g, ''); // keep only digits and one dot
    const name = e.currentTarget.name as 'freight' | 'weight' | 'weight_price' | 'price';
    setFreightData(prev => ({ ...prev, [name]: clean }));
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
                  onKeyDown={preventMinusKey}
  onBeforeInput={preventInvalidBeforeInput}
  onPaste={sanitizeOnPaste}
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
                    <Select
                      value={freightData.uom}
                      onValueChange={(value) =>
                        handleInputChange({
                          target: { name: "uom", value },
                        } as any)
                      }
                      disabled={loading}
                    >
                      <SelectTrigger className={styles.select}>
                        <SelectValue placeholder="UOM" className={styles.selectValue} />
                      </SelectTrigger>
                      <SelectContent className={styles.selectUnitContent}>
                        {weightUnits.map((unit) => (
                          <SelectItem key={unit} value={unit} className={styles.selectItem}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <Select
                    value={selectedReason}
                    onValueChange={(value) => {
                      setSelectedReason(value);
                      setShowOtherReason(value === "Other");
                      setFreightData((prev) => ({
                        ...prev,
                        reason: value !== "Other" ? value : "",
                      }));
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className={styles.select}>
                      <SelectValue placeholder="Select Reason" className={styles.selectValue} />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContent}>
                      {reasons.map((reason) => (
                        <SelectItem
                          key={reason}
                          value={reason}
                          className={styles.selectItem}
                        >
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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