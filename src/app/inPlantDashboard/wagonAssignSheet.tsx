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
import chain02 from "@/assets/chain 2.png"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function WagonAssignSheet({
  shipmentForWagonSheet,
  setShowWagonSheet,
  setShowAssignWagon,
  setShipmentForWagonSheet,
}: any) {
  const showMessage = useSnackbar();
  const text = useTranslations("WAGONTALLYSHEET");
  const [originalWagonDetails, setOriginalWagonDetails] = useState<any>([]);
  const [wagonsNewData, setWagonsNewData] = useState<any>([]);
  const [plants, setPlants] = useState<any>([]);
  const [SelectedPlant, setSelectedPlant] = useState<any>({});

  const wagonDetails = async () => {
    try {
      const response = await httpsGet(
        `get_wagon_details_by_shipment?id=${shipmentForWagonSheet.id}`
      );
      console.log(response);
      setOriginalWagonDetails(response.wagonData);
      setPlants(response.plants);
    } catch (error) {
      console.log(error);
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
      const response = await httpsPost("assign_wagon_to_plant", payload);
      if (response.statusCode === 200) {
        wagonDetails();
        showMessage.showMessage("Assigned successfully", "success");
        // getWagonDetails();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    wagonDetails();
  }, []);

  useEffect(() => {
    setWagonsNewData(originalWagonDetails);
  }, [originalWagonDetails]);

  //useEffect hooks
  useEffect(() => {
    wagonDetails();
  }, []);

  const initialItems = [
    { id: "1", content: "Item 1" },
    { id: "2", content: "Item 2" },
    { id: "3", content: "Item 3" },
    { id: "4", content: "Item 4" },
  ];

  const [items, setItems] = useState(initialItems);

  // Handle when an item is dropped
  const handleOnDragEnd = (result: any) => {
    console.log(result);
    if (!result.destination) return;
    const updatedItems = Array.from(wagonsNewData);
    const [movedItem] = updatedItems.splice(result.source.index, 1);
    updatedItems.splice(result.destination.index, 0, movedItem);
    // setItems(updatedItems);
    setWagonsNewData(updatedItems);
  };

  console.log(wagonsNewData);

  return (
    <div className="wagon-wrapper">
      <div id="search-container-assign">
        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setShowWagonSheet(true);
            setShowAssignWagon(false);
            setShipmentForWagonSheet({});
          }}
        >
          <ArrowBackIcon />
        </div>
        <h3>{text("assignWagonSheet")}</h3>
        <div></div>
      </div>

      <div id="status-for-assign-sheet">
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
        <div>
          <header style={{ fontSize: 12, color: "#42454E", marginBottom: 8 }}>
            {text("receivedWagons")}
          </header>
          <text style={{ fontSize: 16, color: "#42454E", fontWeight: 600 }}>
            {shipmentForWagonSheet?.total_wagons?.received_no_of_wagons || "XX"}
          </text>
        </div>
        <div id="wagons-assign-notassigned">
          <div>
            {text("assignedWagons")}
            <span style={{ color: "#3351FF", fontWeight: 600 }}>
              (
              {wagonsNewData.filter((wagons: any) => wagons.plant_assigned)
                .length || 0}
              )
            </span>
          </div>
          <div>
            {text("notAssignedWagons")}
            <span style={{ color: "red", fontWeight: 600 }}>
              (
              {wagonsNewData.filter((wagons: any) => !wagons.plant_assigned)
                .length || 0}
              )
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop:'10px'}}>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="items" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  display: "flex",
                  paddingBlock:'16px',
                  backgroundColor:'transparent',
                  overflowX: "auto",
                  marginInline:'24px',
                }}
              >
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
                          fontSize:10,
                          position:'relative',
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div id='wagon-no-assign-container'>{wagon.w_no}</div>
                        {wagon.plant_assigned && <div id='wagon-plant-name-assign-container'>{wagon.plant_assigned?.name}</div>}
                        <div style={{ display: "flex" }}>
                          <div
                            style={{
                              width: wagonImage(wagon.wagon_type.name)
                                .imageWidth,
                              height: wagonImage(wagon.wagon_type.name)
                                .imageHeight,
                            }}
                          >
                            <Image src={wagonImage(wagon.wagon_type.name).image.src} alt='' width={wagonImage(wagon.wagon_type.name).imageWidth} height={wagonImage(wagon.wagon_type.name).imageHeight} />
                          </div>
                          <div id="connecting-chain">
                            <div><Image src={chain01.src} alt="chain01" height={5} width={4} /></div>
                            <div><Image src={chain02.src} alt="chain02" height={5} width={4}/></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div id="assign-wagon-container" >
        <div>
          <div style={{ marginTop: 8 }}>Select a mill</div>
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
                  <div>
                    {plant?.name || "XXXX"}{" "}
                    <span
                      style={{
                        fontSize: 13,
                        color:
                          plant?._id === SelectedPlant?._id
                            ? "white"
                            : "#3351FF",
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
        <div id="assign-wagon-container-box-selection" >
          {wagonsNewData.map((wagons: any, index: number) => {
            return (
              <div
                key={index}
                className="wagonAssignToMillConatiner"
                style={{
                  opacity: wagons.is_sick ? 0.4 : 1,
                  cursor: wagons.is_sick ? "not-allowed" : "pointer",
                }}
              >
                <div
                  className="wagonsAssignToMillImageSelectorConatainer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!wagons.is_sick) {
                      assignWagonsToSelectedPlant(e, wagons, index);
                    }
                  }}
                  style={{ cursor: wagons.is_sick ? "not-allowed" : "pointer" }}
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
                          wagons?.plant_assigned?._id !== SelectedPlant?._id ||
                          wagons.is_sick
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
        <div id="buttonContaioner" style={{ textAlign: "right", marginTop: 8,  }}>
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
    </div>
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
