"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header/header";
import { httpsPost, httpsGet } from "@/utils/Communication";
import SideDrawer from "@/components/Drawer/Drawer";
import "./style.css";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Image from "next/image";
import { useSnackbar } from "@/hooks/snackBar";
import BOST from "@/assets/BOST Final 1.png";
import BFNV from "@/assets/BFNV final 1.png";
import BOBRN from "@/assets/BOBRN final 1.png";
import BRNA from "@/assets/BRNA 1.png";
import BRN229 from "@/assets/BRN 23.png";
import { Suspense } from "react";
import Loader from "@/components/Loading/WithBackDrop";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';
import CloseButtonIcon from "@/assets/close_icon.svg";
import { ThreeCircles } from "react-loader-spinner";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

function AssignHooksToLoadingShop() {
  return (
    <Suspense fallback={<Loader />}>
      <AssignHooksToLoadingShopContent />
    </Suspense>
  );
}

export default AssignHooksToLoadingShop;

function wagonImage(wagonImage: any) {
  switch (wagonImage) {
    case "BOST":
      return { image: BOST, imageWidth: 97, imageHeight: 40 };
      break;
    case "BFNV":
      return { image: BFNV, imageWidth: 101, imageHeight: 36 };
      break;
    case "BOBRN":
      return { image: BOBRN, imageWidth: 97, imageHeight: 40 };
      break;
    case "BRNA":
      return { image: BRNA, imageWidth: 97, imageHeight: 40 };
      break;
    case "BRN22.9":
      return { image: BRN229, imageWidth: 127, imageHeight: 30 };
      break;
    default:
      return { image: BOST, imageWidth: 97, imageHeight: 40 };
  }
}

const compareHooksData = (existingHooks: any[], workingHooks: any[]) => {
  const filteredExistingHooks = existingHooks.filter((hook) => hook.hook_no !== undefined);
  const filteredWorkingHooks = workingHooks.filter((hook) => hook.hook_no !== undefined);

  if (filteredExistingHooks.length !== filteredWorkingHooks.length) {
    return true;
  }

  const hooksMatch = filteredExistingHooks.every((existingHook) =>
    filteredWorkingHooks.some((workingHook) => workingHook.hook_no === existingHook.hook_no)
  );

  return !hooksMatch;
};

function AssignHooksToLoadingShopContent() {
  const text = useTranslations("WAGONTALLYSHEET");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("shipmentId");
  const showMessage = useSnackbar();
  const [shipmentData, setShipmentData] = useState<any>(null);

  const [openPlantDropDown, setOpenPlantDropDown] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [allPlants, setAllPlants] = useState<any>([]);

  const [originalHooksList, setOriginalHooksList] = useState<any>([]);
  const [workingWagonsList, setWorkingWagonsList] = useState<any>([]);
  const [wagonListAssignToPlant, setWagonListAssignToPlant] = useState<any>([]);
  const [originalWagonListAssignToPlant, setOriginalWagonListAssignToPlant] = useState<any>([]);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [selectedPlantObject, setSelectedPlantObject] = useState<any>(null);
  const [isSelectionConfirmed, setIsSelectionConfirmed] = useState(false);

  // const [hookNumber, setHookNumber] = useState(0);
  const [hookManagement, setHookManagement] = useState<any>([]);
  const [selectedHook, setSelectedHook] = useState<any>(null);
  const [openHooksDropdown, setOpenHooksDropdown] = useState(false);

  const [loading, setLoading] = useState(false);

  // api calling
  const getAssignLoadingShop = async () => {
    try {
      setLoading(true);
      const response = await httpsGet(
        `get_assigned_loading_shops?shipment=${id}`, 0, router
      );
      setAllPlants(response?.data);
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getWagonsByHooks = async () => {
    let payload = {
      shipment: id,
      plant: selectedPlant?.plant?._id,
    };
    if (payload.plant) {
      try {
        setLoading(true);
        const response = await httpsPost(`get_wagons_by_hooks`, payload, router);
        setWagonListAssignToPlant(response?.data?.wagonData);
        const existingHooksData = response?.data?.wagonData.map((wagon: any) => {
          return {
            _id: wagon._id,
            hook_no: wagon.hook_no,
          }
        });
        setOriginalWagonListAssignToPlant(existingHooksData);
        setShipmentData(response?.data?.shipmentData);
      } catch (error) {
        setLoading(false);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAssignHooks = async () => {
    const selectedWagonsIDs = workingWagonsList
      .filter((wagon: any) => wagon.hook_no === selectedHook)
      .map((wagon: any) => wagon._id);
    let payload = {
      shipment: id,
      plant_assigned: selectedPlant?.plant?._id,
      hook_no: selectedHook,
      wagons: selectedWagonsIDs,
    };
    try {
        setLoading(true);
        await httpsPost(`assign_hook_to_plant`, payload, router);
        showMessage.showMessage(`Hooks assigned successfully for hook ${selectedHook} of ${selectedPlant?.plant?.name}
        `, "success");
        getWagonsByHooks();
    } catch (error) {
      setLoading(false);
        console.log(error)
    } finally {
      setLoading(false);
    }
  };

  //local functions
  
  const handleSelectionOfPlant = (
    event: any,
    plantObject: any,
    index: number
  ) => {
    event.stopPropagation();
    setSelectedPlantObject(plantObject);

    const existingHooksData = originalWagonListAssignToPlant.map((wagon: any) => {
      return {
        _id: wagon._id,
        hook_no: wagon.hook_no,
      }
    });
    const workingHooksData = workingWagonsList.map((wagon: any) => {
      return {
        _id: wagon._id,
        hook_no: wagon.hook_no,
      }
    });
    const confirm = compareHooksData(existingHooksData, workingHooksData);
    if(confirm) {
      const handleOpen = () => setOpenConfirmationDialog(true);
      handleOpen();
      return;
    } else {
      setIsSelectionConfirmed(true);
    }
  };

  useEffect(() => {
    if (isSelectionConfirmed && selectedPlantObject) {
      handleSelectionOfPlantConfirmed();
      setIsSelectionConfirmed(false);
    }
  }, [isSelectionConfirmed, selectedPlantObject]);

  const handleSelectionOfPlantConfirmed  = () => {
    const plantObject = selectedPlantObject;

    setOpenPlantDropDown(false);
    setOpenHooksDropdown(false);
    setSelectedPlant(plantObject);
    setSelectedHook(plantObject?.hooksRecords[0]?.hookNumber);
  }


  const assignHooksToSelectedWagon = (e: any, wagons: any, index: number) => {
    e.stopPropagation();
    
    setWorkingWagonsList((prevWagons: any) => {
      const newWagons = [...prevWagons];
      if (newWagons[index].hook_no === selectedHook) {
        delete newWagons[index].hook_no;
      } else {
        if (newWagons[index].hook_no) {
          showMessage.showMessage(
            `Wagon is already assigned to hook ${newWagons[index].hook_no}`,
            "error"
          );
          return newWagons;
        }
        newWagons[index].hook_no = selectedHook;
      }
      return newWagons;
    });

    //hookManagement
    setHookManagement((prevHookManagement: any) => {
      const newHookManagement = [...prevHookManagement];
      newHookManagement.map((plantObject: any) => {
        if (plantObject?.plant?._id === selectedPlant?.plant?._id) {
          plantObject.hooksRecords.map((hookObject: any) => {
            if (hookObject.hookNumber === selectedHook) {
              hookObject.wagonsList = [...hookObject.wagonsList, wagons._id];
            }
          });
        }
      });
      return newHookManagement;
    });
  };

  const handleAssignHooksToSelectedHook = (
    event: any,
    hook: any,
    index: number
  ) => {
    event.stopPropagation();
    setOpenHooksDropdown(false);
    setSelectedHook(hook?.hook_no);
  };

  useEffect(() => {
    getAssignLoadingShop();
  }, []);

  useEffect(() => {
    if (selectedPlant) getWagonsByHooks();
  }, [selectedPlant]);

  const handleClose = () => {
    setOpenConfirmationDialog(false);
  };

  useEffect(() => {
    setWorkingWagonsList(wagonListAssignToPlant);

    setHookManagement((previous: any) => {
      const newHookManagement = [...previous];
      wagonListAssignToPlant.map((plantObject: any) => {
        if (plantObject.hook_no) {
          let hookExists = false;

          newHookManagement.map((hookObject: any) => {
            const hookRecord = hookObject.hooksRecords.find(
              (hook: any) => hook.hookNumber === plantObject.hook_no
            );
            if (hookRecord) {
              // Hook number exists, push plantObject._id to wagonsList
              hookRecord.wagonsList.push(plantObject._id);
              hookExists = true; // Mark that hook number exists
            }
          });

          if (!hookExists) {
            newHookManagement.map((hookObject: any) => {
              hookObject.hooksRecords.push({
                hookNumber: plantObject.hook_no,
                wagonsList: [plantObject._id],
              });
            });
          }
        }
      });

      return newHookManagement;
    });
  }, [wagonListAssignToPlant]);

  useEffect(() => {
    if (allPlants.length > 0) {
      const updatedPlants = allPlants.map((item: any) => ({
        ...item,
        hooksRecords: [{ hookNumber: 1, wagonsList: [] }],
      }));

      setHookManagement(updatedPlants);
      setOriginalHooksList(updatedPlants);

      const firstPlant = updatedPlants[0];
      setSelectedPlant(firstPlant);
      setSelectedHook(firstPlant?.hooksRecords[0]?.hookNumber);
    }
  }, [allPlants]);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      !(e.target as HTMLElement).closest('#dropdownForPlantsMaincontainer') &&
      !(e.target as HTMLElement).closest('#dropdownListForplants') &&
      !(e.target as HTMLElement).closest('#dropdownListForHooks')
    ) {
      setOpenPlantDropDown(false);
      setOpenHooksDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
      className="wagon-wrapper"
      onClick={(e) => {
        e.stopPropagation();
        setOpenPlantDropDown(false);
        setOpenHooksDropdown(false);
      }}
    >
      <Header title={text("in-plant-Dashboard")} isMapHelper={false} />
      <div id="pageInsideContent">
        <div id="search-container-assign-hooks">
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push("/inPlantDashboard");
            }}
          >
            <ArrowBackIcon />
          </div>
          <h3 className="search-container-assign-title">{text("assignsHooksToLoadingShop")}</h3>
          <div></div>
        </div>

        <div className="shipment-details-container">
        <div id="status-for-assign-sheet-hooks">
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("status")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentData?.status || ""}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("FNRno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentData?.FNR || ""}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("edemandno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentData?.edemand_no || ""}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("receivedWagons")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentData?.received_no_of_wagons || ""}
            </text>
          </div>
        </div>
        </div>

        <div id="filtersForHooksAssignToLoadingShop">
          <div id="selectAPlant">
            <label id="selectAPlantLabel">{text("selectAplant")}</label>
            <div
              id="dropdownForPlantsMaincontainer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenPlantDropDown(!openPlantDropDown);
                setOpenHooksDropdown(false);
              }}
            >
              <div>{selectedPlant?.plant?.name || "Select Mill"}</div>
              <ArrowDropDownIcon />
            </div>
            {openPlantDropDown && (
              <div id="dropdownListForplants">
                {hookManagement?.map((eachPlant: any, index: number) => {
                  return (
                    <div
                      onClick={(e) => {
                        handleSelectionOfPlant(e, eachPlant, index);
                      }}
                      key={index}
                      className="dropdownListForPlantsEachItem"
                    >
                      {eachPlant?.plant?.name}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div id="hooksFilter">
            <label id="selectAPlantLabel">{text("assignHooks")}</label>
            <div
              id="dropdownForPlantsMaincontainer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenPlantDropDown(false)
                setOpenHooksDropdown(!openHooksDropdown);
              }}
            >
              <div>{selectedHook ? `Hook ${selectedHook}` : "Select Hook"}</div>
              <ArrowDropDownIcon />
            </div>
            {openHooksDropdown && (
              <div id="dropdownListForHooks">
                {selectedPlant?.hooks.map(
                  (eachhook: any, index: number) => {
                    return (
                      <div
                        key={index}
                        className="dropdownListForPlantsEachItem"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignHooksToSelectedHook(e, eachhook, index);
                        }}
                      >
                        <div>Hook {eachhook.hook_no}</div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

        <div id="wagonListContainer">
          {workingWagonsList.map((wagons: any, index: number) => {
            return (
              <div
                key={index}
                className="wagonAssignToMillConatiner"
              >
                <div
                  className="wagonsAssignToMillImageSelectorConatainer"
                  onClick={(e) => {
                    e.stopPropagation();
                    // if (!wagons.is_sick) {
                    // }
                    assignHooksToSelectedWagon(e, wagons, index);
                  }}
                >
                  {wagons?.hook_no && (
                    <div
                      className="wagonsAssigntoMillCheckedIcon"
                      style={{
                        backgroundColor:
                          wagons?.hook_no === selectedHook
                            ? "black"
                            : "lightgrey",
                        color: "white",
                        fontSize: "10px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div>{wagons?.hook_no}</div>
                    </div>
                  )}
                  <div className="wagonsAssignToMillImageSelector">
                    <div style={{ width: 40, height: 17 }}>
                      <Image
                        src={wagonImage(wagons?.wagon_type?.name).image.src}
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
                    {wagons?.w_no || ""}
                  </header>
                  <header id="wagonsAssignToMilltype">
                    {wagons?.wagon_type?.name || ""}
                  </header>
                </div>
              </div>
            );
          })}
        </div>

        <div id="buttonContainerHooks">
          <div
            style={{
              cursor: "pointer",
              width: "fit-content",
              borderRadius: 6,
              paddingInline: 24,
              paddingBlock: 12,
              backgroundColor: "#3351FF",
              fontSize: 14,
              color: "white",
              textTransform: "uppercase",
            }}
            onClick={handleAssignHooks}
          >
            ASSIGN
          </div>
        </div>

        <BootstrapDialog 
          open={openConfirmationDialog} 
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          className="confirm-dialog-styles"
        >
          <div className='confirm-dialog-container'>
            <DialogContent>
              <div
                aria-label="close"
                onClick={handleClose}
                className="confirm-close-icon"
              >
                <Image src={CloseButtonIcon} alt="close" />
              </div>
              <div className='confirm-dialog-content'>
                <p style={{textAlign: "center", fontWeight: 500, fontSize: 18}}>
                  {text('assignHooksConfirmMsg')} 
                </p>
              </div>
              <div className='confirm-dialog-buttons-container'>
                <div 
                  onClick={() => {
                    handleSelectionOfPlantConfirmed();
                    setOpenConfirmationDialog(false);
                  }}
                  className='confirm-button'>
                  {text('confirm')} 
                </div>
                <div 
                  onClick={handleClose}
                  className='cancel-button'>
                  {text('cancel')} 
                </div>
              </div>
            </DialogContent>
          </div>
        </BootstrapDialog>
      </div>
      <SideDrawer />
    </div>
  );
}
