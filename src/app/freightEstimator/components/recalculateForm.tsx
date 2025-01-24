"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`button ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`input ${className}`} {...props} />
);

const Label = ({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={`label ${className}`} {...props}>
    {children}
  </label>
);

const Card = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

const CardContent = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`card-content ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`card-title ${className}`} {...props}>
    {children}
  </h3>
);

interface RecalculateFormProps {
  onRecalculate: (roadCost: number, railCost: number) => void;
}

export default function RecalculateForm({
  onRecalculate,
}: RecalculateFormProps) {
  const [roadCost, setRoadCost] = useState("");
  const [railCost, setRailCost] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRecalculate(Number(roadCost), Number(railCost));
  };

  return (
    <Card>
      <CardHeader className="header-gradient">
        <CardTitle className="header-title">
          <RefreshCw size={24} />
          <span>Recalculate Costs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <Label htmlFor="roadCost">New Road Cost per MT (₹/MT)</Label>
            <Input
              type="number"
              id="roadCost"
              value={roadCost}
              onChange={(e) => setRoadCost(e.target.value)}
              required
              className="input-margin"
            />
          </div>
          <div>
            <Label htmlFor="railCost">New Rail Cost per MT (₹/MT)</Label>
            <Input
              type="number"
              id="railCost"
              value={railCost}
              onChange={(e) => setRailCost(e.target.value)}
              required
              className="input-margin"
            />
          </div>
          <div className="form-span">
            <Button type="submit" className="button-submit">
              Recalculate
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
