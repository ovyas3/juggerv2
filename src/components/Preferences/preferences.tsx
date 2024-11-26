"use client";

import React, { useEffect } from "react";
import "./preferences.css";
import constants from "../../../messages/en.json";
import { httpsPost } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/snackBar";

const Preferences = () => {
  const statusCodes = constants.SETTINGS.statusCodes;
  const storedColorCodes = JSON.parse(localStorage.getItem('preferences') || '')
  const [colors, setColors] = React.useState<Record<string, string>>(storedColorCodes)
  const router = useRouter();
  const { showMessage } = useSnackbar();

  const handleColorChange = (code: string, value: string) => {
    setColors((prevColors) => ({ ...prevColors, [code]: value }));
  };

  function handlePreferences() {
    const payload = {
      preferences: colors,
    };
    httpsPost("/set_preferences", payload, router)
      .then((response) => {
        if (response.statusCode === 200) {
          localStorage.setItem('preferences',JSON.stringify(response.data?.constant))
          showMessage("Saved changes successfully", "success");
        } else {
          showMessage("Error occured while saving data", "error");
        }
      })
      .catch((err) => {
        console.log(err);
        showMessage("Error occured while saving data", "error");
      });
  }

  return (
    <div className="color-pickers">
      {statusCodes.map((field) => (
        <div key={field.code} className="color-field">
          <Label htmlFor={field.code} description={field.description}>
            {field.status} ({field.code})
          </Label>
          <div className="color-inputs">
            <Input
              type="color"
              value={colors[field.code]}
              onChange={(e) => handleColorChange(field.code, e.target.value)}
              className="color-picker"
            />
            <Input
              type="text"
              value={colors[field.code]}
              onChange={(e) => handleColorChange(field.code, e.target.value)}
              className="color-text"
            />
          </div>
        </div>
      ))}
      <div className="save-button-container">
        <button className="save-button" onClick={() => handlePreferences()}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

function Label({
  htmlFor,
  description,
  children,
}: {
  htmlFor: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="label"
      onClick={(e) => e.preventDefault()}
    >
      <div className="tool-tip">{description}</div>
      {children}
    </label>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input-cont ${className}`} {...props} />;
}

export default Preferences;
