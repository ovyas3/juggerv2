import React from "react";
import { Button } from "@/components/UI/button";
import { X } from "lucide-react";
import { MultiSelectDropdown } from "../MultiSelectDropdown/MultiSelectDropdown";
import styles from "./AdvancedFiltersPanel.module.css";

interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
}

interface AdvancedFiltersPanelProps {
  isOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  zoneOptions: FilterOption[];
  stateOptions: FilterOption[];
  materialOptions: FilterOption[];
  handleZoneChange: (opts: FilterOption[]) => void;
  setStateOptions: (opts: FilterOption[]) => void;
  setMaterialOptions: (opts: FilterOption[]) => void;
  applyFilters: () => void;
}

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  isOpen,
  setIsFilterOpen,
  zoneOptions,
  stateOptions,
  materialOptions,
  handleZoneChange,
  setStateOptions,
  setMaterialOptions,
  applyFilters,
}) => {

  const [distanceFrom, setDistanceFrom] = React.useState("");
  const [distanceTo, setDistanceTo] = React.useState("");

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.filterOverlay1} onClick={() => setIsFilterOpen(false)} />
      <div className={styles.filterSidePanel1}>
        <div className={styles.filterHeader1}>
          <h3 className={styles.filterTitle1}>Advanced Filters</h3>
          <Button
            variant="ghost"
            size="sm"
            className={styles.filterCloseButton1}
            onClick={() => setIsFilterOpen(false)}
          >
            <X className="h-2 w-2" size={15} />
          </Button>
        </div>

        <div className={styles.advancedFiltersContent}>
          <div className={styles.filterGroup}>
            <h4 className={styles.filterGroupTitle}>Zone</h4>
            <div className={styles.filterOptions}>
              <MultiSelectDropdown
                label="Select Zone"
                options={zoneOptions}
                onChange={handleZoneChange}
              />
            </div>
          </div>
          <div className={styles.filterGroup}>
            <h4 className={styles.filterGroupTitle}>State</h4>
            <div className={styles.filterOptions}>
              <MultiSelectDropdown
                label="Select State"
                options={stateOptions}
                onChange={setStateOptions}
              />
            </div>
          </div>
          <div className={styles.filterGroup}>
            <h4 className={styles.filterGroupTitle}>Material</h4>
            <div className={styles.filterOptions}>
              <MultiSelectDropdown
                label="Select Material"
                options={materialOptions}
                onChange={setMaterialOptions}
              />
            </div>
          </div>
          <div className={styles.filterGroup}>
            <h4 className={styles.filterGroupTitle}>Distance (KM)</h4>
            <div className={styles.filterOptions} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="number"
                min={0}
                placeholder="From"
                value={distanceFrom}
                onChange={e => setDistanceFrom(e.target.value)}
                className={styles.distanceInput}
                style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
              />
              <span style={{ alignSelf: "center" }}>to</span>
              <input
                type="number"
                min={0}
                placeholder="To"
                value={distanceTo}
                onChange={e => setDistanceTo(e.target.value)}
                className={styles.distanceInput}
                style={{ width: 80, padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db" }}
              />
            </div>
          </div>
        </div>

        <div className={styles.advancedFiltersFooter}>
          <button className={styles.clearButton} onClick={() => setIsFilterOpen(false)}>
            Cancel
          </button>
          <button className={styles.applyButton} onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default AdvancedFiltersPanel;