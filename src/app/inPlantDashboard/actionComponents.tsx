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
import "./actionComponents.css";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Image from "next/image";
import BOST from "@/assets/BOST Final 1.png";
import BFNV from "@/assets/BFNV final 1.png";
import BOBRN from "@/assets/BOBRN final 1.png";
import BRNA from "@/assets/BRNA 1.png";
import BRN229 from "@/assets/BRN 23.png";
import { useRouter } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";

export const MarkPlacement = ({
  isClose,
  shipment,
  different = "markplacement",
  getWagonDetails,
}: any) => {
  const router = useRouter();
  const t = useTranslations("ORDERS");

  const [currentDate, setCurrentDate] = useState(new Date());
  const { showMessage } = useSnackbar();
  const [avetoInplant, setAvetoInplant] = useState(false);
  const [eIndent, setEIndent] = useState("");
  const [warraning, setWarraning] = useState(false);
  const [openStartDatePicker, setOpenStartDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const response = await httpsPost(
        different === "drawnInTimeFromInplantDashboard"
          ? "rake_shipment/mark_drawnin"
          : "rake_shipment/mark_placement",
        different === "drawnInTimeFromInplantDashboard"
          ? payloadWithdrownDate
          : eIndent
          ? payloadWitheident
          : payload,
          router
      );
      if (response.statusCode === 200) {
        isClose(false);
        getWagonDetails();
        showMessage("Placement Marked Successfully", "success");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#20114d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

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
      aria-hidden="true"
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
export const AssignToMill = ({
  isClose,
  shipmentForWagonSheet,
  getWagonDetails,
}: any) => {
  const router = useRouter();
  const showMessage = useSnackbar();
  const text = useTranslations("WAGONTALLYSHEET");
  const [originalWagonDetails, setOriginalWagonDetails] = useState<any>([]);
  const [wagonsNewDate, setWagonsNewDate] = useState<any>([]);
  const [plants, setPlants] = useState<any>([]);
  const [SelectedPlant, setSelectedPlant] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const wagonDetails = async () => {
    try {
      setLoading(true);
      const response = await httpsGet(
        `get_wagon_details_by_shipment?id=${shipmentForWagonSheet.id}`, 0, router
      );
      console.log(response);
      setOriginalWagonDetails(response.wagonData);
      setPlants(response.plants);
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMaxHeight = (numberOfWagons: number) => {
    const wagonHeight = 50;
    const gap = 8;
    const maxHeight = (numberOfWagons / 4) * (wagonHeight + gap);
    return maxHeight;
  };

  const assignWagonsToSelectedPlant = (
    event: any,
    wagons: any,
    index: number
  ) => {
    if (
      wagons.plant_assigned &&
      wagons.plant_assigned._id !== SelectedPlant._id
    ) {
      showMessage.showMessage(
        `Wagon already assigned to ${
          wagons?.plant_assigned?.name || "different plant"
        }`,
        "error"
      );
      return;
    }
    setWagonsNewDate((prevWagons: any) => {
      let newWagons = [...prevWagons];
      if (newWagons[index].plant_assigned) {
        const { plant_assigned, ...rest } = newWagons[index];
        newWagons[index] = rest;
      } else {
        newWagons[index].plant_assigned = SelectedPlant;
      }
      return newWagons;
    });
  };

  const submitAssignToMill = async () => {
    let payload = {};
    const assignedData = wagonsNewDate.reduce((acc: any, item: any) => {
      const plantId = item.plant_assigned?._id;
      if (plantId) {
        let plantEntry = acc.find((entry: any) => entry.plant === plantId);
        if (!plantEntry) {
          plantEntry = {
            wagons: [],
            plant: plantId,
          };
          if (item.plant_assigned) {
            plantEntry.plant_code =
              item?.plant_assigned?.location?.reference ||
              item?.plant_code ||
              "NA";
          }
          acc.push(plantEntry);
        }
        plantEntry.wagons.push(item._id);
      }
      return acc;
    }, []);

    payload = {
      shipment: shipmentForWagonSheet.id,
      assigned_data: assignedData,
    };
    try {
      setLoading(true);
      const response = await httpsPost("assign_wagon_to_plant", payload, router);
      if (response.statusCode === 200) {
        wagonDetails();
        showMessage.showMessage("Assigned successfully", "success");
        getWagonDetails();
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    wagonDetails();
  }, []);

  useEffect(() => {
    setWagonsNewDate(originalWagonDetails);
    setSelectedPlant(plants[0]);
  }, [originalWagonDetails]);

  function wagonImage(wagonImage: any) {
    switch (wagonImage) {
      case "BOST":
        return BOST;
        break;
      case "BFNV":
        return BFNV;
        break;
      case "BOBRN":
        return BOBRN;
        break;
      case "BRNA":
        return BRNA;
        break;
      case "BRN22.9":
        return BRN229;
        break;
      default:
        return BOST;
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#20114d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

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
          width: 954,
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
        <div className="status_edemand_fnr" style={{ marginBottom: 16 }}>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("status")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentForWagonSheet?.status.statusLabel}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("FNRno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentForWagonSheet?.fnr}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("edemandno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentForWagonSheet?.edemand?.edemand_no}
            </text>
          </div>
        </div>

        <div id="scrollAreaForAssignToMill">
          {/* <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 4,
            }}
          >
            <div>
              <input
                type="radio"
                style={{ marginTop: 5 }}
                checked={true}
                disabled
              />
            </div>
            <div style={{ fontSize: 12, fontWeight: "400" }}>
              {text("selectAllwagons")}
            </div>
          </div> */}

          <div
            id="wagonContainerForAssignToMill"
            style={{ maxHeight: calculateMaxHeight(wagonsNewDate.length) }}
          >
            {wagonsNewDate.map((wagons: any, index: number) => {
              return (
                <div key={index} className="wagonAssignToMillConatiner">
                  <div
                    className="wagonsAssignToMillImageSelectorConatainer"
                    onClick={(e) => {
                      e.stopPropagation();
                      assignWagonsToSelectedPlant(e, wagons, index);
                    }}
                  >
                    {wagons?.plant_assigned && (
                      <div
                        className="wagonsAssigntoMillCheckedIcon"
                        style={{
                          backgroundColor:
                            wagons?.plant_assigned?._id === SelectedPlant?._id
                              ? "black"
                              : "#D2D2D2",
                          cursor:
                            wagons?.plant_assigned?._id !== SelectedPlant?._id
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        <CheckRoundedIcon
                          style={{
                            color: "white",
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        />
                      </div>
                    )}
                    <div className="wagonsAssignToMillImageSelector">
                      <div style={{width:40, height:17}} >
                        <Image
                          src={wagonImage(wagons?.wagon_type?.name).src}
                          alt=""
                          width={40}
                          height={17}
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </div>
                  </div>
                  <div id="wagonsAssignToMillTextArea">
                    <header id="wagonsAssignToMillAssignedPlantName">
                      {wagons?.plant_assigned?.name || ""}
                    </header>
                    <header id="wagonsAssignToMillNumber">
                      {wagons?.w_no || "XXXXXXX"}
                    </header>
                    <header id="wagonsAssignToMilltype">
                      {wagons?.wagon_type?.name || "XXXXXXX"}
                    </header>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24 }}>Select a Loading Shop</div>
          <div id="plantSelectorContainer">
            {plants.map((plant: any, index: any) => {
              return (
                <div
                  key={index}
                  id="plantMillSelector"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlant(plants[index]);
                  }}
                  style={{
                    backgroundColor:
                      plant?._id === SelectedPlant?._id ? "#3351FF" : "",
                    color: plant?._id === SelectedPlant?._id ? "white" : "",
                    border:
                      plant?._id === SelectedPlant?._id
                        ? "1px solid #3351FF"
                        : "",
                  }}
                >
                  <div
                    id="plantRadioButton"
                    style={{
                      border:
                        plant?._id === SelectedPlant?._id
                          ? "1px solid white"
                          : "",
                    }}
                  >
                    <div id="plantRadioButtonInside"></div>
                  </div>
                  <div>{plant?.name || "XXXX"}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="dividerForAssignToMill"></div>

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
              submitAssignToMill();
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
export const AddIndentNumber = ({
  isClose,
  shipment,
  getWagonDetails,
}: any) => {
  const router = useRouter();
  const text = useTranslations("WAGONTALLYSHEET");
  const [indentNumber, setIndentNumber] = useState<null | string>(shipment?.indent?.indent_no || null);
  const showMessage = useSnackbar();
  const [loading, setLoading] = useState(false);

  async function updateIndentNumber() {
    if (!indentNumber) {
      showMessage.showMessage("Please enter indent number", "error");
      return;
    }
    const payload = {
      id: shipment?.id,
      indent_no: indentNumber,
    };

    try {
      setLoading(true);
      const response = await httpsPost("rake_shipment/add_indent_no", payload, router);
      if (response?.statusCode === 200) {
        showMessage.showMessage('Indent Number Added Successfully.',"success")
        getWagonDetails();
        isClose(false);
      } else {
        console.log(response.message);
        showMessage.showMessage(response.message,"error")
        isClose(false);
      }
    } finally{
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#20114d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>
    );
  }

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
        className="add-indent-number-modal-main"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <header style={{ fontSize: 20, color: "#131722", fontWeight: 600 }}>
            {text("indentNumber")}
          </header>
        </div>

        <div className="status_edemand_fnr" style={{ marginBottom: 16 }}>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("status")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipment?.status.statusLabel}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("FNRno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipment?.fnr}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("edemandno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipment?.edemand?.edemand_no}
            </text>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <header style={{ marginBottom: 8, fontSize: 12, color: "#42454E" }}>
            {text("IndentNo")}
          </header>
          <div
            style={{
              border: "1px solid #E9E9EB",
              borderRadius: 6,
              height: 40.12,
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
            }}
          >
            <input
              onChange={(e) => {
                setIndentNumber(e.target.value);
              }}
              type="text"
              value={indentNumber || ''}
              placeholder="Enter Indent No."
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "#42454E",
                border: "none",
                outline: "none",
                width: "100%",
              }}
            />
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
            {text("Cancel")}
          </Button>
          <Button
            className="buttonMarkPlacement"
            onClick={(e) => {
              e.stopPropagation();
              updateIndentNumber();
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
            {text("update")}
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
