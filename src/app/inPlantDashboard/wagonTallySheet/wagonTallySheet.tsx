
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

const WagonIndex = styled('div') <{ isSelected: boolean }>`
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
  left: 42px;
  transform: translateX(-50%);
  font-family: 'Inter', sans-serif;
  color: #3C4852;
  font-size: 8px;
  font-weight: 400;
  width: max-content;
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
  // batch_id_heat_no: string;
  batch_id: string;
  heat_no: string;
  material: string;
  code: string;
  grade: string;
  width: string;
  thick: string;
  length: string;
  size_or_diameter: string;
  pieces: string;
  line_item: string;
  pgi_tw_wrt: string;
  actual_weight: string;
  material_images: (any)[];
};

type FormValueKey = 'batch_id' | 'heat_no' | 'material' | 'code' | 'grade' | 'width' | 'thick' | 'length' | 'size_or_diameter' | 'pieces' | 'line_item' | 'pgi_tw_wrt' | 'actual_weight';

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
  const [wagonCapturedImages, setWagonCapturedImages] = useState<(any)[]>([]);
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
  const [wagonCount, setWagonCount] = useState(0);
  const [materialCount, setMaterialCount] = useState(0);
  const [formValues, setFormValues] = useState<FormValues[]>([
    {
      // batch_id_heat_no: '',
      batch_id: '',
      heat_no: '',
      material: '',
      code: '',
      grade: '',
      width: '',
      thick: '',
      length: '',
      size_or_diameter: '',
      pieces: '',
      line_item: '',
      pgi_tw_wrt: '',
      actual_weight: '',
      material_images: [],
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [totalWeights, setTotalWeights] = useState(0);
  const [remainingWeights, setRemainingWeights] = useState(0);

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
      newFormValues[index][name] = value;
      return newFormValues;
    });
  };

  const handleWeights = (index: number, event: React.FormEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.currentTarget.value) || 0; 

    // Calculate totalWeights
    const totalWeight = formValues.reduce((sum, material, idx) => {
        if (idx === index) {
            return sum + newValue; 
        }
        return sum + (parseFloat(material.pgi_tw_wrt) || 0);
    }, 0);

    setTotalWeights(totalWeight);

    // Calculate remainingWeights
    const capacity = selectedWagonDetails?.wagonObj?.capacity || 0; 
    setRemainingWeights(capacity - totalWeight);
};

  // Function to handle data with batch id and heat no
  const handleDataWithBatchAndHeatNo = async (index: number, isHeatNoFetch: boolean) => {
    const batchId = formValues[index].batch_id;
    const heatNo = formValues[index].heat_no;

    // if(!isHeatNoFetch){
    //   if (!batchId || batchId.length !== 10) {
    //     showMessage("Please enter valid Batch ID", "error");
    //     return;
    //   };
    // } 

    const payload = {
      batch_id: batchId,
      plant: selectedPlant?.plant?._id,
      heat_no: heatNo,
      is_heat_no_fetch: isHeatNoFetch
    };

    try {
      setLoading(true);
      const response = await httpsPost('get_material_details',  payload, router, 0, false);
      let data = response?.data;
      if (data) {
        setFormValues(prev => {
          const newFormValues = [...prev];
          newFormValues[index] = {
            ...newFormValues[index],
            material: data.material,
            code: data.material_code,
            grade: data.grade,
            width: data.width,
            thick: data.thickness,
            length: data.length,
            size_or_diameter: data.size_or_diameter,
            pieces: data.pieces !== undefined ? data.pieces : newFormValues[index].pieces,
            line_item: data.line_item !== undefined ? data.line_item : newFormValues[index].line_item,
            pgi_tw_wrt: data.pgi_tw_wrt !== undefined ? data.pgi_tw_wrt : newFormValues[index].pgi_tw_wrt,
            actual_weight: data.actual_weight !== undefined ? data.actual_weight : newFormValues[index].actual_weight,
          };
          return newFormValues;
        });
      } 
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Function to handle add and remove material details
  const handleAdd = () => {
    setFormValues([...formValues,
    {
      // batch_id_heat_no: '',
      batch_id: '',
      heat_no: '',
      material: '',
      code: '',
      grade: '',
      width: '',
      thick: '',
      length: '',
      size_or_diameter: '',
      pieces: '',
      line_item: '',
      pgi_tw_wrt: '',
      actual_weight: '',
      material_images: [],
    }
    ]);
  };

  const handleRemove = (index: number) => {
    setFormValues(formValues.filter((_, i) => i !== index));
  };

  // Function to handle confirm of wagon and material photos
  const handleGettingS3PathWagon = async (images: (string | null)[]) => {
    let image: any = images[0];
    let wagonNumber = selectedWagonDetails?.wagonNumber || '';

    if (image && !image.startsWith('data:image/jpeg;base64,')) {
      image = `data:image/jpeg;base64,${image}`;
    }
    const byteString = atob(image.split(',')[1]);
    const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const formData = new FormData();
    const uniqueFileName = `${wagonNumber}_${wagonCount}.jpg`;
    formData.append('file', blob, uniqueFileName);
    const FNR = shipmentData?.fnr_no || '';
    let s3Path = '';

    try {
      setLoading(true);
      if (FNR && wagonNumber) {
        const response = await httpsPost(`upload_wagon_tally_image?fnr_no=${FNR}`, formData, router, 0, true);
        if (response && response?.s3Path) {
          showMessage("Image uploaded successfully", "success");
          setWagonCount(wagonCount + 1);
          s3Path = response?.s3Path;
          return s3Path;
        } else {
          showMessage("Failed to upload image", "error");
          return '';
        }
      } else {
        showMessage("Failed to upload image", "error");
        return '';
      }
    } catch (error) {
      showMessage("Failed to upload image", "error");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWagonConfirm = async (images: (string | null)[]) => {
    const s3Path = await handleGettingS3PathWagon(images);
    if (s3Path) {
      setWagonCapturedImages([...wagonCapturedImages, s3Path]);
      console.log(wagonCapturedImages);
    }
  };

  const handleGettingS3PathMaterial = async (images: (string | null)[]) => {
    let image: any = images[0];
    let plantId = selectedPlant?.plant?._id || '';
    let selectedHookNo = selectedHook || '';

    if (image && !image.startsWith('data:image/jpeg;base64,')) {
      image = `data:image/jpeg;base64,${image}`;
    }
    const byteString = atob(image.split(',')[1]);
    const mimeString = image.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const formData = new FormData();
    const uniqueFileName = `${plantId}_${selectedHookNo}_${materialCount}.jpg`;
    formData.append('file', blob, uniqueFileName);
    const FNR = shipmentData?.fnr_no || '';
    let s3Path = '';

    try {
      setLoading(true);
      if (FNR && plantId && selectedHookNo) {
        const response = await httpsPost(`upload_wagon_tally_image?fnr_no=${FNR}`, formData, router, 0, true);
        if (response && response?.s3Path) {
          showMessage("Image uploaded successfully", "success");
          setMaterialCount(materialCount + 1);
          s3Path = response?.s3Path;
          return s3Path;
        } else {
          showMessage("Failed to upload image", "error");
          return '';
        }
      } else {
        showMessage("Failed to upload image", "error");
        return '';
      }
    } catch (error) {
      showMessage("Failed to upload image", "error");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialConfirm = async (index: number, images: (string | null)[]) => {
    const s3Path: any = await handleGettingS3PathMaterial(images);
    setFormValues(prev => {
      const newFormValues = [...prev];
      newFormValues[index].material_images = [...newFormValues[index].material_images, s3Path];
      return newFormValues;
    });
    console.log(formValues);
  };

  const handleDeletePhotos = async (s3Path: string) => {
    try {
      setLoading(true);
      if (s3Path) {
        const payload = { s3Path };
        const res = await httpsPost('wagon_tally/delete_image', payload, router, 0, false);
        if (res.statusCode === 200) {
          showMessage("Image deleted successfully", "success");
          return true;
        } else {
          showMessage("Failed to delete image", "error");
          return false;
        }
      } else {
        showMessage("Failed to delete image", "error");
        return false;
      }
    } catch (error) {
      showMessage("Failed to delete image", "error");
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleWagonPhotoDelete = async (indexNum: number) => {
    let s3Path = wagonCapturedImages[indexNum];
    s3Path = String(s3Path);
    const isDeleted = await handleDeletePhotos(s3Path);
    if (isDeleted) {
      const updatedImages = wagonCapturedImages.filter((_, index) => index !== indexNum);
      setWagonCapturedImages(updatedImages);
    } else {
      showMessage("Failed to delete image", "error");
    }
  }

  const handleMaterialPhotoDelete = async (formIndex: number, imageIndex: number) => {
    let s3Path = formValues[formIndex].material_images[imageIndex];
    const isDeleted = await handleDeletePhotos(s3Path);
    if (isDeleted) {
      const updatedFormValues = [...formValues];
      updatedFormValues[formIndex].material_images = updatedFormValues[formIndex].material_images.filter((_, idx) => idx !== imageIndex);
      setFormValues(updatedFormValues);
    } else {
      showMessage("Failed to delete image", "error");
    }
  };

  // Function to handle confirm of wagon and material photos
  const handleClear = () => {
    setFormValues([
      {
        // batch_id_heat_no: '',
        batch_id: '',
        heat_no: '',
        material: '',
        code: '',
        grade: '',
        width: '',
        thick: '',
        length: '',
        size_or_diameter: '',
        pieces: '',
        line_item: '',
        pgi_tw_wrt: '',
        actual_weight: '',
        material_images: [],
      }
    ]);
    setDates(datesArr);
    setWagonCapturedImages([]);
    setWagonCount(0);
    setMaterialCount(0);
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
    if (allPlants && allPlants.length > 0 && allPlants[0].hooks.length > 0) {
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
      const shipmentDataObj = {
        edemand_no: response && response?.shipmentData && response?.shipmentData?.edemand_no ? response?.shipmentData?.edemand_no : '',
        indent_no: response && response?.shipmentData && response?.shipmentData?.indent_no ? response?.shipmentData?.indent_no : '',
        received_no_of_wagons: response?.wagonData && response?.wagonData?.length ? response?.wagonData?.length : 0,
        fnr_no: response && response?.shipmentData && response?.shipmentData?.FNR ? response?.shipmentData?.FNR : '',
      }
      setShipmentData(shipmentDataObj);
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
    if (selectedPlant && selectedHook) {
      getWagonDetails();
    }
  }, [selectedPlant, selectedHook]);

  useEffect(() => {
    if (selectedWagonDetails) {
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
    setWagonCount(0);
    setMaterialCount(0);
    try {
      if (id) {
        setLoading(true);
        const response = await httpsGet(`get_wagon_details?id=${id}`, 0, router);
        const { materials, events, wagon_images } = response?.data;
        if (materials && materials.length > 0) {
          setFormValues(materials);

          const wagonCounts = wagon_images.map((url: string) => {
            const match = url.match(/_(\d+)\.jpg$/);
            return match ? parseInt(match[1], 10) : 0;
          });

          const maxWagonCount = Math.max(...wagonCounts);

          const totalWeight = materials.reduce((total: number, material: any) => {
            return total + material.pgi_tw_wrt;
          }, 0);

          const validTotalWeight = isNaN(totalWeight) || !totalWeight ? 0 : totalWeight;

          const capacity = selectedWagonDetails?.wagonObj?.capacity || 0;
          const remainingWeights = capacity - validTotalWeight || 0;

          setMaterialCount(maxWagonCount);
          setTotalWeights(validTotalWeight);
          setRemainingWeights(remainingWeights);
        } else {
          setFormValues([
            {
              // batch_id_heat_no: '',
              batch_id: '',
              heat_no: '',
              material: '',
              code: '',
              grade: '',
              width: '',
              thick: '',
              length: '',
              size_or_diameter: '',
              pieces: '',
              line_item: '',
              pgi_tw_wrt: '',
              actual_weight: '',
              material_images: [],
            }
          ]);
        }

        setWagonCapturedImages(wagon_images);

        let wagonMaximumValue = 0;

        if (wagon_images && wagon_images.length > 0) {
          wagon_images.forEach((url: string) => {
            const fileName = url.split('/').pop();
            if (fileName) {
              const count = parseInt(fileName.split('_').pop()?.split('.')[0] || '0', 10);
              if (count > wagonMaximumValue) {
                wagonMaximumValue = count;
              }
            }
          });
        }

        setWagonCount(wagonMaximumValue);
        const datesArr: any = dates.map(date => {
          const event = events.find((event: any) => event.event_code === date.event_code);
          return {
            ...date,
            event_timestamp: event?.event_timestamp || null,
          };
        });
        setDates(datesArr);
      } else {
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
    if (selectedWagonDetails && selectedWagonDetails?._id && !isSick) {
      setLoading(true);
      const formValuesMaterials = formValues.map((material: any) => {
        return {
          batch_id: material.batch_id || '',
          heat_no: material.heat_no || '',
          material: material.material || '',
          code: material.code || '',
          grade: material.grade || '',
          width: Number(material.width) || 0,
          thick: Number(material.thick) || 0,
          length: Number(material.length) || 0,
          size_or_diameter: Number(material.size_or_diameter) || 0,
          pieces: Number(material.pieces) || 0,
          line_item: material.line_item || '',
          pgi_tw_wrt: Number(material.pgi_tw_wrt) || 0,
          actual_weight: Number(material.actual_weight) || 0,
          material_images: material.material_images || [],
        };
      });
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

  return (
    <div className="wagon-tally-container">
      {loading && <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', position: 'absolute', width: '100vw', background: 'white', zIndex: 100, opacity: 0.5 }}>
        <ThreeCircles
          visible={true}
          height="100"
          width="100"
          color="#20114d"
          ariaLabel="three-circles-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </div>}
      <Header title={text('wagonTallySheet')} isMapHelper={false} />
      <div className="wagon-tally-sheet-main">
        <div className="wagon-tally-sheet-body">
          <div className="wagon-tally-sheet-body-container">
            <div className="wagon-tally-sheet-body-header">
              <div
                className="wagon-tally-sheet-back-icon"
                onClick={() => {
                  router.push("/inPlantDashboard");
                }}
              >
                <ArrowBackIcon />
              </div>
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
              <div className="wagon-tally-sheet-search-input">
                <Image src={SearchIcon} alt="search" className="search-wagon-icon" />
                <input
                  className="search-wagon-input"
                  type="text"
                  value={searchTerm}
                  placeholder="Search by wagon number"
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="wagon-tally-sheet-body-header-contents">
                <p className="wagon-tally-sheet-body-header-contents-label">{text('totalWagons')}: </p>
                <p className="wagon-tally-sheet-body-header-contents-value">{shipmentData?.received_no_of_wagons || 0}</p>
              </div>
              <div className="wagon-tally-sheet-body-header-contents">
                <p className="wagon-tally-sheet-body-header-contents-label">{text('eDemand')}: </p>
                <p className="wagon-tally-sheet-body-header-contents-value">{shipmentData?.edemand_no || ''}</p>
              </div>
              <div className="wagon-tally-sheet-body-header-contents">
                <p className="wagon-tally-sheet-body-header-contents-label">{text('IndentNo')}: </p>
                <p className="wagon-tally-sheet-body-header-contents-value">{shipmentData?.indent_no || ''}</p>
              </div>
            </div>
          </div>
          <div className="wagon-tally-sheet-body-content">
            {selectedTab === 0 &&
              <>
                <div className="wagon-tally-sheet-body-content-train" id="train">
                  <TrainContainer id="train">
                    <Image src={TrainImage} alt="Train engine" style={{ borderBottom: '1px solid #D0D1D3', marginRight: '-12px' }} />
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
                        <p className="wagon-tally-sheet-body-content-wagon-details-content-value" style={{
                          fontSize: '20px'
                        }}>{selectedWagonDetails?.wagonNumber || 'N/A'}</p>
                      </div>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content">
                        <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{text('wagonType')}</p>
                        <p className="wagon-tally-sheet-body-content-wagon-details-content-value" style={{
                          fontSize: '20px'
                        }}>{selectedWagonDetails?.wagonType || selectedWagonDetails?.wagonObj?.name || 'N/A'}</p>
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
                        <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{text('sumOfLoad')}</p>
                        <p className="wagon-tally-sheet-body-content-wagon-details-content-value"
                          style={{ color: '#3351FF' }}
                        >{totalWeights || 0} MT</p>
                      </div>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content">
                        <p className="wagon-tally-sheet-body-content-wagon-details-content-label">{text('remainingLoad')}</p>
                        <p className="wagon-tally-sheet-body-content-wagon-details-content-value" 
                          style={{ color: 'red' }}
                        >{remainingWeights || 0} MT</p>
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
                              style={{ cursor: 'pointer' }}
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
                              style={{ cursor: 'pointer' }}
                              checked={isSick === false}
                              onChange={() => setIsSick(false)}
                            />
                            <label htmlFor="no" className="wagon-tally-sheet-body-content-wagon-details-content-radio-label">{text('no')}</label>
                          </div>
                        </div>
                      </div>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content" onClick={handleWagonOpen} style={{ cursor: 'pointer' }}>
                        {wagonCapturedImages && wagonCapturedImages.length > 0 && (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Image src={wagonCapturedImages[wagonCapturedImages.length - 1] || ''} alt="Captured Image" width={48} height={36} style={{ borderRadius: '6px' }} />
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
                </div>
                <div className="wagon-tally-sheet-body-content-materials-details">
                  <div className="wagon-tally-sheet-body-content-materials-details-header">
                    <h3 className="wagon-tally-sheet-body-content-materials-details-header-title">{text('addMaterialDetais')}</h3>
                  </div>
                  <div className="wagon-tally-sheet-body-content-materials-details-body-container">
                    {formValues.map((formValue, index) =>
                      <div key={index} className="wagon-tally-sheet-body-content-materials-details-body">
                        {/* Material */}
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                          <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('material')}</p>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                            <input
                              type="text"
                              placeholder=""
                              className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                              name="material"
                              value={formValue.material}
                              onChange={(event) => handleInputChange(index, event)} />
                          </div>
                        </div>
                        {/* Heat No */}
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                          <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('heatNo')}</p>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                            <input
                              type="text"
                              placeholder=""
                              className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                              name="heat_no"
                              value={formValue.heat_no}
                              onChange={(event) => handleInputChange(index, event)} />
                            <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-icon" onClick={() => {
                              handleDataWithBatchAndHeatNo(index, true);
                            }}>
                              <Image src={ArrowRight} alt="Arrow right" className="arrow-right-icon" />
                            </div>
                          </div>
                        </div>
                        {/* Batch ID */}
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                          <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('batchID')}</p>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                            <input
                              type="text"
                              placeholder=""
                              className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                              name="batch_id"
                              // value={formValue.batch_id_heat_no}
                              value={formValue.batch_id}
                              onChange={(event) => handleInputChange(index, event)} />
                            <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-icon" onClick={() => {
                              handleDataWithBatchAndHeatNo(index, false);
                            }}>
                              <Image src={ArrowRight} alt="Arrow right" className="arrow-right-icon" />
                            </div>
                          </div>
                        </div>
                        {/* Thickness */}
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                          <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('thick')}</p>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                            <input
                              type="text"
                              placeholder=""
                              className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                              name="thick"
                              value={formValue.thick}
                              onChange={(event) => handleInputChange(index, event)} />
                            <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                              {text('mm')}
                            </div>
                          </div>
                        </div>
                        {/* Width */}
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                          <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('width')}</p>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                            <input
                              type="text"
                              placeholder=""
                              className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                              name="width"
                              value={formValue.width}
                              onChange={(event) => handleInputChange(index, event)} />
                          </div>
                        </div>
                        {/* Length */}
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                          <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('length')}</p>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                            <input
                              type="text"
                              placeholder=""
                              className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                              name="length"
                              value={formValue.length}
                              onChange={(event) => handleInputChange(index, event)} />
                            <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                              {text('m')}
                            </div>
                          </div>
                        </div>
                        {/* Size / Diameter */}
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                          <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('sizeOrDiameter')}</p>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                            <input
                              type="text"
                              placeholder=""
                              className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                              name="size_or_diameter"
                              value={formValue.size_or_diameter}
                              onChange={(event) => handleInputChange(index, event)} />
                            <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                              {text('cm')}
                            </div>
                          </div>
                        </div>
                        {/* Grade */}
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                          <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">{text('materialCode')}</p>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                            <input
                              type="text"
                              placeholder=""
                              className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                              name="code"
                              value={formValue.code}
                              onChange={(event) => handleInputChange(index, event)} />
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
                              onChange={(event) => handleInputChange(index, event)} />
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
                              onChange={(event) => handleInputChange(index, event)} />
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
                              onChange={(event) => handleInputChange(index, event)} />
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
                              onChange={(event) => handleInputChange(index, event)} 
                              onInput={(event) => handleWeights(index, event)}
                            />
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
                              onChange={(event) => handleInputChange(index, event)} />
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
                              <Image src={formValue.material_images[formValue.material_images.length - 1] || ''} alt="Captured Image" width={48} height={36} style={{ borderRadius: '6px' }} />
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
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                <p style={{ textAlign: "center", fontWeight: 500, fontSize: 18 }}>
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