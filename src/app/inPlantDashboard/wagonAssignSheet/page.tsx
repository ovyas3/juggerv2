"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { httpsPost, httpsGet } from "@/utils/Communication";
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
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./style.css";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header/header";
import SideDrawer from "@/components/Drawer/Drawer";
import { Suspense } from "react";
import { ThreeCircles } from "react-loader-spinner";
import Loader from "@/components/Loading/WithBackDrop";

function WagonAssignSheet() {
  return (
    <Suspense fallback={<Loader />}>
      <WagonAssignSheetContent />
    </Suspense>
  );
}
export default WagonAssignSheet;

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

function WagonAssignSheetContent() {
  const showMessage = useSnackbar();
  const text = useTranslations("WAGONTALLYSHEET");
  const [originalWagonDetails, setOriginalWagonDetails] = useState<any>([]);
  const [wagonsNewData, setWagonsNewData] = useState<any>([]);
  const [plants, setPlants] = useState<any>([]);
  const [SelectedPlant, setSelectedPlant] = useState<any>({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("shipmentId");
  const [shipmentData, setShipmentData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const wagonDetails = async () => {
    try {
      setLoading(true);
      const response = await httpsGet(`get_wagon_details_by_shipment?id=${id}`, 0, router);
      setOriginalWagonDetails(response?.wagonData);
      setShipmentData(response?.shipmentData);
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const plantDetails = async () => {
    try {
      setLoading(true);
      const response = await httpsGet(`shipper_constants/get_mills`, 0, router);
      if (response.statusCode === 200) {
        setPlants(response?.data);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
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
    if (!SelectedPlant || Object.keys(SelectedPlant).length === 0) {
      showMessage.showMessage("Please select plant", "error");
      return;
    }
    setWagonsNewData((prevWagons: any) => {
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
    const assignedData = wagonsNewData.reduce((acc: any, item: any) => {
      const plantId = item.plant_assigned?._id;
      if (plantId) {
        let plantEntry = acc.find((entry: any) => entry.plant === plantId);
        if (!plantEntry) {
          plantEntry = {
            wagons: [],
            plant: plantId,
          };
          // if (item.plant_assigned) {
          //   plantEntry.plant_code =
          //     item?.plant_assigned?.location?.reference ||
          //     item?.plant_code ||
          //     "NA";
          // }
          acc.push(plantEntry);
        }
        plantEntry.wagons.push(item._id);
      }
      return acc;
    }, []);

    payload = {
      shipment: id,
      assigned_data: assignedData,
      wagon_order: wagonsNewData.map((item: any, index: number) => ({
        _id: item._id,
        order_no: index + 1,
      })),
    };
    try {
      setLoading(true);
      const response = await httpsPost("assign_wagon_to_plant", payload, router);
      if (response.statusCode === 200) {
        wagonDetails();
        showMessage.showMessage("Assigned successfully", "success");
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
    plantDetails();
  }, []);

  useEffect(() => {
    setWagonsNewData(originalWagonDetails);
  }, [originalWagonDetails]);

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;
    const updatedItems = Array.from(wagonsNewData);
    const [movedItem] = updatedItems.splice(result.source.index, 1);
    updatedItems.splice(result.destination.index, 0, movedItem);
    setWagonsNewData(updatedItems);
  };

  const millColors = ["#3351FF", "#0A2540", "#18BE8A", "#6600FF", "#F57600",  "#FFCB47"];

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
    <div className="wagon-wrapper">
      <Header title={text("in-plant-Dashboard")} isMapHelper={false} />

      <div id="inside-content-assign-wagon">
        <div id="search-container-assign-wagon">
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              router.push("/inPlantDashboard");
            }}
          >
            <ArrowBackIcon />
          </div>
          <h3 className="search-container-assign-title">{text("assignWagonSheet")}</h3>
          <div></div>
        </div>

        <div className="shipment-details-container">
        <div id="status-for-assign-sheet-wagon">
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

        <div style={{ marginTop: "16px" }}>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="items" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="train-shipment-container"
                >
                  {wagonsNewData.map((wagon: any, index: any) => (
                    <Draggable
                      key={wagon._id}
                      draggableId={wagon._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            alignContent: "end",
                            fontSize: 10,
                            position: "relative",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div id="wagon-no-assign-container">{wagon.w_no}</div>
                          {wagon.plant_assigned && (
                            <div id="wagon-plant-name-assign-container">
                              {wagon.plant_assigned?.name}
                            </div>
                          )}
                          <div style={{ display: "flex" }}>
                            <div
                              style={{
                                width: wagonImage(wagon.wagon_type.name)
                                  .imageWidth,
                                height: wagonImage(wagon.wagon_type.name)
                                  .imageHeight,
                              }}
                            >
                              <Image
                                src={
                                  wagonImage(wagon.wagon_type.name).image.src
                                }
                                alt=""
                                width={
                                  wagonImage(wagon.wagon_type.name).imageWidth
                                }
                                height={
                                  wagonImage(wagon.wagon_type.name).imageHeight
                                }
                              />
                            </div>
                            <div id="connecting-chain">
                              <div>
                                <Image
                                  src={chain01.src}
                                  alt="chain01"
                                  height={5}
                                  width={4}
                                />
                              </div>
                              <div>
                                <Image
                                  src={chain02.src}
                                  alt="chain02"
                                  height={5}
                                  width={4}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <div id="wagon-locomotion-engine">
                    <div>
                      <Image
                        src={locomotive.src}
                        alt="locomotive"
                        width={190}
                        height={48}
                        style={{ display: "block" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div id="assign-wagon-container-wagon">
          <div>
            <div className="assign-wagon-container-title">Select a mill</div>
            <div id="plantSelectorContainerWagon">
              {plants?.map((plant: any, index: any) => {
                const isSelected = plant?._id === SelectedPlant?._id;
                return (
                  <div
                    key={index}
                    id="plantMillSelectorWagon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlant(plants[index]);
                    }}
                    style={{
                      backgroundColor: millColors[index % millColors.length],
                      color: "white",
                      border: `1px solid ${millColors[index % millColors.length]}`,
                      opacity: isSelected ? 1 : 0.5,
                    }}
                  >
                    <div
                      id="plantRadioButtonWagon"
                      style={{
                        border: `1px solid ${isSelected ? "white" : ""}`
                      }}
                    >
                      <div id="plantRadioButtonInsideWagon"
                        style={{
                          backgroundColor: isSelected ? "white" : "",
                          border: isSelected ? "1px solid white" : "none",
                        }}
                      >
                      </div>
                    </div>
                    <div>
                      {plant?.name || ""}{" "}
                      <span
                        style={{
                          fontSize: 13,
                          color: "white"
                        }}
                      >
                        (
                        {wagonsNewData.filter((wagon: any) => {
                          return wagon?.plant_assigned?.name === plant?.name;
                        }).length || 0}
                        )
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div id="assign-wagon-container-box-selection-container-wagon">
            {wagonsNewData.map((wagons: any, index: number) => {
              const isAssignedToSelectedPlant = wagons?.plant_assigned?._id === SelectedPlant?._id;
              const isAssignedToOtherPlant = wagons?.plant_assigned && !isAssignedToSelectedPlant;
              const millIndex = plants.findIndex(
                (plant: any) => plant?._id === wagons?.plant_assigned?._id
              );
              return (
                <div
                  key={index}
                  className="wagonAssignToMillContainerWagon"
                  style={{
                    opacity: wagons.is_sick ? 0.4 : 1,
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="wagonsAssignToMillImageSelectorContainerWagon"
                    onClick={(e) => {
                      e.stopPropagation();
                      assignWagonsToSelectedPlant(e, wagons, index);
                      // if (!wagons.is_sick) {
                      // }
                    }}
                    style={{
                      cursor: wagons.is_sick ? "not-allowed" : "pointer",
                    }}
                  >
                    {wagons?.plant_assigned && (
                      <div
                        className="wagonsAssigntoMillCheckedIconWagon"
                        style={{
                          // backgroundColor: isAssignedToSelectedPlant
                          //   ? millColors[millIndex % millColors.length]
                          //   : "#D2D2D2",
                            backgroundColor: millColors[millIndex % millColors.length],
                            cursor: isAssignedToOtherPlant || wagons.is_sick ? "not-allowed" : "pointer",
                            opacity: isAssignedToOtherPlant ? 0.3 : 1,
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
                    <div className="wagonsAssignToMillImageSelectorWagon">
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
                  <div id="wagonsAssignToMillTextAreaWagon">
                    <header id="wagonsAssignToMillAssignedPlantNameWagon">
                      {wagons?.plant_assigned?.name || ""}
                    </header>
                    <header id="wagonsAssignToMillNumberWagon">
                      {wagons?.w_no || ""}
                    </header>
                    <header id="wagonsAssignToMilltypeWagon">
                      {wagons?.wagon_type?.name || ""}
                    </header>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div id="buttonContainerWagon">
          <div id="wagons-assign-notassigned-wagon">
            <div className="wagons-assign-not-assigned-content">
              <p className="wagons-assign-not-assigned-content-header">
                {text("assignedWagons")}
              </p>
              <p className="wagons-assign-not-assigned-content-value">
                {wagonsNewData?.filter((wagons: any) => wagons.plant_assigned)
                  .length || 0}
              </p>
            </div>
            <div className="wagons-assign-not-assigned-content">
              <p className="wagons-assign-not-assigned-content-header">
                {text("notAssignedWagons")}
              </p>
              <p className="wagons-assign-not-assigned-content-value">
                {wagonsNewData.filter((wagons: any) => !wagons.plant_assigned)
                  .length || 0}
              </p>
            </div>
            <div className="wagons-assign-not-assigned-content">
              <p className="wagons-assign-not-assigned-content-header">
                {text("sickWagons")}
              </p>
              <p className="wagons-assign-not-assigned-value">
                {wagonsNewData.filter((wagons: any) => wagons.is_sick).length ||
                  0}
              </p>
            </div>
          </div>
          <Button
            className="buttonMarkPlacement"
            onClick={(e: any) => {
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
      </div>

      <SideDrawer />
    </div>
  );
}
