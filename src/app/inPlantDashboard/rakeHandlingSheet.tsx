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
import timeService from '@/utils/timeService'
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import { ThreeCircles } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import './page.css'
import { Button as MUIButton } from "@mui/material";

const events_names = {
  rakeArrivalAtStation: "Rake Arrival at Serving Station",
  stabled: "Stabled",
  placementTime: "Placement Time",
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
  bpRelease: "BPR",
  wagonPlacedAtLoadingPoint: "WLP",
  loadRakeFormation: "LRF",
  rakeRelease: "RKR",
  rlylocoReporting: "RLR",
  eot: "EOT",
  apReady: "APR",
  drawnOut: "DRO",
  HLS: "HLS",
  HLC: "HLC"
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize:'12px'
  },
  hookCard: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    maxWidth: '200px',
    minWidth:'200px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '16px',
    gap: '16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  headerText: {
    fontWeight: 600,
  },
  actionButtonContainer: {
    display: 'flex',
    gap: '8px',
  },
  addButton: {
    cursor: 'pointer',
    backgroundColor: '#007BFF',
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    cursor: 'pointer',
    backgroundColor: '#FF0000',
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '16px',
  },
  loadingTimeContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '8px',
  },
  loadingTimeText: {
    marginTop: '6px',
    color: 'black',
    fontWeight: 600,
  },
};

function RakeHandlingSheet({ isClose, shipment, getWagonDetails }: any) {
  const router = useRouter(); 
  const showMessage = useSnackbar();
  const text = useTranslations("WAGONTALLYSHEET");
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

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
  const [rakeArrivalAtStationObject, setRakeArrivalAtStationObject] = useState<any>({});
  const [rakeArrivalAtStationDate, setRakeArrivalAtStationDate] = useState<Date | null>(null);
  const [openRakeArrivalAtServingStation, setOpenRakeArrivalAtServingStation] = useState(false);

  const [stabled, setStabled] = useState<any>({});
  const [stabledDate, setStabledDate] = useState<Date | null>(null);
  const [openStabled, setOpenStabled] = useState(false);

  const [placementTime, setPlacementTime] = useState<any>({});
  const [placementTimeDate, setPlacementTimeDate] = useState<Date | null>(null);
  const [openPlacementTime, setOpenPlacementTime] = useState(false);

  const [bpReleaseObject, setBpReleaseObject] = useState<any>({});
  const [bpReleaseDate, setBpReleaseDate] = useState<Date | null>(null);
  const [openBpRelease, setOpenBpRelease] = useState(false);

  const [wagonPlacedAtLoadingPointObject, setWagonPlacedAtLoadingPointObject] = useState<any>({});
  const [wagonPlacedAtLoadingPointDate, setWagonPlacedAtLoadingPointDate] = useState<Date | null>(null);
  const [openWagonPlacedAtLoadingPoint, setOpenWagonPlacedAtLoadingPoint] = useState(false);

  const [loadRakeFormationObject, setLoadRakeFormationObject] = useState<any>({});
  const [loadRakeFormationDate, setLoadRakeFormationDate] = useState<Date | null>(null);
  const [openLoadRakeFormation, setOpenLoadRakeFormation] = useState(false);

  const [rakeReleaseObject, setRakeReleaseObject] = useState<any>({});
  const [rakeReleaseDate, setRakeReleaseDate] = useState<Date | null>(null);
  const [openRakeRelease, setOpenRakeRelease] = useState(false);

  const [rlylocoReportingObject, setRlylocoReportingObject] = useState<any>({});
  const [rlylocoReportingDate, setRlylocoReportingDate] = useState<Date | null>(null);
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
  const [arrivalPlNo, setArrivalPlNo] = useState('');
  const [formationPlNo, setFormationPlNo] = useState('');
  const [weighment, setWeighment] = useState(false);

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
    setWorkingPlant((prevMillDetails: any) => {
      const updatedMillDetails = [...prevMillDetails];
      const hookToRemove = updatedMillDetails[index].hooks[hookIndex];
      if (!hookToRemove.loading_start && !hookToRemove.loading_end) {
        updatedMillDetails[index].hooks.splice(hookIndex, 1);
      }
      return updatedMillDetails;
    });
  }
  function addHookInMillDetails(event: any, index: number) {
    setWorkingPlant((prevMillDetails: any) => {
      const updatedMillDetails = [...prevMillDetails];
      if (!updatedMillDetails[index].hooks) {
        updatedMillDetails[index].hooks = [];
      }
      updatedMillDetails[index].hooks.push({
        hook_no: updatedMillDetails[index].hooks.length + 1,
        count: 0,
      });
      return updatedMillDetails;
    });
  }

  const inputHooksForplants = (
    event: any,
    plantIndex: number,
    hookIndex: number
  ) => {
    const value = parseInt(event.target.value, 10);
    setWorkingPlant((previousState: any) => {
      const updatedMillDetails = [...previousState];
      updatedMillDetails[plantIndex].hooks[hookIndex].no_of_wagons = value;
      return updatedMillDetails;
    });
  };

  const submitRakeHandlingSheet = async () => {
    let payload = {
      events: [] as any,
      shipment: shipment.id,
      arrival_pl: '' as any,
      formation_pl: '' as any,
      weighment: false,
      hooks: [] as any,
    };
    workingPlant.forEach((plant: any) => {
      plant.hooks.forEach((hook: any) => {
        payload.hooks.push({
          plant: plant.plant._id,
          hook_no: hook.hook_no,
        });
      });
    });

    workingPlant.forEach((plant: any) => {
      plant.hooks.forEach((hook: any) => {
        if (hook.loading_start) {
          payload.events.push({
            shipment: shipment.id,
            event_name: `${hook.hook_no} Hook Loading Start`,
            event_code: "HLS",
            event_datetime: hook.loading_start,
            FNR: shipment.fnr,
            plant: plant.plant._id,
            hook: hook.hook_no
          });
        }
        if (hook.loading_end) {
          payload.events.push({
            shipment: shipment.id,
            event_name: `${hook.hook_no} Hook Loading Complete`,
            event_code: "HLC",
            event_datetime: hook.loading_end,
            FNR: shipment.fnr,
            plant: plant.plant._id,
            hook: hook.hook_no
          });
        }
      });
    });
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
    if (arrivalPlNo) {
      payload.arrival_pl = arrivalPlNo;
    }
    if (formationPlNo) {
      payload.formation_pl = formationPlNo;
    }
    payload.weighment = weighment;
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
    try {
      setLoading(true);
      const response = await httpsPost(`rake_event/add`, payload, router);
      if (response.statusCode === 200) {
        showMessage.showMessage("Rake Handling Sheet Added Successfully", "success");
        setRakeHandlingSheetData((prevData: any) => {
          const updatedData = [...prevData];
          payload.events.forEach((newEvent: any) => {
            const index = updatedData.findIndex((event) => event.event_name === newEvent.event_name);
            if (index !== -1) {
              updatedData[index] = { ...updatedData[index], ...newEvent };
            } else {
              updatedData.push(newEvent);
            }
          });
          return updatedData;
        });
        updateEventStates(payload.events);
        setWorkingPlant((prevPlants: any[]) => {
          return prevPlants.map((plant) => ({
            ...plant,
            hooks: plant.hooks.map((hook: any) => ({
              ...hook,
              loading_start: payload.events.find((event: any) => event.event_name.includes(`${hook.hook_no} Hook Loading Start`))?.event_datetime || hook.loading_start,
              loading_end: payload.events.find((event: any) => event.event_name.includes(`${hook.hook_no} Hook Loading Complete`))?.event_datetime || hook.loading_end,
            }))
          }));
        });
        // Close the modal after successful submission
        getWagonDetails()
        isClose(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getRakeHandlingSheetData = async () => {
    try {
      setLoading(true);
      const response = await httpsGet(
        `rake_event_by_shipment/get?id=${shipment.id}`, 0, router
      );
      setRakeHandlingSheetData(response?.data);
      updateEventStates(response?.data);
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateEventStates = (events: any[]) => {
    events.forEach((event: any) => {
      const eventDate = new Date(event.event_timestamp);
      switch (event.event_code) {
        case eventCodes.rakeArrivalAtStation:
          setRakeArrivalAtStationObject(event);
          setRakeArrivalAtStationDate(eventDate);
          break;
        case eventCodes.stabled:
          setStabled(event);
          setStabledDate(eventDate);
          break;
        case eventCodes.placementTime:
          setPlacementTime(event);
          setPlacementTimeDate(eventDate);
          break;
        case eventCodes.bpRelease:
          setBpReleaseObject(event);
          setBpReleaseDate(eventDate);
          break;
        case eventCodes.wagonPlacedAtLoadingPoint:
          setWagonPlacedAtLoadingPointObject(event);
          setWagonPlacedAtLoadingPointDate(eventDate);
          break;
        case eventCodes.loadRakeFormation:
          setLoadRakeFormationObject(event);
          setLoadRakeFormationDate(eventDate);
          break;
        case eventCodes.rakeRelease:
          setRakeReleaseObject(event);
          setRakeReleaseDate(eventDate);
          break;
        case eventCodes.rlylocoReporting:
          setRlylocoReportingObject(event);
          setRlylocoReportingDate(eventDate);
          break;
        case eventCodes.eot:
          setEotObject(event);
          setEotDate(eventDate);
          break;
        case eventCodes.apReady:
          setApReadyObject(event);
          setApReadyDate(eventDate);
          break;
        case eventCodes.drawnOut:
          setDrawnOutObject(event);
          setDrawnOutDate(eventDate);
          break;
      }
    });
  };

  const plantDetails = async () => {
    try {
      setLoading(true);
      const response = await httpsGet(
        `get_assigned_loading_shops?shipment=${shipment.id}`, 0, router
      );
      setPlants(response.data);
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const addFirstHookToMillDetails = async (event: any, index: any) => {
    setWorkingPlant((prev: any) => {
      let newState = [...prev];
      newState[index].hooks.push({
        hook_no: 1,
      });
      return newState;
    });
  };

  const removeLastHookFromMillDetails = async (event: any, index: any) => {
    setWorkingPlant((prev: any) => {
      let newState = [...prev];
      newState[index].hooks.pop();
      return newState;
    });
  };

  useEffect(() => {
    if (shipment) {
      setArrivalPlNo(shipment.arrival_pl || '');
      setFormationPlNo(shipment.formation_pl || '');
      setWeighment(shipment.weighment || false);
      getRakeHandlingSheetData();
      plantDetails();
    }
  }, [shipment]);

  useEffect(() => {
    setWorkingPlant((prev: any) => {
      let newState = plants;
      return newState;
    });
  }, [plants]);

  useEffect(() => {
    if (rakeHandlingSheetData.length > 0 && plants.length > 0) {
      const hookEvents = rakeHandlingSheetData.filter((data: any) => 
        data.event_category === "Hook Loading"
      );

      const updatedWorkingPlant = plants.map((plant: any) => {
        const plantHookEvents = hookEvents.filter((event: any) => 
          event.plant === plant.plant._id
        );
        
        const updatedHooks = plant.hooks.map((hook: any) => {
          const startEvent = plantHookEvents.find((event: any) => 
            event.hook === hook.hook_no && event.event_name.includes("Loading Start")
          );
          const endEvent = plantHookEvents.find((event: any) => 
            event.hook === hook.hook_no && event.event_name.includes("Loading Complete")
          );
          
          return {
            ...hook,
            loading_start: startEvent ? startEvent.event_timestamp : null,
            loading_end: endEvent ? endEvent.event_timestamp : null
          };
        });
        
        return {
          ...plant,
          hooks: updatedHooks
        };
      });

      setWorkingPlant(updatedWorkingPlant);
    }
  }, [rakeHandlingSheetData, plants]);

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
        className="rake-handling-sheet-modal-main"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header id="headerForRakeHandlingSheet">
          {text("rakeHandlingSheet")}
        </header>
        <div className="rake-details">
          <div className="detail-item">
            <div className="item-label-header">{text("IndentNo")}</div>
            <div className="item-content">
              {shipment?.indent?.indent_no || "--"}
            </div>
          </div>
          <div className="detail-item">
            <div className="item-label-header">{text("rakeNumber")}</div>
            <div className="item-content">{shipment?.rake_no || "--"}</div>
          </div>
          <div className="detail-item">
            <div className="item-label-header">{text("status")}</div>
            <div className="item-content">
              {shipment?.status?.statusLabel || "--"}
            </div>
          </div>
          <div className="detail-item">
            <div className="item-label-header">{text("wagonType")}</div>
            <div className="item-content">
              {shipment?.wagon_type || "--"}
            </div>
          </div>
        </div>
        <div
          style={{
            borderBottom: "1px solid #B3B3B3",
            width: "100%",
            marginTop: 16,
            marginBottom: 16,
          }}
        ></div>
        <div
          className="rake-details"
          style={{ alignItems: "center", display: "flex", columnGap: "50px" }}
        >
          <div className="detail-item">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                htmlFor="arr_pl"
                style={{ fontSize: "12px", marginBottom: "6px" }}
              >
                Arrival P/L No.
              </label>
              <input
                type="input"
                id="arr_pl"
                className="inputForRakeSectionHandling"
                value={arrivalPlNo}
                onChange={(e)=> setArrivalPlNo(e.target.value)}
              />
            </div>
          </div>
          <div className="detail-item">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <label
                htmlFor="arr_pl"
                style={{ fontSize: "12px", marginBottom: "6px" }}
              >
                Formation P/L No.
              </label>
              <input
                type="input"
                id="arr_pl"
                value={formationPlNo}
                className="inputForRakeSectionHandling"
                onChange={(e)=> setFormationPlNo(e.target.value)}
              />
            </div>
          </div>
          <div className="detail-item">
            <div style={{ display: "flex", alignItems: "center",marginTop:'16px' }}>
              <input type="checkbox" id="myCheckbox" style={{cursor:'pointer'}}
              onChange={(e)=> setWeighment(e.target.checked)}
              checked={weighment}
              />
              <label
                htmlFor="myCheckbox"
                style={{ marginLeft: "8px", fontSize: "12px" }}
              >
                Weighment done
              </label>
            </div>
          </div>
        </div>
        <div
          style={{
            borderBottom: "1px solid #B3B3B3",
            width: "100%",
            marginTop: 16,
            marginBottom: 16,
          }}
        ></div>
        <div id="scrollAreaforRakeSheet">
          <div id="firstSectionofRakeSheetHandling">
            <div>
              <header className="headerForRakeSection">
                {text("rakeArrivalAtStation")}
              </header>
              <div className="inputForRakeSectionHandling">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openRakeArrivalAtServingStation}
                    onClose={() => {
                      setOpenRakeArrivalAtServingStation(false);
                    }}
                    value={
                      rakeArrivalAtStationDate
                        ? dayjs(rakeArrivalAtStationDate)
                        : null
                    }
                    sx={{
                      width: "100%",
                      height: "100%",

                      ".MuiInputBase-input": {
                        padding: "8px 4px",
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("stabled")}
              </header>
              <div className="inputForRakeSectionHandling">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openStabled}
                    onClose={() => {
                      setOpenStabled(false);
                    }}
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("placementTime")}
              </header>
              <div className="inputForRakeSectionHandling">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    open={openPlacementTime}
                    onClose={() => {
                      setOpenPlacementTime(false);
                    }}
                    value={
                      placementTimeDate
                        ? dayjs(placementTimeDate)
                        : (shipment?.placement_time.date_time &&
                            dayjs(shipment?.placement_time?.date_time)) ||
                          null
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("bpRelease")}
              </header>
              <div className="inputForRakeSectionHandling">
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("wagonPlacedAtLoadingPoint")}
              </header>
              <div className="inputForRakeSectionHandling">
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
                        "& fieldset":{ border: "none" },
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
          </div>

          {workingPlant.map((item: any, index: any) => (
            <div key={index}>
              <div
                style={{
                  paddingBlock: "0.5px",
                  paddingInline: "16px",
                  borderRadius: "12px",
                }}
              >
                <div className="millDetails-dashboard">
                  <div style={{ width: "200px", display: "flex", columnGap: "4px" }}>
                    Loading Shop:
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
                  <div style={{ width: "200px",display: "flex", columnGap: "4px" }}>
                    No. of Wagons Assigned:
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
                </div>

                {item.hooks.length === 0 ? (
                  <MUIButton
                    variant="contained"
                    color="primary"
                    onClick={() => addHookInMillDetails(null, index)}
                    style={{
                      marginTop: '8px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: '1px solid #2196f3',
                      fontSize:'10px'
                    }}
                  >
                    Add Hook
                  </MUIButton>
                ) : (
                  <div id="hookSelectionContainer" style={styles.container}>
                  {item.hooks.map((hookItem: any, hookIndex: number) => (
                    <div key={hookIndex} style={styles.hookCard}>
                      {/* Header Section */}
                      <div style={styles.header}>
                        <header style={styles.headerText}>
                          Hook {hookIndex + 1}
                        </header>
                        <div style={styles.actionButtonContainer}>
                          {/* Add Hook Button */}
                          {hookIndex === item.hooks.length - 1 && (
                            <div
                              onClick={(e) => addHookInMillDetails(e, index)}
                              style={styles.addButton}
                            >
                              <AddIcon style={styles.icon} />
                            </div>
                          )}
                          {/* Remove Hook Button */}
                          {!hookItem.loading_start &&
                            !hookItem.loading_end && (
                              <div
                                onClick={(e) => removeHookFromMillDetails(e, index, hookIndex)}
                                style={styles.removeButton}
                              >
                                <RemoveIcon style={styles.icon} />
                              </div>
                            )}
                        </div>
                      </div>
            
                      {/* Loading Time Section */}
                      <div style={styles.loadingTimeContainer}>
                        <div>
                          <div>{text("loadingstarttime")}</div>
                          <div style={styles.loadingTimeText}>
                            {hookItem.loading_start
                              ? `${timeService.utcToist(hookItem.loading_start)} ${timeService.utcToistTime(hookItem.loading_start)}`
                              : "--"}
                          </div>
                        </div>
                        <div>
                          <div>{text("loadingEndTime")}</div>
                          <div style={styles.loadingTimeText}>
                            {hookItem.loading_end
                              ? `${timeService.utcToist(hookItem.loading_end)} ${timeService.utcToistTime(hookItem.loading_end)}`
                              : "--"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              {workingPlant.length === 1 ||
              index === workingPlant.length - 1 ? null : (
                <div
                  style={{
                    borderBottom: "1px solid #E0E0E0",
                    width: "100%",
                    marginTop: 16,
                    marginBottom: 16,
                  }}
                ></div>
              )}
            </div>
          ))}

          <div>
            {workingPlant.length > 0 && (
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
          <div id="lastSection">
            <div>
              <header className="headerForRakeSection">
                {text("loadRakeFormation")}
              </header>
              <div className="inputForRakeSectionHandling">
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("rakeRelease")}
              </header>
              <div className="inputForRakeSectionHandling">
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("rlylocoReporting")}
              </header>
              <div className="inputForRakeSectionHandling">
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">{text("eot")}</header>
              <div className="inputForRakeSectionHandling">
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("apReady")}
              </header>
              <div className="inputForRakeSectionHandling">
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
                    format="DD-MM-YYYY HH:mm "
                  />
                </LocalizationProvider>
              </div>
            </div>
            <div>
              <header className="headerForRakeSection">
                {text("drawnOut")}
              </header>
              <div className="inputForRakeSectionHandling">
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
                    format="DD-MM-YYYY HH:mm "
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
              backgroundColor: "white",
              border: "1px solid #2862FF",
              width: 110,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.5s ease-in-out",
            }}
          >
            Clear
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
            Submit
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

