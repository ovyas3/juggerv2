"use client";

import React, {
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { Truck, Train } from "lucide-react";
import { useMediaQuery, useTheme } from "@mui/material";
import { Modal, Box, Button as MuiButton } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

function Button({ className = "", children }: ButtonProps) {
  return <button className={`button ${className}`}>{children}</button>;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

function Input({ className = "", ...props }: InputProps) {
  return <input className={`input ${className}`} {...props} />;
}

// Custom Label Component
interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

function Label({ className = "", children }: LabelProps) {
  return <label className={`label ${className}`}>{children}</label>;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

function Select({
  className = "",
  placeholder,
  onValueChange,
  children,
  ...props
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(value);
    }
  };

  return (
    <div className="select-container">
      <div className={`select ${className}`} onClick={() => setIsOpen(!isOpen)}>
        {selectedValue || placeholder || "Select an option"}
      </div>
      {isOpen && (
        <div className="select-dropdown">
          {React.Children.map(children, (child) => {
            if (
              React.isValidElement<SelectItemProps>(child) &&
              child.type === SelectItem
            ) {
              return React.cloneElement(child, {
                onSelect: () => handleSelect(child.props.value),
              } as SelectItemProps);
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  onSelect?: () => void;
}

function SelectItem({ value, children, onSelect }: SelectItemProps) {
  return (
    <div className="select-item" onClick={onSelect}>
      {children}
    </div>
  );
}

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

function Card({ className = "", children }: CardProps) {
  return <div className={`card ${className}`}>{children}</div>;
}

function CardContent({ className = "", children }: CardProps) {
  return <div className={`card-content ${className}`}>{children}</div>;
}

function CardHeader({ className = "", children }: CardProps) {
  return <div className={`card-header ${className}`}>{children}</div>;
}

function CardTitle({ className = "", children }: CardProps) {
  return <h2 className={`card-title ${className}`}>{children}</h2>;
}

interface ResultsTableProps {
  results: {
    roadCostPerMT: number;
    railCostPerMT: number;
    totalRoadCost: number;
    totalRailCost: number;
    transitDays: number;
  };
}

function ResultsTable({ results }: ResultsTableProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const shareToWhatsApp = () => {
    const message = `Freight Estimation Results:\n\nMode: Road\nCost per MT: ₹${results.roadCostPerMT.toFixed(
      2
    )}\nTotal Cost: ₹${results.totalRoadCost.toFixed(2)}\nTransit Days: ${
      results.transitDays
    }\n\nMode: Rail\nCost per MT: ₹${results.railCostPerMT.toFixed(
      2
    )}\nTotal Cost: ₹${results.totalRailCost.toFixed(2)}\nTransit Days: ${
      results.transitDays
    }\n\nEstimated transit time: ${results.transitDays} days`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="results-table">
      <table className="results-table-inner">
        <thead className="results-table-header">
          <tr>
            <th>Mode</th>
            <th>Cost per MT (₹/MT)</th>
            <th>Total Cost(₹)</th>
            <th>Transit Days</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ alignItems: "center", display: "flex" }}>
              <Truck size={24} />
              &nbsp;Road
            </td>
            <td>{results.roadCostPerMT.toFixed(2)}</td>
            <td>{results.totalRoadCost.toFixed(2)}</td>
            <td>{results.transitDays}</td>
          </tr>
          <tr>
            <td style={{ alignItems: "center", display: "flex" }}>
              <Train size={24} />
              &nbsp;Rail
            </td>
            <td>{results.railCostPerMT.toFixed(2)}</td>
            <td>{results.totalRailCost.toFixed(2)}</td>
            <td>{results.transitDays}</td>
          </tr>
        </tbody>
      </table>
      <div></div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p>
          <span style={{ fontWeight: 600, fontSize: "12px" }}>
            Estimated transit time:{" "}
          </span>
          <b>{results.transitDays}</b> days
        </p>
        <div>
          <MuiButton
            variant="contained"
            color="primary"
            startIcon={<WhatsAppIcon />}
            onClick={handleOpen}
          >
            Share via WhatsApp
          </MuiButton>
          <Modal open={open} onClose={handleClose}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "background.paper",
                border: "2px solid #000",
                boxShadow: 24,
                p: 4,
              }}
            >
              <Typography variant="h6" component="h2">
                Share Results via WhatsApp
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Click the button below to share the results via WhatsApp.
              </Typography>
              <MuiButton
                variant="contained"
                color="primary"
                startIcon={<WhatsAppIcon />}
                onClick={shareToWhatsApp}
                sx={{ mt: 2 }}
              >
                Share
              </MuiButton>
            </Box>
          </Modal>
        </div>
      </div>
    </div>
  );
}

interface RecalculateFormProps {
  onRecalculate: (roadCost: number, railCost: number) => void;
}

function RecalculateForm({ onRecalculate }: RecalculateFormProps) {
  const [roadCost, setRoadCost] = useState("");
  const [railCost, setRailCost] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecalculate(Number(roadCost), Number(railCost));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="recalculate-form"
      style={{ marginTop: "20px" }}
    >
      <Card className="recalculate-card">
        <CardHeader className="recalculate-header">
          <CardTitle>Recalculate Freight Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              rowGap: "16px",
              columnGap: "16px",
            }}
          >
            <div className="freight-input-item" style={{ flex: "1 1 200px" }}>
              <Label htmlFor="roadCost">Road Cost per MT (₹)</Label>
              <Input
                type="number"
                id="roadCost"
                value={roadCost}
                onChange={(e) => setRoadCost(e.target.value)}
                required
              />
            </div>
            <div className="freight-input-item" style={{ flex: "1 1 200px" }}>
              <Label htmlFor="railCost">Rail Cost per MT (₹)</Label>
              <Input
                type="number"
                id="railCost"
                value={railCost}
                onChange={(e) => setRailCost(e.target.value)}
                required
              />
            </div>
          </div>
          <div
            style={
              isMobile
                ? {
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }
                : {
                    display: "flex",
                    justifyContent: "right",
                    marginTop: "20px",
                  }
            }
          >
            <Button type="submit" className="recalculate-button">
              Recalculate
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

const cities = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
];
const routeCodes = [
  "ANG001",
  "ANG002",
  "ANG003",
  "ANG004",
  "ANG005",
  "ANG006",
  "ANG007",
  "ANG008",
  "ANG009",
  "ANG010",
];

export default function FreightEstimator() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [formData, setFormData] = useState({
    city: "",
    quantity: "",
    routeCode: "",
    deliveryDate: "",
    secondaryShipmentCost: "",
  });
  const [results, setResults] = useState<{
    roadCostPerMT: number;
    railCostPerMT: number;
    totalRoadCost: number;
    totalRailCost: number;
    transitDays: number;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateFreight = (
    roadCostPerMT: number | null = null,
    railCostPerMT: number | null = null
  ) => {
    const roadCost = roadCostPerMT || Math.random() * 2000 + 1000;
    const railCost = railCostPerMT || Math.random() * 1500 + 800;
    const totalRoadCost = roadCost * Number.parseFloat(formData.quantity);
    const totalRailCost = railCost * Number.parseFloat(formData.quantity);
    const transitDays = Math.floor(Math.random() * 7) + 3;

    setResults({
      roadCostPerMT: roadCost,
      railCostPerMT: railCost,
      totalRoadCost,
      totalRailCost,
      transitDays,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateFreight();
  };

  const handleRecalculate = (roadCost: number, railCost: number) => {
    calculateFreight(roadCost, railCost);
  };

  return (
    <div className="freight-container">
      <Card className="freight-card">
        <CardHeader className="freight-header">
          <CardTitle>
            <Truck size={32} />
            JSPL Freight Estimator
            <Train size={32} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div
              className="freight-form"
              style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}
            >
              <div
                className="freight-input-item"
                style={{ flex: "1 1 200px", minWidth: "200px" }}
              >
                <Label htmlFor="city">City</Label>
                <Select
                  name="city"
                  placeholder="Select a city"
                  onValueChange={(value) => handleSelectChange("city", value)}
                >
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="freight-input-item" style={{ flex: "1 1 200px" }}>
                <Label htmlFor="quantity">Total Quantity (MT)</Label>
                <Input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="freight-input-item" style={{ flex: "1 1 200px" }}>
                <Label htmlFor="routeCode">Route Code</Label>
                <Select
                  name="routeCode"
                  placeholder="Select a route code"
                  onValueChange={(value) =>
                    handleSelectChange("routeCode", value)
                  }
                >
                  {routeCodes.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="freight-input-item" style={{ flex: "1 1 200px" }}>
                <Label htmlFor="deliveryDate">Promised Delivery Date</Label>
                <Input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="freight-input-item" style={{ flex: "1 1 200px" }}>
                <Label htmlFor="secondaryShipmentCost">
                  Secondary Shipment Cost per MT (₹/MT)
                </Label>
                <Input
                  type="number"
                  id="secondaryShipmentCost"
                  name="secondaryShipmentCost"
                  value={formData.secondaryShipmentCost}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: isMobile ? "center" : "right",
                alignItems: "center",
                marginTop: "20px",
              }}
            >
              <Button type="submit">Calculate Freight</Button>
            </div>
          </form>
          {results && (
            <div>
              <ResultsTable results={results} />
              <div style={{ marginTop: "20px" }}>
                <ExpandableSection>
                  <RecalculateForm onRecalculate={handleRecalculate} />
                </ExpandableSection>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function ExpandableSection({ children }: { children: React.ReactNode }) {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>
          <b>Recalculate Freight Costs</b>
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

// Usage of ExpandableSection
