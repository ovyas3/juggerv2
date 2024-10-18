"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header/header";
import { httpsPost, httpsGet } from "@/utils/Communication";
import SideDrawer from "@/components/Drawer/Drawer";
import "./style.css";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import Image from "next/image";
import { useSnackbar } from "@/hooks/snackBar";


import BOST from "@/assets/BOST Final 1.png";
import BFNV from "@/assets/BFNV final 1.png";
import BOBRN from "@/assets/BOBRN final 1.png";
import BRNA from "@/assets/BRNA 1.png";
import BRN229 from "@/assets/BRN 23.png";
import Button from "@mui/material/Button";
import locomotive from "@/assets/Train_engine-removebg-preview 1.png";
import chain01 from "@/assets/chain 1.png";
import chain02 from "@/assets/chain 2.png";

function AssignHooksToLoadingShop() {
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

  // const [hookNumber, setHookNumber] = useState(0);
  const [hookManagement, setHookManagement] = useState<any>([]);
  const [selectedHook, setSelectedHook] = useState<any>(null);
  const [openHooksDropdown, setOpenHooksDropdown] = useState(false);

  // api calling
  const getAssignLoadingShop = async () => {
    try {
      const response = await httpsGet(
        `get_assigned_loading_shops?shipment=${id}`
      );
      setAllPlants(response?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const getWagonsByHooks = async () => {
    let payload = {
      shipment: id,
      plant: selectedPlant?.plant?._id,
    };
    if (payload.plant) {
      try {
        const response = await httpsPost(`get_wagons_by_hooks`, payload);
        setWagonListAssignToPlant(response?.data?.wagonData);
        setShipmentData(response?.data?.shipmentData);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAssignHooks = async () => {
    let payload = {
      shipment: id,
      plant_assigned: selectedPlant?.plant?._id,
      hook_no: 2,
      wagons: ['670919b4068631c0c5c7d57f'],
    };
    // try {
    //     const response = await httpsPost(`assign_hook_to_plant`, payload);
    //     console.log(response)
    // } catch (error) {
    //     console.log(error)
    // }
  };


  //local functions
  const handleSelectionOfPlant = (event: any, plantObject:any, index:number ) => {
      if(!arePlantRecordsEqual(originalHooksList,hookManagement)){
        showMessage.showMessage(`Please assign hooks to ${selectedPlant?.plant?.name} first`, "error");
        return;
      }
      event.stopPropagation();
      setOpenPlantDropDown(false);
      setOpenHooksDropdown(false);
      setSelectedPlant(plantObject);
      setSelectedHook(plantObject?.hooksRecords[0]?.hookNumber);
  }
  const assignHooksToSelectedWagon = (e: any, wagons: any, index: number) => {
    e.stopPropagation();

    //workingWagonsList
    // setWorkingWagonsList((prevWagons: any) => {
    //   const newWagons = [...prevWagons];
    //   newWagons[index].hook_no = selectedHook;
    //   return newWagons;
    // })

    setWorkingWagonsList((prevWagons: any) => {
      
      const newWagons = [...prevWagons];
      if (newWagons[index].hook_no === selectedHook) {
        delete newWagons[index].hook_no;
      } else {
        if(newWagons[index].hook_no){
          showMessage.showMessage(`wagon is already assigned to hook ${newWagons[index].hook_no}`, "error");
          return newWagons;
        }
        newWagons[index].hook_no = selectedHook;
      }
      return newWagons;
    });

     //hookManagement 
     setHookManagement((prevHookManagement: any)=>{
      const newHookManagement = [...prevHookManagement];
      newHookManagement.map((plantObject:any)=>{
        if(plantObject?.plant?._id === selectedPlant?.plant?._id){
          plantObject.hooksRecords.map((hookObject:any)=>{
            if(hookObject.hookNumber === selectedHook){
              hookObject.wagonsList = [...hookObject.wagonsList, wagons._id];
            }
          })
        }
      })
      return newHookManagement;
     })
  };
  const handleAssignHooksToSelectedHook = (event:any, hook:any, index:number) => {
    event.stopPropagation();
    setOpenHooksDropdown(false);
    setSelectedHook(hook?.hookNumber);
  }
  const addNewHooksToSelectedPlant = () => {
    // console.log('0987654321',selectedPlant.hooksRecords[selectedPlant.hooksRecords.length-1]) 
    if(selectedPlant.hooksRecords[selectedPlant.hooksRecords.length-1]?.wagonsList?.length === 0){
      showMessage.showMessage(`Please select wagons for hook ${selectedPlant.hooksRecords[selectedPlant.hooksRecords.length-1]?.hookNumber} `, "error");
      return;
    }
    console.log(workingWagonsList)
    // if(workingWagonsList.filter((wagon:any)=> wagon.hook_no)){
    //   showMessage.showMessage(`All Wagons are assigned`, "error");
    //   return;
    // }
    const allHaveHookNo = workingWagonsList.every((item:any) => item.hasOwnProperty('hook_no'));
    if (allHaveHookNo) {
      showMessage.showMessage(`All Wagons are assigned`, "error");
      return;
  }

    setHookManagement((prevHookManagement: any) => {
      const newHookManagement = [...prevHookManagement];
      newHookManagement.map((plantObject:any)=>{
        if(plantObject?.plant?._id === selectedPlant?.plant?._id){
          plantObject.hooksRecords = [
            ...plantObject.hooksRecords,
            { hookNumber: plantObject.hooksRecords.length+1, wagonsList: [] },
          ]
        }
      })
      return newHookManagement;
    });
  }

  useEffect(() => {
    getAssignLoadingShop();
  }, []);

  useEffect(() => {
    if (selectedPlant) getWagonsByHooks();
  }, [selectedPlant]);

  useEffect(() => {
    setWorkingWagonsList(wagonListAssignToPlant);

    setHookManagement((previous:any)=>{
      const newHookManagement = [...previous];
      // console.log(newHookManagement)
      // console.log(wagonListAssignToPlant)

      // wagonListAssignToPlant.map((plantObject:any)=>{
      //   if(plantObject.hook_no){
          
      //     newHookManagement.map((hookObject:any)=>{
      //       if(hookObject.hooksRecords.filter((hook:any)=>{hook.hookNumber === plantObject.hook_no})){
      //         hookObject.hooksRecords.map((hook:any)=>{
      //           hook.wagonsList.push(plantObject._id);
      //         })
      //       }
      //     })
      //   }
      // })

      wagonListAssignToPlant.map((plantObject:any)=>{
        if(plantObject.hook_no){
          let hookExists = false;

          newHookManagement.map((hookObject: any) => {
            const hookRecord = hookObject.hooksRecords.find((hook: any) => hook.hookNumber === plantObject.hook_no);
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
                wagonsList: [plantObject._id]
              });
            });
          }

        }
      })

      return newHookManagement;
    })

  }, [wagonListAssignToPlant]);

  useEffect(()=>{
    setHookManagement(() => {
      return allPlants.map((item: any, index:number) => ({
        ...item,
        hooksRecords: [
          { hookNumber: 1, wagonsList: [] },
        ],
      }));
    });
    setOriginalHooksList(()=>{
      return allPlants.map((item: any, index:number) => ({
        ...item,
        hooksRecords: [
          { hookNumber: 1, wagonsList: [] },
        ],
      }));
    })
  },[allPlants])



  // console.log('hookManagement---->>>>',hookManagement)
  // console.log('workingWagonsList---->>>>',workingWagonsList)

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

        <div id="search-container-assign">
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push("/inPlantDashboard");
            }}
          >
            <ArrowBackIcon />
          </div>
          <h3>{text("assignsHooksToLoadingShop")}</h3>
          <div></div>
        </div>

        <div id="status-for-assign-sheet">
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("status")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentData?.status || "XXXXX"}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("FNRno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentData?.FNR || "XXXXX"}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("edemandno")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentData?.edemand_no || "XXXXX"}
            </text>
          </div>
          <div>
            <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
              {text("receivedWagons")}
            </header>
            <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
              {shipmentData?.received_no_of_wagons || "XX"}
            </text>
          </div>
          {/* <div id="wagons-assign-notassigned">
            <div>
              {text("assignedWagons")}
              <span style={{ color: "#3351FF", fontWeight: 600 }}>
                {wagonsNewData?.filter((wagons: any) => wagons.plant_assigned)
                  .length || 0}
              </span>
            </div>
            <div>
              {text("notAssignedWagons")}
              <span style={{ color: "red", fontWeight: 600 }}>
                {wagonsNewData.filter((wagons: any) => !wagons.plant_assigned)
                  .length || 0}
              </span>
            </div>
            <div>
              {text("sickWagons")}
              <span style={{ color: "red", fontWeight: 600 }}>
                {wagonsNewData.filter((wagons: any) => wagons.is_sick).length ||
                  0}
              </span>
            </div>
          </div> */}
        </div>

        <div id="filtersForHooksAssignToLoadingShop">
          <div id="selectAPlant">
            <label id="selectAPlantLabel">{text("selectAplant")}</label>
            <div
              id="dropdownForPlantsMaincontainer"
              onClick={(e) => {
                e.stopPropagation();
                setOpenPlantDropDown(!openPlantDropDown);
              }}
            >
              <div>{selectedPlant?.plant?.name || 'Select Mill'}</div>
              <ArrowDropDownIcon />
            </div>
            {openPlantDropDown && (
              <div id="dropdownListForplants">
                {hookManagement?.map((eachPlant: any, index: number) => {

                  return (
                    <div
                      onClick={(e) => {handleSelectionOfPlant(e, eachPlant, index)}}
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
            <div id="dropdownForPlantsMaincontainer"
              onClick={(e)=>{
                e.stopPropagation();
                setOpenHooksDropdown(!openHooksDropdown);
              }}
            >
              <div>{selectedHook ? `Hook ${selectedHook}` : 'Select Hook'}</div>
              <ArrowDropDownIcon />
            </div>
            {openHooksDropdown && (
              <div id="dropdownListForHooks">
                {selectedPlant?.hooksRecords.map((eachhook: any, index: number)=>{
                  return(
                    <div key={index} className="dropdownListForPlantsEachItem" onClick={(e)=>{handleAssignHooksToSelectedHook(e, eachhook, index)}} >Hook {eachhook.hookNumber}</div>
                  );
                })}
                <div id='addButtonContainerForHooks'>
                  <div id='addButtonForHooks' onClick={(e)=>{e.stopPropagation(); addNewHooksToSelectedPlant();}}>ADD</div>
                </div>
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
                //   style={{
                //     opacity: wagons.is_sick ? 0.4 : 1,
                //     cursor: wagons.is_sick ? "not-allowed" : "pointer",
                //   }}
              >
                <div
                  className="wagonsAssignToMillImageSelectorConatainer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!wagons.is_sick) {
                      assignHooksToSelectedWagon(e, wagons, index);
                    }
                  }}
                  // style={{
                  //   cursor: wagons.is_sick ? "not-allowed" : "pointer",
                  // }}
                >
                  {wagons?.hook_no && (
                      <div
                        className="wagonsAssigntoMillCheckedIcon"
                        style={{
                          backgroundColor: wagons?.hook_no === selectedHook?'black':'lightgrey',
                          color:'white',
                          fontSize:'10px',
                          display:'flex',
                          justifyContent:'center',
                          alignItems:'center'
                        }}
                      >
                        {/* <CheckRoundedIcon
                          style={{
                            color: "white",
                            height: "100%",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        /> */}
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

        <div onClick={handleAssignHooks}>Submiot</div>
      </div>
      <SideDrawer />
    </div>
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

function arePlantRecordsEqual(arr1: any[], arr2: any[]): boolean {
  // Check if arrays have the same length
  if (arr1.length !== arr2.length) {
      return false;
  }

  // Compare each object in the array
  for (let i = 0; i < arr1.length; i++) {
      const record1 = arr1[i];
      const record2 = arr2[i];

      // Compare plant objects
      if (record1.plant._id !== record2.plant._id ||
          record1.plant.name !== record2.plant.name ||
          record1.plant.shipper !== record2.plant.shipper) {
          return false;
      }

      // Compare other properties
      if (record1.count !== record2.count || record1.hooks_assigned !== record2.hooks_assigned) {
          return false;
      }

      // Compare hooksRecords (assuming order matters)
      if (record1.hooksRecords.length !== record2.hooksRecords.length) {
          return false;
      }

      for (let j = 0; j < record1.hooksRecords.length; j++) {
          if (record1.hooksRecords[j].hookNumber !== record2.hooksRecords[j].hookNumber) {
              return false;
          }
          if (record1.hooksRecords[j].wagonsList.length !== record2.hooksRecords[j].wagonsList.length) {
              return false;
          }
          // Further comparison for wagonsList can be done here if needed
      }
  }

  return true;
}
