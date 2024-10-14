import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import Popover from "@mui/material/Popover";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { httpsGet, httpsPost } from "@/utils/Communication";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";

const events_names = {
  rakeArrivalAtStation: "Rake Arrival At Serving Station",
  rakeArrivalAtPlant: "Rake Arrival At Plant",
  bpRelease: "B/P Release",
  wagonPlacedAtLoadingPoint: "Wagons Placed At Loading Point",
  loadRakeFormation: "Load Rake Formation",
  rakeRelease: "Rake Release",
  rlylocoReporting: "Rly Loco Reporting",
  eot: "EOT",
  apReady: "A.P. Ready",
  drawnOut: "Drawn-out",
};

function RakeHandlingSheet({ isClose, shipment }: any) {
  const text = useTranslations("WAGONTALLYSHEET");
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  // const openAction = Boolean(anchorEl);
  const [showActionBox, setShowActionBox] = React.useState(-1);
  const [rakeHandlingSheetData, setRakeHandlingSheetData] = useState({});
  const [previousData, setPreviousData] = useState([]);
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

  const [rakeArrivalAtStationDate, setRakeArrivalAtStationDate] = useState<Date | null>(null);
  const [openRakeArrivalAtServingStation, setOpenRakeArrivalAtServingStation] = useState(false);

  const [rakeArrivalAtPlantDate, setRakeArrivalAtPlantDate] = useState<Date | null>(null);
  const [openRakeArrivalAtPlant, setOpenRakeArrivalAtPlant] = useState(false);

  const [bpReleaseDate, setBpReleaseDate] = useState<Date | null>(null);
  const [openBpRelease, setOpenBpRelease] = useState(false);

  const [wagonPlacedAtLoadingPointDate, setWagonPlacedAtLoadingPointDate] = useState<Date | null>(null);
  const [openWagonPlacedAtLoadingPoint, setOpenWagonPlacedAtLoadingPoint] = useState(false);

  const [loadRakeFormationDate, setLoadRakeFormationDate] = useState<Date | null>(null);
  const [openLoadRakeFormation, setOpenLoadRakeFormation] = useState(false);

  const [rakeReleaseDate, setRakeReleaseDate] = useState<Date | null>(null);
  const [openRakeRelease, setOpenRakeRelease] = useState(false);

  const [rlylocoReportingDate, setRlylocoReportingDate] = useState<Date | null>(null);
  const [openRlylocoReporting, setOpenRlylocoReporting] = useState(false);

  const [eotDate, setEotDate] = useState<Date | null>(null);
  const [openEot, setOpenEot] = useState(false);

  const [apReadyDate, setApReadyDate] = useState<Date | null>(null);
  const [openApReady, setOpenApReady] = useState(false);

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
    setMillDetails((prevMillDetails) => {
      const updatedMillDetails = [...prevMillDetails];
      updatedMillDetails[index].hooks.splice(hookIndex, 1);
      return updatedMillDetails;
    });
  }
  function addHookInMillDetails(event: any, index: number) {
    setMillDetails((prevMillDetails) => {
      const updatedMillDetails = [...prevMillDetails];
      updatedMillDetails[index].hooks.push({
        id: updatedMillDetails[index].hooks.length + 1,
        wagonType: "",
      });
      return updatedMillDetails;
    });
  }
  const submitRakeHandlingSheet = async () => {
    let payload = {
      events: [] as any,
    };
    if (rakeArrivalAtStationDate) {
      payload.events.push({
        shipment : shipment.id,
        event_name: "RakeArrivalAtStation",
        event_datetime: rakeArrivalAtStationDate,
        FNR:shipment.fnr,
        
      })
    }
  };

  // api calling
  const getRakeHandlingSheetData = async () => {
    try {
      const response = await httpsGet(
        `rake_event_by_shipment/get?id=${shipment.id}`
      );
      setRakeHandlingSheetData(response?.data);
      if(response?.data){
        setPreviousData(response?.data);
        response?.data.filter((data:any) => data.event_name === "RakeArrivalAtStation").map((data:any) => {
          setRakeArrivalAtStationDate(new Date(data?.event_timestamp))
        })
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect
  useEffect(() => {
    getRakeHandlingSheetData();
  }, []);

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
                    value={rakeArrivalAtStationDate ? dayjs(rakeArrivalAtStationDate) : null}
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
                          setOpenRakeArrivalAtServingStation(!openRakeArrivalAtServingStation);
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
                {text("rakeArrivalAtPlant")}
              </header>
              <div className="inputForRakeSection">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openRakeArrivalAtPlant}
                    onClose={() => {
                        setOpenRakeArrivalAtPlant(false);
                    }}
                    value={rakeArrivalAtPlantDate ? dayjs(rakeArrivalAtPlantDate) : null}
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
                    value={wagonPlacedAtLoadingPointDate ? dayjs(wagonPlacedAtLoadingPointDate) : null}
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
                          setOpenWagonPlacedAtLoadingPoint(!openWagonPlacedAtLoadingPoint);
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
          </div>

          {millDetails.map((item, index): any => {
            return (
              <div key={index}>
                <div style={{ marginBottom: "26px" }}>
                  <header className="headerForRakeSection_millDetails">
                    {text("mill")} {index + 1}
                  </header>
                  <div
                    className="millDetails_dropDown"
                    onClick={(e: any) => {
                      clickActionBox(e, index, "", "");
                      setAnchorEl(
                        e.currentTarget as unknown as HTMLButtonElement
                      );
                    }}
                  >
                    <div>{item.mill}</div>
                    {/* <div className="expandMoreIcon_millDetails">
                                            <ExpandMoreIcon />
                                        </div> */}
                    <Popover
                      open={showActionBox === index ? true : false}
                      anchorEl={anchorEl}
                      onClose={handleCloseAction}
                      anchorOrigin={{
                        vertical: 40,
                        horizontal: 0,
                      }}
                    >
                      <div
                        className="action-popover-wagon"
                        onClick={(e) => {
                          addMillInMillDetails(e, index, text("railmill"));
                        }}
                      >
                        {text("railmill")}
                      </div>
                      <div
                        className="action-popover-wagon"
                        onClick={(e) => {
                          addMillInMillDetails(e, index, text("plateMill"));
                        }}
                      >
                        {text("plateMill")}
                      </div>
                      <div
                        className="action-popover-wagon"
                        onClick={(e) => {
                          addMillInMillDetails(e, index, text("semis"));
                        }}
                      >
                        {text("semis")}
                      </div>
                      <div
                        className="action-popover-wagon"
                        onClick={(e) => {
                          addMillInMillDetails(e, index, text("barMill"));
                        }}
                      >
                        {text("barMill")}
                      </div>
                      <div
                        className="action-popover-wagon"
                        onClick={(e) => {
                          addMillInMillDetails(e, index, text("cementPlant"));
                        }}
                      >
                        {text("cementPlant")}
                      </div>
                      <div
                        className="action-popover-wagon"
                        onClick={(e) => {
                          addMillInMillDetails(e, index, text("steel"));
                        }}
                      >
                        {text("steel")}
                      </div>
                    </Popover>
                  </div>
                </div>

                <div id="hookSelectionContainer">
                  {item.hooks.map((hookItem, hookIndex) => {
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
                          {/* <div className="inputForMillDetails_hooks">
                                                        {hookItem.wagonType}
                                                    </div> */}
                          <input className="inputForRakeSection" type="text" />
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

                {millDetails.length === 1 ||
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
                )}
                {millDetails.length === 1 ||
                index === millDetails.length - 1 ? null : (
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

          <Button
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
          </Button>
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
                    value={rlylocoReportingDate ? dayjs(rlylocoReportingDate) : null}
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
