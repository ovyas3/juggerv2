
"use client";

import React, { useState, useEffect } from "react";
import './wagonTallySheet.css';
import Header from "@/components/Header/header";
import SideDrawer from "@/components/Drawer/Drawer";
import { useTranslations } from "next-intl";
import SearchIcon from '@/assets/search_icon.svg';
import TrainImage from '@/assets/Train_engine-locomotive.png';
import BFNV from '@/assets/BFNV.png';
import BOXN from '@/assets/BOXN.png';
import service from '@/utils/timeService';
import BRN_22_9 from '@/assets/BRN_22.9.png';
import ArrowRight from '@/assets/arrow_right_rounded.svg';
import Minus from '@/assets/minus.svg';
import Plus from '@/assets/plus.svg';
import CloseButtonIcon from "@/assets/close_icon.svg";
import WagonConnector from '@/assets/wagon_connector.png';
import Delete from '@/assets/delete.svg';
import Image from "next/image";
import { styled } from '@mui/system';
import { useSnackbar } from "@/hooks/snackBar";
import CustomDateTimePicker from "./CustomDateTImePicker";
import PhotoCaptureComponent from "./CustomCamera";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { httpsGet, httpsPost } from "@/utils/Communication";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ThreeCircles } from "react-loader-spinner";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const Tab = styled('div')`
  font-family: 'Inter', sans-serif;
  color: #3C4852;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background-color: transparent;
  width: 100%;
  padding: 4px 6px;
  border: none;
  border-radius: 6px;
  display: flex;
  justify-content: center;

  &:hover {
    color: #3351FF;
  }

  &.selected {
    background-color: #3351FF;
    color: #fff;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TabsList = styled('div')`
  min-width: 130px;
  background-color: #fff;
  border: 1px solid #DFE3EB;
  padding: 5px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const WagonContainer = styled('div')`
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: flex-end;
  border-bottom: 1px solid #D0D1D3;
  gap: 6px;
  margin-right: -4.5px;
  transition: all 0.3s ease;
  border-bottom: '1px solid #D0D1D3';
  
  &:hover {
    cursor: pointer;
  }
`;

const Track = styled('div')`
  position: relative;
`;

const TrainContainer = styled('div')`
  position: relative;
  display: flex;
  align-items: flex-end;
  padding-top: 12px;
  padding-bottom: 24px;
`;

const WagonIndex = styled('div')<{ isSelected: boolean }>`
  position: absolute;
  top: 100%;
  left: 50%;
  color: ${props => props.isSelected ? '#FFFFFF' : '#71747A'};
  background-color: ${props => props.isSelected ? '#3351FF' : 'transparent'};
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  margin-top: 2px;
  padding: 4px;
  width: 22px; 
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, 0);
`;

const WagonNumber = styled('div')`
  position: absolute;
  top: -50px;
  left: 34px;
  transform: translateX(-50%);
  font-family: 'Inter', sans-serif;
  color: #3C4852;
  font-size: 8px;
  font-weight: 400;
`;

const Mill = styled('div')`
  position: absolute;
  width: 96px;
  height: 16px;
  top: -72px;
  left: 58px;
  transform: translateX(-50%);
  background-color: #3351FF1F;
  display: flex;
  justify-content: flex-start;
  padding-left: 8px;
  align-items: center;
  border-radius: 2px;
  color: #3351FF;
  font-family: 'Inter', sans-serif;
  font-size: 8px;
  font-weight: 400;

  ::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 4px;
    margin-right: 5px;
    border-radius: 50%;
    background-color: #3351FF;
  }
`;

const datesArr = [
  {
    event_name: "Loading Readiness Time",
    event_code: "WSLRT",
    hook: 1,
    event_timestamp: null
  },
  {
    event_name: "Material Loading Start Time",
    event_code: "WSLST",
    hook: 1,
    event_timestamp: null
  },
  {
    event_name: "Material Loading End Time",
    event_code: "WSLET",
    hook: 1,
    event_timestamp: null
  },
  {
    event_name: "Packing Start Time",
    event_code: "WSPST",
    hook: 1,
    event_timestamp: null
  },
  {
    event_name: "Welding & Stepping Start Time",
    event_code: "WSWST",
    hook: 1,
    event_timestamp: null
  },
  {
    event_name: "Welding & Stepping End Time",
    event_code: "WSWET",
    hook: 1,
    event_timestamp: null
  },
  {
    event_name: "Packing End Time",
    event_code: "WSPET",
    hook: 1,
    event_timestamp: null
  }
];

type Mill = {
  wagonNumber: string;
  wagonType: string;
  wagonObj: any;
  is_sick: boolean;
  _id: string;
};

type DateEvent = {
  event_name: string;
  event_code: string;
  hook: number;
  event_timestamp: Date | null | string;
};

type FormValues = {
  batch_id_heat_no: string;
  material: string;
  code: string;
  grade: string;
  width: number;
  thick: number;
  length: number;
  pieces: number;
  line_item: string;
  pgi_tw_wrt: number;
  actual_weight: number;
  material_images: (string | null)[];
};

type FormValueKey = 'batch_id_heat_no' | 'material' | 'code' | 'grade' | 'width' | 'thick' | 'length' | 'pieces' | 'line_item' | 'pgi_tw_wrt' | 'actual_weight';

type PickerKey =
  | "loadingReadinessTime"
  | "loadingStartTime"
  | "loadingEndTime"
  | "packingStartTime"
  | "weldingStartTime"
  | "weldingEndTime"
  | "packingEndTime";

const WagonTallySheet: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("shipmentId");
  const { showMessage } = useSnackbar();
  const text = useTranslations("WAGONTALLYSHEET");
  const [openWagonPhotos, setOpenWagonPhotos] = useState(false);
  const [openMaterialPhotos, setOpenMaterialPhotos] = useState(false);
  const [selectedFormIndex, setSelectedFormIndex] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedWagonNumber, setSelectedWagonNumber] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSick, setIsSick] = useState<boolean>(false);
  const [wagonCapturedImages, setWagonCapturedImages] = useState<(string | null)[]>([]);
  const [train, setTrain] = useState<Mill[] | null>(null);
  const [scrollValue, setScrollValue] = useState(0);
  const [openPlantDropDown, setOpenPlantDropDown] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [allPlants, setAllPlants] = useState<any>([]);
  const [selectedHook, setSelectedHook] = useState<any>(null);
  const [openHooksDropdown, setOpenHooksDropdown] = useState(false);
  const [shipmentData, setShipmentData] = useState<any>(null);
  const [wagonData, setWagonData] = useState<any>(null);
  const [selectedWagonDetails, setSelectedWagonDetails] = useState<any>(null);
  const [openClearDialog, setOpenClearDialog] = useState(false);  
  const [formValues, setFormValues] = useState<FormValues[]>([
    {
      batch_id_heat_no: '',
      material: '',
      code: '',
      grade: '',
      width: 0,
      thick: 0,
      length: 0,
      pieces: 0,
      line_item: '',
      pgi_tw_wrt: 0,
      actual_weight: 0,  
      material_images: [],
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Initial state for dates
  const [dates, setDates] = useState<DateEvent[]>(datesArr);

  // Initial state for open pickers
  const [openPickers, setOpenPickers] = useState<{ [key in PickerKey]?: boolean }>({});

  // Function to toggle open state of pickers
  const togglePicker = (eventCode: PickerKey) => {
    setOpenPickers((prev) => ({
      ...prev,
      [eventCode]: !prev[eventCode],
    }));
  };
  
  // Function to handle date change
  const handleDateChange = (eventCode: string, newDate: Date) => {
    setDates((prevDates: DateEvent[]) =>
      prevDates.map((date) =>
        date.event_code === eventCode
          ? { ...date, event_timestamp: service.convertToISO(newDate) }
          : date
      )
    );
  };

  const handleWagonClick = (index: number, wagon: any) => {
    setSelectedWagonNumber(index);
    setSelectedWagonDetails(wagon);
  };


  // Function to handle input change in form (Material Details)
  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as FormValueKey;
    const value = event.target.value;
  
    setFormValues(prev => {
      const newFormValues = [...prev];
      if (name === 'width' || name === 'thick' || name === 'length' || name === 'pieces' || name === 'pgi_tw_wrt' || name === 'actual_weight') {
        newFormValues[index][name] = parseFloat(value) as any;
      } else {
        newFormValues[index][name] = value;
      }
      return newFormValues;
    });
  };

  // Function to handle data with batch id
  const handleDataWithBatchId = (index: number) => {
    setFormValues(prev => {
      const newFormValues = [...prev];
      newFormValues[index] = {
        batch_id_heat_no: 'F4373007B0',
        material: 'Plate',
        code: 'PA_JAMA45TM01',
        grade: 'AIS2062 E450BR',
        width: 16,
        thick: 2370,
        length: 12,
        pieces: 1,
        line_item: '100',
        pgi_tw_wrt: 3.57,
        actual_weight: 4,
        material_images: [],
      };
      return newFormValues;
    });
  }

  // Function to handle add and remove material details
  const handleAdd = () => {
    setFormValues([...formValues, 
      {
        batch_id_heat_no: '',
        material: '',
        code: '',
        grade: '',
        width: 0,
        thick: 0,
        length: 0,
        pieces: 0,
        line_item: '',
        pgi_tw_wrt: 0,
        actual_weight: 0, 
        material_images: [], 
      }
    ]);
  };

  const handleRemove = (index: number) => {
    setFormValues(formValues.filter((_, i) => i !== index));
  };

  // Function to handle confirm of wagon and material photos
  const handleWagonConfirm = (images: (string | null)[]) => {
    setWagonCapturedImages((prevImages) => [...prevImages, ...images]);
  };

  const handleMaterialConfirm = (index: number, images: (string | null)[]) => {
    setFormValues((prevFormValues) => {
        const updatedFormValues = [...prevFormValues];
        updatedFormValues[index].material_images = [...updatedFormValues[index].material_images, ...images];
        return updatedFormValues;
    });
  };

  const handleWagonPhotoDelete = (indexNum: number) => {
    const updatedImages = wagonCapturedImages.filter((_, index) => index !== indexNum);
    setWagonCapturedImages(updatedImages);
  }

  const handleMaterialPhotoDelete = (formIndex: number, imageIndex: number) => {
    const updatedFormValues = [...formValues];
    updatedFormValues[formIndex].material_images = updatedFormValues[formIndex].material_images.filter((_, idx) => idx !== imageIndex);
    setFormValues(updatedFormValues);
  };
  
  // Function to handle confirm of wagon and material photos
  const handleClear = () => {
    setFormValues([
      {
        batch_id_heat_no: '',
        material: '',
        code: '',
        grade: '',
        width: 0,
        thick: 0,
        length: 0,
        pieces: 0,
        line_item: '',
        pgi_tw_wrt: 0,
        actual_weight: 0, 
        material_images: [], 
      }
    ]);
    setDates(datesArr);
    setWagonCapturedImages([]);
  };

  const handleWagonOpen = () => setOpenWagonPhotos(true);
  const handleWagonClose = () => setOpenWagonPhotos(false);

  const handleMaterialOpen = (index: number) => {
    setSelectedFormIndex(index); 
    setOpenMaterialPhotos(true);
  };
  
  const handleMaterialClose = () => {
    setOpenMaterialPhotos(false);
    setSelectedFormIndex(null);
  };

  const handleClearDialogOpen = () => setOpenClearDialog(true);

  const handleClearDialogClose = () => setOpenClearDialog(false);

  // GET request to fetch all plants
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

  const handleSelectionOfPlant = (e: any, plant: any, index: number) => {
    e.stopPropagation();
    setSelectedPlant(plant);
    setSelectedHook(plant.hooks[0].hook_no);
    setOpenPlantDropDown(false);
  }

  const handleSelectHook = (e: any, hook: any, index: number) => {
    e.stopPropagation();
    setSelectedHook(hook.hook_no);
    setOpenHooksDropdown(false);
  }

  useEffect(() => {
    getAssignLoadingShop();
    setSelectedWagonNumber(0);
  }, []);

  useEffect(() => {
    if(allPlants && allPlants.length > 0 && allPlants[0].hooks.length > 0) {
      setSelectedPlant(allPlants[0]);
      setSelectedHook(allPlants[0].hooks[0].hook_no);
      
    } else {
      setSelectedPlant(null);
      setSelectedHook(null);
    }
  }, [allPlants]);

  // Assigning Wagon Details nsd Wagon Data
  const getWagonDetails: any = async () => {
    try {
      setLoading(true);
      const response = await httpsGet(
        `get_wagon_details_by_shipment?id=${id}&plant=${selectedPlant?.plant?._id}&hook=${selectedHook}`, 0, router
      );
      setShipmentData(response?.shipmentData);
      setWagonData(response?.wagonData);
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const wagonDataForTrain = wagonData && wagonData.length > 0 && wagonData?.map((wagon: any) => {
    return {
      wagonNumber: wagon?.w_no || '',
      wagonType: wagon?.wagon_type?.name || '',
      wagonObj: wagon?.wagon_type,
      is_sick: wagon?.is_sick,
      _id: wagon?._id,
      };
    });
    setTrain(wagonDataForTrain);

    if (wagonDataForTrain && wagonDataForTrain.length > 0) {
      setSelectedWagonDetails(wagonDataForTrain[0]);
      setIsSick(wagonDataForTrain[0]?.is_sick);
    } else {
      setSelectedWagonDetails(null);
      setSelectedWagonDetails(null);
      setIsSick(false);
    }
  }, [wagonData]);

  useEffect(() => {
    if(selectedPlant && selectedHook) {
      getWagonDetails();
    }
  }, [selectedPlant, selectedHook]);

  useEffect(() => {
    if(selectedWagonDetails) {
      getWagonTallySheetData();
    }
  }, [selectedWagonDetails, selectedPlant, selectedHook]);

  // Function to get wagon image based on wagon type
  const getWagonImage = (type: string) => {
    switch (type) {
      case 'BFNV': return BFNV;
      case 'BOXN': return BOXN;
      case 'BRN_22_9': return BRN_22_9;
      default: return BOXN;
    }
  };

  //GET Wagon Tally sheet datas
  const getWagonTallySheetData = async () => {
    const id = selectedWagonDetails?._id || '';
    try {
      if(id) {
        setLoading(true);
        const response = await httpsGet(`get_wagon_details?id=${id}`, 0, router);
        const { materials, events, wagon_images } = response?.data;
        if(materials && materials.length > 0) {
          setFormValues(materials);
        } else {
          setFormValues([
            {
              batch_id_heat_no: '',
              material: '',
              code: '',
              grade: '',
              width: 0,
              thick: 0,
              length: 0,
              pieces: 0,
              line_item: '',
              pgi_tw_wrt: 0,
              actual_weight: 0,
              material_images: [],
            }
          ]);
        }
        setWagonCapturedImages(wagon_images);
        const datesArr: any = dates.map(date => {
          const event = events.find((event: any) => event.event_code === date.event_code);
          return {
            ...date,
            event_timestamp: event?.event_timestamp || null,
          };
        });
        setDates(datesArr);
      } else{
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const postWagonTallySheet = async () => {
    if(selectedWagonDetails && selectedWagonDetails?._id && !isSick) {
      setLoading(true);
      const filteredDates = dates.filter(
        date => date.event_timestamp);
      const payload = {
        shipment: id,
        _id: selectedWagonDetails?._id,
        wagon_images: wagonCapturedImages,
        events: filteredDates,
        materials: formValues,
        is_sick: isSick,
      }

      try {
        await httpsPost('post_wagon_details', payload, router);
        setLoading(false);
        getWagonDetails();
        getWagonTallySheetData();
        showMessage("Wagon Details Saved & Submitted Successfully", "success");
      } catch (error) {
        setLoading(false);
        showMessage("Failed to save wagon details", "error");
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      showMessage("Please fill all the details", "error");
    }
  };

  // Artifical Scrollbar
  const handleScrollbarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScrollValue(Number(event.target.value));
  };

  useEffect(() => {
    const trainElement = document.getElementById('train');
    const scrollbarElement = document.getElementById('scrollbar');

    if (trainElement && scrollbarElement) {
      const scrollbarInputElement = scrollbarElement as HTMLInputElement;

      // Update scrollbar max value based on the scrollable content width
      const updateScrollbarMax = () => {
        const maxScrollable = trainElement.scrollWidth - trainElement.clientWidth;
        scrollbarInputElement.max = String(maxScrollable);
      };

      // Set the initial scrollbar value based on train's scroll position
      const initializeScrollbar = () => {
        updateScrollbarMax();
        scrollbarInputElement.value = String(trainElement.scrollLeft); // Set initial scroll position
        const percentageCompleted = (trainElement.scrollLeft / Number(scrollbarInputElement.max)) * 100;
        scrollbarInputElement.style.setProperty('--completed-range', `${percentageCompleted}%`);
      };

      // Handle input change (scrollbar moves train)
      const handleInput = () => {
        trainElement.scrollLeft = Number(scrollbarInputElement.value);
        const percentageCompleted = (Number(scrollbarInputElement.value) / Number(scrollbarInputElement.max)) * 100;
        scrollbarInputElement.style.setProperty('--completed-range', `${percentageCompleted}%`);
      };

      // Handle train scroll (train scroll moves scrollbar)
      const handleScroll = () => {
        scrollbarInputElement.value = String(trainElement.scrollLeft);
        const percentageCompleted = (trainElement.scrollLeft / Number(scrollbarInputElement.max)) * 100;
        scrollbarInputElement.style.setProperty('--completed-range', `${percentageCompleted}%`);
      };

      // Initialize scrollbar on load
      initializeScrollbar();

      // MutationObserver to handle dynamic changes to the train content
      const observer = new MutationObserver(initializeScrollbar);
      observer.observe(trainElement, { childList: true, subtree: true });

      // Add event listeners
      scrollbarInputElement.addEventListener('input', handleInput);
      trainElement.addEventListener('scroll', handleScroll);

      // Add resize event listener to adjust scrollbar on screen resize
      window.addEventListener('resize', updateScrollbarMax);

      // Clean up listeners and observers
      return () => {
        scrollbarInputElement.removeEventListener('input', handleInput);
        trainElement.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateScrollbarMax);
        observer.disconnect();
      };
    }
  }, [train, 
      selectedTab, 
      selectedWagonDetails, 
      selectedPlant, 
      selectedHook,
      wagonCapturedImages,
      dates,
      formValues,
      isSick,
      loading
    ]);

  // Function to handle click outside dropdown
  const handleClickOutside = (e: MouseEvent) => {
    if (
      !(e.target as HTMLElement).closest('#dropdownForPlantsMaincontainerTallySheet') &&
      !(e.target as HTMLElement).closest('#dropdownListForplantsTallySheet') &&
      !(e.target as HTMLElement).closest('#dropdownListForHooksTallySheet')
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
    <div className="wagon-tally-container">
      <Header title={text('wagonTallySheet')} isMapHelper={false} />
      <div className="wagon-tally-sheet-main">
        <div className="wagon-tally-sheet-header">
          <div
            className="wagon-tally-sheet-back-icon"
            onClick={() => {
              router.push("/inPlantDashboard");
            }}
          >
            <ArrowBackIcon />
          </div>
          <div className="wagon-tally-sheet-search-input">
            <Image src={SearchIcon} alt="search" className="search-wagon-icon"/>
            <input 
              className="search-wagon-input"
              type="text" 
              value={searchTerm}
              placeholder="Search by wagon number"
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div></div>
        </div>
        <div className="wagon-tally-sheet-body">
          <div className="wagon-tally-sheet-body-header">
            <div className="wagon-tally-sheet-tabs">
              <TabsList>
                <Tab onClick={() => setSelectedTab(0)} className={selectedTab === 0 ? 'selected' : ''}>Wagon</Tab>
                <Tab onClick={() => setSelectedTab(1)} className={selectedTab === 1 ? 'selected' : ''}>Lot</Tab>
              </TabsList>
            </div>
            <div id="filtersForWagonTallySheet">
              <div id="selectAPlant-wagonTallySheet">
                <div
                  id="dropdownForPlantsMaincontainerTallySheet"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenHooksDropdown(false);
                    setOpenPlantDropDown(!openPlantDropDown);
                  }}
                >
                  <div id="mill-name">{selectedPlant?.plant?.name || "Select Mill"}</div>
                  <ArrowDropDownIcon />
                </div>
                {openPlantDropDown && (
                  <div id="dropdownListForplantsTallySheet">
                    {allPlants?.map((eachPlant: any, index: number) => {
                      return (
                        <div
                          onClick={(e) => {
                            handleSelectionOfPlant(e, eachPlant, index);
                          }}
                          key={index}
                          className="dropdownListForPlantsEachItemTallySheet"
                        >
                          {eachPlant?.plant?.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div id="hooksFilterTallySheet">
                <div
                  id="dropdownForPlantsMaincontainerTallySheet"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenPlantDropDown(false);
                    setOpenHooksDropdown(!openHooksDropdown);
                  }}
                >
                  <div id="hook-name">{selectedHook ? `Hook ${selectedHook}` : "Select Hook"}</div>
                  <ArrowDropDownIcon />
                </div>
                {openHooksDropdown && (
                  <div id="dropdownListForHooksTallySheet">
                    {selectedPlant?.hooks.map(
                      (eachhook: any, index: number) => {
                        return (
                          <div
                            key={index}
                            className="dropdownListForPlantsEachItemTallySheet"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectHook(e, eachhook, index);
                            }}
                          >
                            <div>{text('hook')} {eachhook.hook_no}</div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="wagon-tally-sheet-body-header-contents">
              <p className="wagon-tally-sheet-body-header-contents-label">{text('eDemand')}: </p>
              <p className="wagon-tally-sheet-body-header-contents-value">{shipmentData?.edemand_no || ''}</p>
            </div>
            <div className="wagon-tally-sheet-body-header-contents">
              <p className="wagon-tally-sheet-body-header-contents-label">{text('totalWagons')}: </p>
              <p className="wagon-tally-sheet-body-header-contents-value">{shipmentData?.received_no_of_wagons || 0}</p>
            </div>
          </div>
          <div className="wagon-tally-sheet-body-content">
            {selectedTab === 0 && 
            <>
              <div className="wagon-tally-sheet-body-content-train" id="train">
              <TrainContainer id="train">
                {train ? (
                  train
                    .filter(wagon => {
                      const includesSearchTerm = wagon.wagonNumber.includes(searchTerm);
                      return includesSearchTerm;
                    })
                    .map((wagon, wagonIndex) => {
                      return (
                        <WagonContainer key={wagonIndex} onClick={() => handleWagonClick(wagonIndex, wagon)}>
                          <Track>
                            <WagonNumber>{wagon.wagonNumber}</WagonNumber>
                          </Track>
                          <Image src={getWagonImage(wagon.wagonType)} alt={wagon.wagonType} />
                          {wagonIndex !== train.length - 1 && (
                            <Image src={WagonConnector} alt="Wagon connector" className="wagon-connector-icon" />
                          )}
                          <WagonIndex isSelected={wagonIndex === selectedWagonNumber}>
                            {wagonIndex + 1}
                          </WagonIndex>
                        </WagonContainer>
                      );
                    })
                ) : (
                  <></>
                )}
                <Image src={TrainImage} alt="Train engine" style={{ borderBottom: '1px solid #D0D1D3', marginLeft: '-1px' }} />
              </TrainContainer>
              </div>
              <input
                type="range"
                id="scrollbar"
                min="0"
                max="100"
                value={scrollValue}
                onChange={handleScrollbarChange}
              />
              <div className="wagon-tally-sheet-body-content-wagon-details">
                <div className="wagon-tally-sheet-body-content-wagon-details-container">
                  <div className="wagon-tally-sheet-body-content-wagon-details-contents">
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{text('wagonNo')}</p>
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-value">{selectedWagonDetails?.wagonNumber || 'N/A'}</p>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{text('wagonType')}</p>
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-value">{selectedWagonDetails?.wagonType || selectedWagonDetails?.wagonObj?.name || 'N/A'}</p>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{text('cc')}</p>
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-value">{selectedWagonDetails?.wagonObj?.capacity || 0} MT</p>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{text('tr')}</p>
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-value">{selectedWagonDetails?.wagonObj?.tare_weight || 0} MT</p>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{text('isSick')}</p>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-radio">
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-radio-content">
                        <input 
                          type="radio" 
                          id="yes" 
                          name="isSick" 
                          value="yes" 
                          style={{cursor: 'pointer'}} 
                          checked={isSick === true}
                          onChange={() => setIsSick(true)}
                        />
                        <label htmlFor="yes" className="wagon-tally-sheet-body-content-wagon-details-content-radio-label">{text('yes')}</label>
                      </div>
                      <div className="wagon-tally-sheet-body-content-wagon-details-header-content-radio-content">
                        <input 
                          type="radio" 
                          id="no" 
                          name="isSick" 
                          value="no" 
                          style={{cursor: 'pointer'}}
                          checked={isSick === false}
                          onChange={() => setIsSick(false)}
                        />
                        <label htmlFor="no" className="wagon-tally-sheet-body-content-wagon-details-content-radio-label">{text('no')}</label>
                      </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content" onClick={handleWagonOpen} style={{cursor: 'pointer'}}>
                      {wagonCapturedImages && wagonCapturedImages.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Image src={wagonCapturedImages[wagonCapturedImages.length - 1] || ''} alt="Captured Image" width={48} height={36} style={{borderRadius: '6px'}} />
                          {wagonCapturedImages.length > 1 && (
                            <div style={{
                              color: '#3351FF',
                              padding: '2px 4px',
                              paddingLeft: '8px',
                              fontSize: '12px'
                            }}>
                              +{wagonCapturedImages.length - 1}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>           
                    <PhotoCaptureComponent label="Take Photo" onConfirm={handleWagonConfirm} />
                </div>
                <div className="wagon-tally-sheet-body-content-wagon-details-container">
                  <div className="wagon-tally-sheet-body-content-wagon-details-contents-down">
                  {
                    dates && dates.length > 0 && dates.map((date: any) => (
                      <CustomDateTimePicker
                        key={date.event_code}
                        label={date.event_name}
                        value={date.event_timestamp}
                        onChange={(newDate) => handleDateChange(date.event_code, newDate!)}
                        open={openPickers[date.event_code as PickerKey] ?? false}
                        onToggle={() => togglePicker(date.event_code as PickerKey)}
                        disabled={isSick}
                      />
                    ))
                  }
                  </div>
                </div>
              </div>
              <div className="wagon-tally-sheet-body-content-materials-details">
                <div className="wagon-tally-sheet-body-content-materials-details-header">
                  <h3 className="wagon-tally-sheet-body-content-materials-details-header-title">{text('addMaterialDetais')}</h3>
                </div>
                <div className="wagon-tally-sheet-body-content-materials-details-body-container">
                {formValues.map((formValue, index) => 
                  <div key={index} className="wagon-tally-sheet-body-content-materials-details-body">
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('batchID')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="batch_id_heat_no"
                          value={formValue.batch_id_heat_no}
                          onChange={(event) => handleInputChange(index, event)}/>
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-icon" onClick={() => {
                          handleDataWithBatchId(index);
                        }}>
                          <Image src={ArrowRight} alt="Arrow right" className="arrow-right-icon" />
                        </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('material')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="material"
                          value={formValue.material}
                          onChange={(event) => handleInputChange(index, event)}/>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('materialCode')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="code"
                          value={formValue.code}
                          onChange={(event) => handleInputChange(index, event)}/>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('grade')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="grade"
                          value={formValue.grade}
                          onChange={(event) => handleInputChange(index, event)}/>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('width')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="width"
                          value={formValue.width}
                          onChange={(event) => handleInputChange(index, event)}/>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('thick')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="thick"
                          value={formValue.thick}
                          onChange={(event) => handleInputChange(index, event)}/>
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                        {text('mm')}
                        </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('length')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="length"
                          value={formValue.length}
                          onChange={(event) => handleInputChange(index, event)}/>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                          {text('m')}
                          </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('pieces')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="pieces"
                          value={formValue.pieces}
                          onChange={(event) => handleInputChange(index, event)}/>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('lineItem')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="line_item"
                          value={formValue.line_item}
                          onChange={(event) => handleInputChange(index, event)}/>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('PGIWt')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="pgi_tw_wrt"
                          value={formValue.pgi_tw_wrt}
                          onChange={(event) => handleInputChange(index, event)}/>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                          {text('MT')}
                          </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('actualWeight')}</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="actual_weight"
                          value={formValue.actual_weight}
                          onChange={(event) => handleInputChange(index, event)}/>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                          {text('MT')}
                          </div>
                      </div>
                    </div>
                    <div onClick={() => handleMaterialOpen(index)} style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingTop: '12px',
                      paddingLeft: '6px',
                      cursor: 'pointer'
                    }}>
                    {formValue.material_images && formValue.material_images.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Image src={formValue.material_images[formValue.material_images.length - 1] || ''} alt="Captured Image" width={48} height={36} style={{borderRadius: '6px'}} />
                          {formValue.material_images.length > 1 && (
                            <div style={{
                              color: '#3351FF',
                              padding: '2px 4px',
                              paddingLeft: '8px',
                              fontSize: '12px'
                            }}>
                              +{formValue.material_images.length - 1}
                            </div>
                          )}
                        </div>
                    )}
                  </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingTop: '12px',
                    }}>
                      <PhotoCaptureComponent label="Take Photo" onConfirm={(images) => handleMaterialConfirm(index, images)} />
                    </div>

                    <div className="wagon-tally-sheet-body-content-materials-details-body-content-button">
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content-button-action">
                      {index !== 0 && (
                        <Image src={Minus} alt="Minus" onClick={() => handleRemove(index)} />
                      )}
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content-button-action">
                      <Image src={Plus} alt="Plus" onClick={handleAdd} />
                    </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-button">
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </>
            }
            {selectedTab === 1 && 
            <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <h2>{text('comingSoon')}...</h2>
            </div>}
          </div>
        </div>
        <div className="wagon-tally-sheet-footer">
          <button className="wagon-tally-sheet-footer-button-clear" onClick={() => {
            handleClearDialogOpen();
          }}>{text('clear')}</button>
          <button className="wagon-tally-sheet-footer-button-save" onClick={() => {
            postWagonTallySheet();
          }}>{text('save&Submit')}</button>
        </div>
        <BootstrapDialog 
          open={openWagonPhotos} 
          onClose={handleWagonClose}
          aria-labelledby="customized-dialog-title"
          className="photos-album-dialog-styles"
        >
          <div className='photos-album-dialog-container'>
            <DialogContent>
              <div
                aria-label="close"
                onClick={handleWagonClose}
                className="photos-album-close-icon"
              >
                <Image src={CloseButtonIcon} alt="close" />
              </div>
              <div className="photos-album-dialog-header">
                {text('wagonPhotos')}
              </div>
              <div className="photos-album-dialog-albums">
                {wagonCapturedImages.map((image, index) => (
                  <div className="photos-album-dialog-album" key={index}>
                    <Image 
                      src={image || ''} 
                      alt="Captured Image" 
                      width={176} 
                      height={132} 
                      style={{ borderRadius: '6px' }} 
                    />
                    <Image 
                      src={Delete}
                      alt="Delete" 
                      width={24}
                      height={24}
                      className="delete-icon" 
                      onClick={() => handleWagonPhotoDelete(index)} 
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </div>

        </BootstrapDialog>
        <BootstrapDialog 
          open={openMaterialPhotos} 
          onClose={handleMaterialClose}
          aria-labelledby="customized-dialog-title"
          className="photos-album-dialog-styles"
        >
          <div className='photos-album-dialog-container'>
            <DialogContent>
              <div
                aria-label="close"
                onClick={handleMaterialClose}
                className="photos-album-close-icon"
              >
                <Image src={CloseButtonIcon} alt="close" />
              </div>
              <div className="photos-album-dialog-header">
                {text('materialPhotos')}
              </div>
              <div className="photos-album-dialog-albums">
                {selectedFormIndex !== null && formValues[selectedFormIndex].material_images.map((image, idx) => (
                  <div className="photos-album-dialog-album" key={idx}>
                    <Image 
                      src={image || ''} 
                      alt="Captured Image" 
                      width={176} 
                      height={132} 
                      style={{ borderRadius: '6px' }} 
                    />
                    <Image 
                      src={Delete}
                      alt="Delete" 
                      width={24}
                      height={24}
                      className="delete-icon" 
                      onClick={() => handleMaterialPhotoDelete(selectedFormIndex, idx)} // Pass selected form index and image index
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </div>
        </BootstrapDialog>
        <BootstrapDialog
        open={openClearDialog} 
        onClose={handleClearDialogClose}
        aria-labelledby="customized-dialog-title"
        className="clear-dialog-styles"
        >
          <div className='clear-dialog-container'>
          <DialogContent>
              <div
                aria-label="close"
                onClick={handleClearDialogClose}
                className="clear-close-icon"
              >
                <Image src={CloseButtonIcon} alt="close" />
              </div>
              <div className='clear-dialog-content'>
                <p style={{textAlign: "center", fontWeight: 500, fontSize: 18}}>
                  {text('clearConfirmMsg')}
                </p>
              </div>
              <div className='clear-dialog-buttons-container'>
                <div 
                  onClick={() => {
                    handleClear();
                    handleClearDialogClose();
                  }}
                  className='confirm-button'>
                   {text('confirm')}
                </div>
                <div 
                  onClick={handleClearDialogClose}
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
  )
}

export default WagonTallySheet;