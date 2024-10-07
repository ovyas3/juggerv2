import { useEffect, useState } from "react";
import React from "react";
import { useTranslations } from "next-intl";
import Button from "@mui/material/Button";
import { httpsPost, httpsGet } from "@/utils/Communication";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "@/hooks/snackBar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

export const MarkPlacement = ({
  isClose,
  shipment,
  different = "markplacement",
  getWagonDetails,
}: any) => {
  const t = useTranslations("ORDERS");

  const [currentDate, setCurrentDate] = useState(new Date());
  const { showMessage } = useSnackbar();
  const [avetoInplant, setAvetoInplant] = useState(false);
  const [eIndent, setEIndent] = useState("");
  const [warraning, setWarraning] = useState(false);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);

  const handlePlacementDate = async () => {
    if (!currentDate) {
      showMessage("Please Select Date", "error");
      return;
    }
    if (!avetoInplant) {
      showMessage("Please Allow The Condition", "error");
      return;
    }

    const data = new Date(currentDate);
    const payloadWitheident = {
      id: shipment._id,
      placement_time: new Date(data.toUTCString()),
      indent_no: eIndent,
    };

    const payload = {
      id: shipment._id || shipment.id,
      placement_time: new Date(data.toUTCString()),
    };

    const payloadWithdrownDate = {
      id: shipment._id || shipment.id,
      drawnin_time: new Date(data.toUTCString()),
    };

    try {
      const response = await httpsPost(
        different === "drawnInTimeFromInplantDashboard"
          ? "rake_shipment/mark_drawnin"
          : "rake_shipment/mark_placement",
        different === "drawnInTimeFromInplantDashboard"
          ? payloadWithdrownDate
          : eIndent
          ? payloadWitheident
          : payload
      );
      if (response.statusCode === 200) {
        isClose(false);
        getWagonDetails();
        showMessage("Placement Marked Successfully", "success");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 300,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        isClose(false);
      }}
    >
      <div
        style={{
          width: 800,
          height: 500,
          backgroundColor: "white",
          position: "relative",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          borderRadius: 20,
          padding: 25,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <header style={{ fontSize: 20, color: "#131722", fontWeight: 600 }}>
            {different === "drawnInTimeFromInplantDashboard"
              ? "Drawn In Time"
              : "Mark Placement"}
          </header>
        </div>

        <div className="status_edemand_fnr">
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {t("status")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipment?.status}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {t("FNRno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipment?.fnr}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {t("edemandno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipment?.edemand?.edemand_no}
            </text>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <header style={{ marginBottom: 8, fontSize: 12, color: "#42454E" }}>
            {different === "markplacement"
              ? "Enter Placement Time"
              : "Enter Drawn In Time"}
          </header>
          <div style={{ border: "1px solid #E9E9EB", borderRadius: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                open={openStartDatePicker}
                onClose={() => {
                  setOpenStartDatePicker(false);
                }}
                value={dayjs(currentDate)}
                sx={{
                  width: "100%",
                  ".MuiInputBase-input": {
                    padding: "10px",
                    paddingLeft: "10px",
                    fontSize: "14px ",
                    color: "#42454E",
                    fontWeight: 600,
                  },
                  ".MuiInputBase-root": {
                    padding: 0,
                    border: "none",
                    "& fieldset": { border: "none" },
                  },
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "none",
                    },
                  },
                  "& .MuiIconButton-root": {
                    left: -720,
                    position: "relative",
                  },
                }}
                ampm={false}
                slotProps={{
                  textField: {
                    onClick: () => {
                      setOpenStartDatePicker(!openStartDatePicker);
                    },
                    fullWidth: true,
                    InputProps: {
                      endAdornment: null,
                    },
                  },
                }}
                viewRenderers={{
                  hours: renderTimeViewClock,
                  minutes: renderTimeViewClock,
                  seconds: renderTimeViewClock,
                }}
                onChange={(newDate) => {
                  if (newDate) {
                    setWarraning(true);
                    setCurrentDate(newDate.toDate());
                  }
                }}
                format="DD/MM/YYYY  HH:mm"
              />
            </LocalizationProvider>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div>
            <input
              type="checkbox"
              style={{ width: 16, height: 16 }}
              onChange={() => {
                setAvetoInplant(!avetoInplant);
              }}
            />
          </div>
          <text style={{ color: "#EB1F52", fontWeight: "300" }}>
            Changing the{" "}
            <span>
              {different === "markplacement" ? "Placement" : "Drawn In"}
            </span>{" "}
            Time will update the previous date.
          </text>
        </div>

        <div className="buttonContaioner">
          <Button
            className="buttonMarkPlacement"
            onClick={(e) => {
              e.stopPropagation();
              isClose(false);
            }}
            style={{
              color: "#2862FF",
              border: "1px solid #2862FF",
              width: 110,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.5s ease-in-out",
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            className="buttonMarkPlacement"
            onClick={(e) => {
              e.stopPropagation();
              handlePlacementDate();
            }}
            style={{
              color: "white",
              backgroundColor: "#2862FF",
              width: 110,
              border: "1px solid #2862FF",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.5s ease-in-out",
            }}
          >
            {different === "markplacement" ? "Placement" : "Update"}
          </Button>
        </div>

        <div className="closeContaioner">
          <CloseIcon
            onClick={(e) => {
              e.stopPropagation();
              isClose(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};
export const AssignToMill = ({ isClose, shipment }: any) => {
  const text = useTranslations("WAGONTALLYSHEET");
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 300,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        isClose(false);
      }}
    >
      <div
        style={{
          width: 1000,
          height: 650,
          backgroundColor: "white",
          position: "relative",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          borderRadius: 20,
          padding: 24,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header id="headerForAssignToMill">{text("AssignToMill")}</header>
        <div id="scrollAreaForAssignToMill">
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div>
              <input
                type="radio"
                style={{ marginTop: 5, color: "black", width: 16, height: 16 }}
              />
            </div>
            <div>{text("selectAllwagons")}</div>
          </div>
        </div>
        
        <div className="buttonContaioner">
          <Button
            className="buttonMarkPlacement"
            onClick={(e) => {
              e.stopPropagation();
              isClose(false);
            }}
            style={{
              color: "#2862FF",
              border: "1px solid #2862FF",
              width: 110,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.5s ease-in-out",
            }}
          >
            Cancel
          </Button>
          <Button
            className="buttonMarkPlacement"
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              color: "white",
              backgroundColor: "#2862FF",
              width: 110,
              border: "1px solid #2862FF",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.5s ease-in-out",
            }}
          >
            Assign
          </Button>
        </div>

        <div className="closeContaioner">
          <CloseIcon
            onClick={(e) => {
              e.stopPropagation();
              isClose(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};
