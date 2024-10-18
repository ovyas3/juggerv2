import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import Popover from "@mui/material/Popover";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

const events_names = {
  rakeArrivalAtStation: "Rake Arrival At Serving Station",
  stabled: "Stabled",
  placementTime: "Placement Time",
  rakeArrivalAtPlant: "gate-in",
  bpRelease: "B/P Release",
  wagonPlacedAtLoadingPoint: "Wagons Placed At Loading Point",
  loadRakeFormation: "Load Rake Formation",
  rakeRelease: "Rake Release",
  rlylocoReporting: "Rly Loco Reporting",
  eot: "EOT",
  apReady: "A.P. Ready",
  drawnOut: "Drawn-out",
};
const eventCodes = {
  rakeArrivalAtStation: "RAS",
  stabled: "STB",
  placementTime: "PLT",
  rakeArrivalAtPlant: "GIN",
  bpRelease: "BPR",
  wagonPlacedAtLoadingPoint: "WLP",
  loadRakeFormation: "LRF",
  rakeRelease: "RKR",
  rlylocoReporting: "RLR",
  eot: "EOT",
  apReady: "APR",
  drawnOut: "DRO",
};


function RakeHandlingSheet({ isClose, shipment }: any) {
  const showMessage = useSnackbar();
  const text = useTranslations("WAGONTALLYSHEET");
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const [showActionBox, setShowActionBox] = React.useState(-1);
  const [rakeHandlingSheetData, setRakeHandlingSheetData] = useState<any>([]);
  const [previousData, setPreviousData] = useState([]);
  const [plants, setPlants] = useState([]);
  const [workingPlant, setWorkingPlant] = useState<any>([]);
  const [millDetails, setMillDetails] = useState([
    {
      major_id: 1,
      mill: text("railmill"),
      hooks: [
        {
          id: 1,
          wagonType: "",
        },
      ],
    },
  ]);
  const [rakeArrivalAtStationObject, setRakeArrivalAtStationObject] =
    useState<any>({});
  const [rakeArrivalAtStationDate, setRakeArrivalAtStationDate] =
    useState<Date | null>(null);
  const [openRakeArrivalAtServingStation, setOpenRakeArrivalAtServingStation] =
    useState(false);

  const [stabled, setStabled] = useState<any>({});
  const [stabledDate, setStabledDate] = useState<Date | null>(null);
  const [openStabled, setOpenStabled] = useState(false);

  const [placementTime, setPlacementTime] = useState<any>({});
  const [placementTimeDate, setPlacementTimeDate] = useState<Date | null>(null);
  const [openPlacementTime, setOpenPlacementTime] = useState(false);

  const [rakeArrivalAtPlantObject, setRakeArrivalAtPlantObject] = useState<any>(
    {}
  );
  const [rakeArrivalAtPlantDate, setRakeArrivalAtPlantDate] =
    useState<Date | null>(null);
  const [openRakeArrivalAtPlant, setOpenRakeArrivalAtPlant] = useState(false);

  const [bpReleaseObject, setBpReleaseObject] = useState<any>({});
  const [bpReleaseDate, setBpReleaseDate] = useState<Date | null>(null);
  const [openBpRelease, setOpenBpRelease] = useState(false);

  const [wagonPlacedAtLoadingPointObject, setWagonPlacedAtLoadingPointObject] =
    useState<any>({});
  const [wagonPlacedAtLoadingPointDate, setWagonPlacedAtLoadingPointDate] =
    useState<Date | null>(null);
  const [openWagonPlacedAtLoadingPoint, setOpenWagonPlacedAtLoadingPoint] =
    useState(false);

  const [loadRakeFormationObject, setLoadRakeFormationObject] = useState<any>(
    {}
  );
  const [loadRakeFormationDate, setLoadRakeFormationDate] =
    useState<Date | null>(null);
  const [openLoadRakeFormation, setOpenLoadRakeFormation] = useState(false);

  const [rakeReleaseObject, setRakeReleaseObject] = useState<any>({});
  const [rakeReleaseDate, setRakeReleaseDate] = useState<Date | null>(null);
  const [openRakeRelease, setOpenRakeRelease] = useState(false);

  const [rlylocoReportingObject, setRlylocoReportingObject] = useState<any>({});
  const [rlylocoReportingDate, setRlylocoReportingDate] = useState<Date | null>(
    null
  );
  const [openRlylocoReporting, setOpenRlylocoReporting] = useState(false);

  const [eotObject, setEotObject] = useState<any>({});
  const [eotDate, setEotDate] = useState<Date | null>(null);
  const [openEot, setOpenEot] = useState(false);

  const [apReadyObject, setApReadyObject] = useState<any>({});
  const [apReadyDate, setApReadyDate] = useState<Date | null>(null);
  const [openApReady, setOpenApReady] = useState(false);

  const [drawnOutObject, setDrawnOutObject] = useState<any>({});
  const [drawnOutDate, setDrawnOutDate] = useState<Date | null>(null);
  const [openDrawnOut, setOpenDrawnOut] = useState(false);

  function addMillDetails() {
    const newMill = {
      major_id: millDetails.length + 1,
      mill: text("railmill"),
      hooks: [
        {
          id: 1,
          wagonType: "",
        },
      ],
    };
    setMillDetails((prevMillDetails) => [...prevMillDetails, newMill]);
  }

  function removeMillDetails(id: number) {
    setMillDetails((prevMillDetails) =>
      prevMillDetails.filter((_, index) => index !== id)
    );
  }
  const handleCloseAction = () => {
    setAnchorEl(null);
    setShowActionBox(-1);
  };
  function clickActionBox(
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
    index: number,
    id: string,
    locationId: string
  ) {
    e.stopPropagation();
    setShowActionBox((prevIndex) => (prevIndex === index ? -1 : index));
  }

  function addMillInMillDetails(
    event: any,
    index: number,
    millNameAdded: string
  ) {
    setMillDetails((prevMillDetails) => {
      const updatedMillDetails = [...prevMillDetails];
      updatedMillDetails[index] = {
        ...updatedMillDetails[index],
        mill: millNameAdded,
      };
      return updatedMillDetails;
    });
  }
  function removeHookFromMillDetails(
    event: any,
    index: number,
    hookIndex: number
  ) {
    setWorkingPlant((prevMillDetails:any) => {
      const updatedMillDetails = [...prevMillDetails];
      updatedMillDetails[index].hooks.splice(hookIndex, 1);
      return updatedMillDetails;
    });
  }
  function addHookInMillDetails(event: any, index: number) {
    setWorkingPlant((prevMillDetails:any) => {
      const updatedMillDetails = [...prevMillDetails];
      updatedMillDetails[index].hooks.push({
        hook_no: updatedMillDetails[index].hooks.length + 1,
        count: 0,
      });
      return updatedMillDetails;
    });
  }
  const inputHooksForplants = (event :any, plantIndex: number, hookIndex: number) => {

    const value = parseInt(event.target.value, 10);
    console.log(value)
    setWorkingPlant((previousState:any)=>{
      const updatedMillDetails = [...previousState];
      updatedMillDetails[plantIndex].hooks[hookIndex].count = value;
      return updatedMillDetails;
    })
  }
  const submitRakeHandlingSheet = async () => {
    let payload = {
      events: [] as any,
      shipment: shipment.id,
      hooks: [] as any,
    };
    workingPlant.forEach((plant:any) => {
      console.log(plant)
      plant.hooks.forEach((hook:any) => {
        payload.hooks.push({
          plant: plant.plant._id,
          hook_no: hook.hook_no,
          no_of_wagons: hook.count,
        });
      });
    })
    if (rakeArrivalAtStationDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.rakeArrivalAtStation,
        event_code: eventCodes.rakeArrivalAtStation,
        event_datetime: rakeArrivalAtStationDate,
        FNR: shipment.fnr,
        id: rakeArrivalAtStationObject?._id,
      });
    }
    if (stabledDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.stabled,
        event_code: eventCodes.stabled,
        event_datetime: stabledDate,
        FNR: shipment.fnr,
        id: stabled?._id,
      });
    }
    if (placementTimeDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.placementTime,
        event_code: eventCodes.placementTime,
        event_datetime: placementTimeDate,
        FNR: shipment.fnr,
        id: placementTime?._id,
      });
    }
    if (rakeArrivalAtPlantDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.rakeArrivalAtPlant,
        event_code: eventCodes.rakeArrivalAtPlant,
        event_datetime: rakeArrivalAtPlantDate,
        FNR: shipment.fnr,
        id: rakeArrivalAtPlantObject?._id,
      });
    }
    if (bpReleaseDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.bpRelease,
        event_code: eventCodes.bpRelease,
        event_datetime: bpReleaseDate,
        FNR: shipment.fnr,
        id: bpReleaseObject?._id,
      });
    }
    if (wagonPlacedAtLoadingPointDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.wagonPlacedAtLoadingPoint,
        event_code: eventCodes.wagonPlacedAtLoadingPoint,
        event_datetime: wagonPlacedAtLoadingPointDate,
        FNR: shipment.fnr,
        id: wagonPlacedAtLoadingPointObject?._id,
      });
    }
    if (loadRakeFormationDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.loadRakeFormation,
        event_code: eventCodes.loadRakeFormation,
        event_datetime: loadRakeFormationDate,
        FNR: shipment.fnr,
        id: loadRakeFormationObject?._id,
      });
    }
    if (rakeReleaseDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.rakeRelease,
        event_code: eventCodes.rakeRelease,
        event_datetime: rakeReleaseDate,
        FNR: shipment.fnr,
        id: rakeReleaseObject?._id,
      });
    }
    if (rlylocoReportingDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.rlylocoReporting,
        event_code: eventCodes.rlylocoReporting,
        event_datetime: rlylocoReportingDate,
        FNR: shipment.fnr,
        id: rlylocoReportingObject?._id,
      });
    }
    if (eotDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.eot,
        event_code: eventCodes.eot,
        event_datetime: eotDate,
        FNR: shipment.fnr,
        id: eotObject?._id,
      });
    }
    if (apReadyDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.apReady,
        event_code: eventCodes.apReady,
        event_datetime: apReadyDate,
        FNR: shipment.fnr,
        id: apReadyObject?._id,
      });
    }
    if (drawnOutDate) {
      payload.events.push({
        shipment: shipment.id,
        event_name: events_names.drawnOut,
        event_code: eventCodes.drawnOut,
        event_datetime: drawnOutDate,
        FNR: shipment.fnr,
        id: drawnOutObject?._id,
      });
    }
    console.log(payload);
    try {
      const response = await httpsPost(`rake_event/add`, payload);
      if (response.statusCode === 200) {
        showMessage.showMessage(
          "Rake Handling Sheet Added Successfully",
          "success"
        );
        isClose(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // api calling
  const getRakeHandlingSheetData = async () => {
    try {
      const response = await httpsGet(
        `rake_event_by_shipment/get?id=${shipment.id}`
      );
      setRakeHandlingSheetData(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
  // const plantDetails = async () => {
  //   try {
  //     const response = await httpsGet(`shipper_constants/get_mills`);
  //     if (response.statusCode === 200) {
  //       setPlants(response.data);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const plantDetails = async () => {
    try {
      const response = await httpsGet(
        `get_assigned_loading_shops?shipment=${shipment.id}`
      );
      setPlants(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect
  useEffect(() => {
    getRakeHandlingSheetData();
    plantDetails();
  }, []);

  useEffect(() => {
    setWorkingPlant((prev: any) => {
      let newState = plants;
      newState.map((plant: any) => {
        if (plant.hooks.length === 0) {
          plant.hooks.push({
            hook_no: 1,
            count: 0,
          });
        }
      });
      return newState;
    });
  }, [plants]);

  console.log(workingPlant);

  useEffect(() => {
    setRakeArrivalAtStationDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.rakeArrivalAtStation;
        })[0] as any
      )?.event_timestamp
    );
    setRakeArrivalAtStationObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.rakeArrivalAtStation;
      })[0]
    );

    setStabledDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.stabled;
        })[0] as any
      )?.event_timestamp
    );
    setStabled(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.stabled;
      })[0]
    );

    setPlacementTimeDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.placementTime;
        })[0] as any
      )?.event_timestamp
    );
    setPlacementTime(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.placementTime;
      })[0]
    );

    setRakeArrivalAtPlantDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.rakeArrivalAtPlant;
        })[0] as any
      )?.event_timestamp
    );
    setRakeArrivalAtPlantObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.rakeArrivalAtPlant;
      })[0]
    );

    setBpReleaseDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.bpRelease;
        })[0] as any
      )?.event_timestamp
    );
    setBpReleaseObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.bpRelease;
      })[0]
    );

    setWagonPlacedAtLoadingPointDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.wagonPlacedAtLoadingPoint;
        })[0] as any
      )?.event_timestamp
    );
    setWagonPlacedAtLoadingPointObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.wagonPlacedAtLoadingPoint;
      })[0]
    );

    setLoadRakeFormationDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.loadRakeFormation;
        })[0] as any
      )?.event_timestamp
    );
    setLoadRakeFormationObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.loadRakeFormation;
      })[0]
    );

    setRakeReleaseDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.rakeRelease;
        })[0] as any
      )?.event_timestamp
    );
    setRakeReleaseObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.rakeRelease;
      })[0]
    );

    setRlylocoReportingDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.rlylocoReporting;
        })[0] as any
      )?.event_timestamp
    );
    setRlylocoReportingObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.rlylocoReporting;
      })[0]
    );

    setEotDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.eot;
        })[0] as any
      )?.event_timestamp
    );
    setEotObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.eot;
      })[0]
    );

    setApReadyDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.apReady;
        })[0] as any
      )?.event_timestamp
    );
    setApReadyObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.apReady;
      })[0]
    );

    setDrawnOutDate(
      (
        rakeHandlingSheetData.filter((data: any) => {
          return data.event_name === events_names.drawnOut;
        })[0] as any
      )?.event_timestamp
    );
    setDrawnOutObject(
      rakeHandlingSheetData.filter((data: any) => {
        return data.event_name === events_names.drawnOut;
      })[0]
    );
  }, [rakeHandlingSheetData]);

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
          minWidth: 900,
          minHeight: 700,
          maxWidth: 1100,
          maxHeight: 700,
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
        <header id="headerForRakeHandlingSheet">
          {text("rakeHandlingSheet")}
        </header>
        <div id="scrollAreaforRakeSheet">
          <div id="firstSectionofRakeSheet">
            <div>
              <header className="headerForRakeSection">
                {text("rakeArrivalAtStation")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openRakeArrivalAtServingStation}
                    onClose={() => {
                      setOpenRakeArrivalAtServingStation(false);
                    }}
                    // value={dayjs(rakeArrivalAtStationDate)}
                    value={
                      rakeArrivalAtStationDate
                        ? dayjs(rakeArrivalAtStationDate)
                        : null
                    }
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenRakeArrivalAtServingStation(
                            !openRakeArrivalAtServingStation
                          );
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
                        setRakeArrivalAtStationDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("stabled")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openStabled}
                    onClose={() => {
                      setOpenStabled(false);
                    }}
                    // value={dayjs(rakeArrivalAtStationDate)}
                    value={stabledDate ? dayjs(stabledDate) : null}
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenStabled(!openStabled);
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
                        setStabledDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            {/* --------------------------------- */}
            <div>
              <header className="headerForRakeSection">
                {text("placementTime")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openPlacementTime}
                    onClose={() => {
                      setOpenPlacementTime(false);
                    }}
                    // value={dayjs(rakeArrivalAtStationDate)}
                    value={placementTimeDate ? dayjs(placementTimeDate) : null}
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenPlacementTime(!openPlacementTime);
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
                        setPlacementTimeDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            {/* --------------------------------- */}
            <div>
              <header className="headerForRakeSection">
                {text("gate-in")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openRakeArrivalAtPlant}
                    onClose={() => {
                      setOpenRakeArrivalAtPlant(false);
                    }}
                    value={
                      rakeArrivalAtPlantDate
                        ? dayjs(rakeArrivalAtPlantDate)
                        : null
                    }
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenRakeArrivalAtPlant(!openRakeArrivalAtPlant);
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
                        setRakeArrivalAtPlantDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("bpRelease")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openBpRelease}
                    onClose={() => {
                      setOpenBpRelease(false);
                    }}
                    value={bpReleaseDate ? dayjs(bpReleaseDate) : null}
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenBpRelease(!openBpRelease);
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
                        setBpReleaseDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("wagonPlacedAtLoadingPoint")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openWagonPlacedAtLoadingPoint}
                    onClose={() => {
                      setOpenWagonPlacedAtLoadingPoint(false);
                    }}
                    value={
                      wagonPlacedAtLoadingPointDate
                        ? dayjs(wagonPlacedAtLoadingPointDate)
                        : null
                    }
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenWagonPlacedAtLoadingPoint(
                            !openWagonPlacedAtLoadingPoint
                          );
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
                        setWagonPlacedAtLoadingPointDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            {/* <div>
              <header className="headerForRakeSection">
                {text("loadRakeFormation")}
              </header>
              <div className="inputForRakeSection">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openLoadRakeFormation}
                    onClose={() => {
                        setOpenLoadRakeFormation(false);
                    }}
                    value={loadRakeFormationDate ? dayjs(loadRakeFormationDate) : null}
                    sx={{
                      width: "100%",
                      height:'100%',
                    
                      ".MuiInputBase-input": {
                        
                        padding: "7px",
                        
                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenLoadRakeFormation(!openLoadRakeFormation);
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
                        setLoadRakeFormationDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div> */}
          </div>

          <div
            style={{
              borderBottom: "1px solid #E0E0E0",
              width: "100%",
              marginTop: 24,
              marginBottom: 16,
            }}
          ></div>

          {workingPlant.map((item: any, index: any) => {
            return (
              <div key={index}>
                <div className="millDetails-dashboard">
                  <div style={{ width: "200px" }}>
                    plant:{" "}
                    <span
                      style={{
                        color: "black",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {item.plant.name}
                    </span>
                  </div>
                  <div style={{ width: "200px" }}>
                    no. of wagons assigned:{" "}
                    <span
                      style={{
                        color: "black",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {item.count}
                    </span>
                  </div>
                  <div style={{ width: "200px" }}>
                    available wagons:{" "}
                    <span
                      style={{
                        color: "black",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {item.count - (item.hooks.reduce((acc:any, hook:any) => acc + hook.count, 0) || 0)}
                    </span>
                  </div>
                </div>

                <div id="hookSelectionContainer">
                  {item.hooks.map((hookItem: any, hookIndex: number) => {
                    return (
                      <div key={hookIndex}>
                        <div>
                          <div className="headerForMillDetails_hooks">
                            <header>{hookIndex + 1} Hook</header>
                            <div style={{ display: "flex", gap: 8 }}>
                              {hookIndex !== 0 ? (
                                <div
                                  onClick={(e) => {
                                    removeHookFromMillDetails(
                                      e,
                                      index,
                                      hookIndex
                                    );
                                  }}
                                  className="removeAddicons"
                                  style={{ backgroundColor: "#E24D65" }}
                                >
                                  <RemoveIcon
                                    style={{ height: 20, width: 20 }}
                                  />
                                </div>
                              ) : (
                                <div style={{ height: 20, width: 20 }}></div>
                              )}
                              {item.hooks.length - 1 === hookIndex && (
                                <div
                                  onClick={(e) => {
                                    addHookInMillDetails(e, index);
                                  }}
                                  className="removeAddicons"
                                  style={{ backgroundColor: "#596FFF" }}
                                >
                                  <AddIcon style={{ height: 20, width: 20 }} />
                                </div>
                              )}
                            </div>
                          </div>
                          <input className="inputForRakeSection" type="number" value={hookItem.count} onChange={(e)=>{inputHooksForplants(e, index, hookIndex)}} />
                        </div>
                        <div className="loadingTimeContainer">
                          <div>{text("loadingstarttime")}</div>
                          <div style={{ marginTop: 6 }}>--</div>
                        </div>
                        <div className="loadingTimeContainer">
                          <div>{text("loadingEndTime")}</div>
                          <div style={{ marginTop: 6 }}>--</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* {millDetails.length === 1 ||
                index === millDetails.length - 1 ? null : (
                  <Button
                    onClick={(e: any) => {
                      e.stopPropagation();
                      removeMillDetails(index);
                    }}
                    style={{
                      fontSize: 14,
                      width: 107,
                      backgroundColor: "#E24D65",
                      color: "white",
                      borderRadius: "6px",
                      fontWeight: "700",
                    }}
                  >
                    cancel
                  </Button>
                )} */}
                {workingPlant.length === 1 ||
                index === workingPlant.length - 1 ? null : (
                  <div
                    style={{
                      borderBottom: "1px solid #E0E0E0",
                      width: "100%",
                      marginTop: 24,
                      marginBottom: 16,
                    }}
                  ></div>
                )}
              </div>
            );
          })}

          {/* <Button
            onClick={(e: any) => {
              e.stopPropagation();
              addMillDetails();
            }}
            className="buttonMarkPlacement"
            style={{
              fontSize: 14,
              height: 40,
              color: "white",
              backgroundColor: "#2862FF",
              width: 79,
              border: "1px solid #2862FF",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.5s ease-in-out",
            }}
          >
            add
          </Button> */}
          <div
            style={{
              borderBottom: "1px solid #E0E0E0",
              width: "100%",
              marginTop: 24,
              marginBottom: 16,
            }}
          ></div>
          <div id="lastSection">
            <div>
              <header className="headerForRakeSection">
                {text("loadRakeFormation")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openLoadRakeFormation}
                    onClose={() => {
                      setOpenLoadRakeFormation(false);
                    }}
                    value={
                      loadRakeFormationDate
                        ? dayjs(loadRakeFormationDate)
                        : null
                    }
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenLoadRakeFormation(!openLoadRakeFormation);
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
                        setLoadRakeFormationDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("rakeRelease")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openRakeRelease}
                    onClose={() => {
                      setOpenRakeRelease(false);
                    }}
                    value={rakeReleaseDate ? dayjs(rakeReleaseDate) : null}
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenRakeRelease(!openRakeRelease);
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
                        setRakeReleaseDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("rlylocoReporting")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openRlylocoReporting}
                    onClose={() => {
                      setOpenRlylocoReporting(false);
                    }}
                    value={
                      rlylocoReportingDate ? dayjs(rlylocoReportingDate) : null
                    }
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenRlylocoReporting(!openRlylocoReporting);
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
                        setRlylocoReportingDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">{text("eot")}</header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openEot}
                    onClose={() => {
                      setOpenEot(false);
                    }}
                    value={eotDate ? dayjs(eotDate) : null}
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenEot(!openEot);
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
                        setEotDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("apReady")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openApReady}
                    onClose={() => {
                      setOpenApReady(false);
                    }}
                    value={apReadyDate ? dayjs(apReadyDate) : null}
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenApReady(!openApReady);
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
                        setApReadyDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("drawnOut")}
              </header>
              <div className="inputForRakeSection">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openDrawnOut}
                    onClose={() => {
                      setOpenDrawnOut(false);
                    }}
                    value={drawnOutDate ? dayjs(drawnOutDate) : null}
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "7px",

                        paddingLeft: "11px",
                        fontSize: "14px ",
                        color: "#42454E",
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
                        position: "relative",
                      },
                    }}
                    ampm={false}
                    slotProps={{
                      textField: {
                        onClick: () => {
                          console.log();
                          setOpenDrawnOut(!openDrawnOut);
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
                        setDrawnOutDate(newDate.toDate());
                      }
                    }}
                    format="DD/MM/YYYY  HH:mm"
                  />
                </LocalizationProvider>
              </div>
            </div>
          </div>
        </div>
        <div className="buttonContaioner">
          <Button
            className="buttonMarkPlacement"
            onClick={(e: any) => {
              e.stopPropagation();
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
            clear
          </Button>
          <Button
            className="buttonMarkPlacement"
            onClick={(e: any) => {
              e.stopPropagation();
              submitRakeHandlingSheet();
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
            submit
          </Button>
        </div>
        <div className="closeContaioner">
          <CloseIcon
            onClick={(e: any) => {
              e.stopPropagation();
              isClose(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default RakeHandlingSheet;
