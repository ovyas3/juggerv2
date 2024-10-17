
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
import BRN_22_9 from '@/assets/BRN_22.9.png';
import ArrowRight from '@/assets/arrow_right_rounded.svg';
import Camera from '@/assets/camera.svg';
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
  margin-right: -9px;
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
  top: 5px;
  left: -60px;
  color: ${props => props.isSelected ? '#FFFFFF' : '#71747A'};
  background-color: ${props => props.isSelected ? '#007BFF' : 'transparent'};
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 50%;
`;

const WagonNumber = styled('div')`
  position: absolute;
  top: -50px;
  left: 34px;
  transform: translateX(-50%);
  color: #3C4852;
  font-family: 'Plus Jakarta Sans', sans-serif;
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

const generateRandomWagonNumber = () => {
  return Math.floor(10000000000 + Math.random() * 90000000000).toString(); // Generates a 11-digit random number
};

const wagonTypes = ["BOXN", "BRN_22_9", "BFNV"];

const generateRandomWagonType = () => {
  return wagonTypes[Math.floor(Math.random() * wagonTypes.length)];
};

const generateRandomWagons = (numberOfWagons: number) => {
  const wagons = [];
  for (let i = 0; i < numberOfWagons; i++) {
    wagons.push({
      wagonNumber: generateRandomWagonNumber(),
      wagonType: generateRandomWagonType(),
    });
  }
  return wagons;
};

type Wagon = {
  wagonNumber: string;
  wagonType: string;
};

type Mill = {
  millName: string;
  millId: string;
  wagons: Wagon[];
};


const WagonTallySheet: React.FC = () => {
  const { showMessage } = useSnackbar();
  const text = useTranslations("WAGONTALLYSHEET");
  const [openWagonPhotos, setOpenWagonPhotos] = useState(false);
  const [openMaterialPhotos, setOpenMaterialPhotos] = useState(false);
  const [selectedFormIndex, setSelectedFormIndex] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedWagon, setSelectedWagon] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSick, setIsSick] = useState<Boolean>(false);
  const [wagonCapturedImages, setWagonCapturedImages] = useState<(string | null)[]>([]);
  const [materialCapturedImages, setMaterialCapturedImages] = useState<(string | null)[]>([]);
  const [train, setTrain] = useState<Mill[] | null>(null);
  const [scrollValue, setScrollValue] = useState(0);
  const [formValues, setFormValues] = useState<{ batchId: string, material: string, materialCode: string, grade: string, width: string, thick: string, length: string, pieces: string, lineItem: string, pgiWeight: string, actualWeight: string, images: (string | null)[] }[]>([
    {
      batchId: '',
      material: '',
      materialCode: '',
      grade: '',
      width: '',
      thick: '',
      length: '',
      pieces: '',
      lineItem: '',
      pgiWeight: '',
      actualWeight: '',  
      images: [],
    }
  ]);

  useEffect(() => {
    setTrain([
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
      { millName: "Plate Mill", millId: "1", wagons: generateRandomWagons(4) },
    ]);
  }, []);

  const handleScrollbarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setScrollValue(Number(event.target.value));
  };
  
  // State to store all date values separately
  const [dates, setDates] = useState({
    loadingReadinessTime: new Date(2024, 7, 24, 13, 0),
    loadingStartTime: new Date(2024, 7, 24, 17, 0),
    loadingEndTime: new Date(2024, 7, 24, 17, 0),
    packingStartTime: new Date(2024, 7, 24, 18, 0),
    weldingStartTime: new Date(2024, 7, 24, 18, 0),
    weldingEndTime: new Date(2024, 7, 24, 18, 0),
    packingEndTime: new Date(2024, 7, 24, 18, 30),
  });

  // State to manage which pickers are open
  const [openPickers, setOpenPickers] = useState({
    loadingReadinessTime: false,
    loadingStartTime: false,
    loadingEndTime: false,
    packingStartTime: false,
    weldingStartTime: false,
    weldingEndTime: false,
    packingEndTime: false,
  });

  // Type for picker keys
  type PickerKey =
    | "loadingReadinessTime"
    | "loadingStartTime"
    | "loadingEndTime"
    | "packingStartTime"
    | "weldingStartTime"
    | "weldingEndTime"
    | "packingEndTime";

  // Function to toggle open state of pickers
  const togglePicker = (pickerKey: PickerKey) => {
    setOpenPickers((prev) => ({
      ...prev,
      [pickerKey]: !prev[pickerKey],
    }));
  };

  // Function to handle date change
  const handleDateChange = (pickerKey: PickerKey, newDate: Date) => {
    setDates((prev) => ({
      ...prev,
      [pickerKey]: newDate,
    }));
  };

  const getWagonImage = (type: string) => {
    switch (type) {
      case 'BFNV': return BFNV;
      case 'BOXN': return BOXN;
      case 'BRN_22_9': return BRN_22_9;
      default: return '';
    }
  };

  const handleWagonClick = (index: number) => {
    setSelectedWagon(index);
  };

  type FormValueKey = 'batchId' | 'material' | 'materialCode' | 'grade' | 'width' | 'thick' | 'length' | 'pieces' | 'lineItem' | 'pgiWeight' | 'actualWeight';

  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as FormValueKey;
    const value = event.target.value;

    setFormValues(prev => {
      const newFormValues = [...prev];
      newFormValues[index][name] = value;
      return newFormValues;
    });
  };

  const handleDataWithBatchId = (index: number) => {
    setFormValues(prev => {
      const newFormValues = [...prev];
      newFormValues[index] = {
        batchId: 'F4373007B0',
        material: 'Plate',
        materialCode: 'PA_JAMA45TM01',
        grade: 'AIS2062 E450BR',
        width: '16',
        thick: '2370',
        length: '12',
        pieces: '1',
        lineItem: '100',
        pgiWeight: '3.57',
        actualWeight: '4',
        images: [],
      };
      return newFormValues;
    });
  }

  const handleAdd = () => {
    setFormValues([...formValues, 
      {
        batchId: '',
        material: '',
        materialCode: '',
        grade: '',
        width: '',
        thick: '',
        length: '',
        pieces: '',
        lineItem: '',
        pgiWeight: '',
        actualWeight: '', 
        images: [], 
      }
    ]);
  };

  const handleRemove = (index: number) => {
    setFormValues(formValues.filter((_, i) => i !== index));
  };

  const handleWagonConfirm = (images: (string | null)[]) => {
    setWagonCapturedImages((prevImages) => [...prevImages, ...images]);
    console.log('Captured Images:', [...wagonCapturedImages, ...images]);
  };

  const handleMaterialConfirm = (index: number, images: (string | null)[]) => {
    setFormValues((prevFormValues) => {
        const updatedFormValues = [...prevFormValues];
        updatedFormValues[index].images = [...updatedFormValues[index].images, ...images];
        return updatedFormValues;
    });
    console.log('Captured Images:', formValues[index].images);
  };

  const handleWagonPhotoDelete = (index: number) => {
    const updatedImages = wagonCapturedImages.filter((_, index) => index !== index);
    setWagonCapturedImages(updatedImages);
  }

  const handleMaterialPhotoDelete = (formIndex: number, imageIndex: number) => {
    const updatedFormValues = [...formValues];
    updatedFormValues[formIndex].images = updatedFormValues[formIndex].images.filter((_, idx) => idx !== imageIndex);
    setFormValues(updatedFormValues);
  };
  

  const handleClear = () => {
    setFormValues([
      {
        batchId: '',
        material: '',
        materialCode: '',
        grade: '',
        width: '',
        thick: '',
        length: '',
        pieces: '',
        lineItem: '',
        pgiWeight: '',
        actualWeight: '',  
        images: [],
      }
    ]);
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
  }, [train]);

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

  return (
    <div className="wagon-tally-container">
      <Header title={text('wagonTallySheet')} isMapHelper={false} />
      <div className="wagon-tally-sheet-main">
        <div className="wagon-tally-sheet-header">
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
        </div>
        <div className="wagon-tally-sheet-body">
          <div className="wagon-tally-sheet-body-header">
            <div className="wagon-tally-sheet-tabs">
              <TabsList>
                <Tab onClick={() => setSelectedTab(0)} className={selectedTab === 0 ? 'selected' : ''}>Wagon</Tab>
                <Tab onClick={() => setSelectedTab(1)} className={selectedTab === 1 ? 'selected' : ''}>Lot</Tab>
              </TabsList>
            </div>
            <div className="wagon-tally-sheet-body-header-contents">
              <p className="wagon-tally-sheet-body-header-contents-label">e-Demand: </p>
              <p className="wagon-tally-sheet-body-header-contents-value">RJKN190820242</p>
            </div>
            <div className="wagon-tally-sheet-body-header-contents">
              <p className="wagon-tally-sheet-body-header-contents-label">Total Wagons: </p>
              <p className="wagon-tally-sheet-body-header-contents-value">44</p>
            </div>
          </div>
          <div className="wagon-tally-sheet-body-content">
            {selectedTab === 0 && 
            <>
              <div className="wagon-tally-sheet-body-content-train" id="train">
              <TrainContainer id="train">
                {train ? train.flatMap((mill, millIndex, millArray) => (
                  mill.wagons
                    .filter(wagon => wagon.wagonNumber.includes(searchTerm))
                    .map((wagon, wagonIndex) => {
                      const globalWagonIndex = millArray.slice(0, millIndex).reduce((sum, currMill) => sum + currMill.wagons.length, 0) + wagonIndex;
                      const totalWagons = millArray.reduce((sum, currMill) => sum + currMill.wagons.length, 0);           
                      return (
                        <WagonContainer key={globalWagonIndex} onClick={() => handleWagonClick(globalWagonIndex)}>
                          <Track>
                            <WagonNumber>{wagon.wagonNumber}</WagonNumber>
                          </Track>
                          <Image src={getWagonImage(wagon.wagonType)} alt={wagon.wagonType} />
                          {globalWagonIndex !== totalWagons - 1 && <Image src={WagonConnector} alt="Wagon connector" className="wagon-connector-icon" />}
                          <Track>
                            <WagonIndex isSelected={globalWagonIndex === selectedWagon}>{globalWagonIndex + 1}</WagonIndex>
                          </Track>
                        </WagonContainer>
                      )
                    })
                )) : <div>
                  {/* Loading... */}
                    </div>}
                <Image src={TrainImage} alt="Train engine" style={{borderBottom: '1px solid #D0D1D3', marginLeft: '-1px'}} />
              </TrainContainer>
              </div>
              <input
                type="range"
                id="scrollbar"
                min="0"
                max="100"
                value={scrollValue}
                onChange={handleScrollbarChange} // Attach the onChange handler here
              />
              <div className="wagon-tally-sheet-body-content-wagon-details">
                <div className="wagon-tally-sheet-body-content-wagon-details-container">
                  <div className="wagon-tally-sheet-body-content-wagon-details-contents">
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Wagon No. </p>
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-value">JSPL11121</p>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Wagon Type </p>
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-value">BOXN</p>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">CC </p>
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-value">66.8 MT</p>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">TR </p>
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-value">23.3 MT</p>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Is the Wagon Sick? </p>
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
                        <label htmlFor="yes" className="wagon-tally-sheet-body-content-wagon-details-content-radio-label">Yes</label>
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
                        <label htmlFor="no" className="wagon-tally-sheet-body-content-wagon-details-content-radio-label">No</label>
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
                    <CustomDateTimePicker
                      label="Loading Readiness Time"
                      value={dates.loadingReadinessTime}
                      onChange={(newDate) => handleDateChange("loadingReadinessTime", newDate!)}
                      open={openPickers.loadingReadinessTime}
                      onToggle={() => togglePicker("loadingReadinessTime")}
                    />
                    <CustomDateTimePicker
                      label="Material Loading Start Time"
                      value={dates.loadingStartTime}
                      onChange={(newDate) => handleDateChange("loadingStartTime", newDate!)}
                      open={openPickers.loadingStartTime}
                      onToggle={() => togglePicker("loadingStartTime")}
                    />
                    <CustomDateTimePicker
                      label="Material Loading End Time"
                      value={dates.loadingEndTime}
                      onChange={(newDate) => handleDateChange("loadingEndTime", newDate!)}
                      open={openPickers.loadingEndTime}
                      onToggle={() => togglePicker("loadingEndTime")}
                    />
                    <CustomDateTimePicker
                      label="Packing Start Time"
                      value={dates.packingStartTime}
                      onChange={(newDate) => handleDateChange("packingStartTime", newDate!)}
                      open={openPickers.packingStartTime}
                      onToggle={() => togglePicker("packingStartTime")}
                    />
                    <CustomDateTimePicker
                      label="Welding & Stepping Start Time"
                      value={dates.weldingStartTime}
                      onChange={(newDate) => handleDateChange("weldingStartTime", newDate!)}
                      open={openPickers.weldingStartTime}
                      onToggle={() => togglePicker("weldingStartTime")}
                    />
                    <CustomDateTimePicker
                      label="Welding & Stepping End Time"
                      value={dates.weldingEndTime}
                      onChange={(newDate) => handleDateChange("weldingEndTime", newDate!)}
                      open={openPickers.weldingEndTime}
                      onToggle={() => togglePicker("weldingEndTime")}
                    />
                    <CustomDateTimePicker
                      label="Packing End Time"
                      value={dates.packingEndTime}
                      onChange={(newDate) => handleDateChange("packingEndTime", newDate!)}
                      open={openPickers.packingEndTime}
                      onToggle={() => togglePicker("packingEndTime")}
                    />
                  </div>
                </div>
              </div>
              <div className="wagon-tally-sheet-body-content-materials-details">
                <div className="wagon-tally-sheet-body-content-materials-details-header">
                  <h3 className="wagon-tally-sheet-body-content-materials-details-header-title">Add Material Details</h3>
                </div>
                <div className="wagon-tally-sheet-body-content-materials-details-body-container">
                {formValues.map((formValue, index) => 
                  <div key={index} className="wagon-tally-sheet-body-content-materials-details-body">
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Batch ID/Heat No.</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="batchId"
                          value={formValue.batchId}
                          onChange={(event) => handleInputChange(index, event)}/>
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-icon" onClick={() => {
                          handleDataWithBatchId(index);
                        }}>
                          <Image src={ArrowRight} alt="Arrow right" className="arrow-right-icon" />
                        </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Material</p>
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
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Material Code</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="materialCode"
                          value={formValue.materialCode}
                          onChange={(event) => handleInputChange(index, event)}/>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Grade</p>
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
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Width</p>
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
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Thick</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="thick"
                          value={formValue.thick}
                          onChange={(event) => handleInputChange(index, event)}/>
                        <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                          mm
                        </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Length</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="length"
                          value={formValue.length}
                          onChange={(event) => handleInputChange(index, event)}/>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                            m
                          </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Pieces</p>
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
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Line Item</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="lineItem"
                          value={formValue.lineItem}
                          onChange={(event) => handleInputChange(index, event)}/>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">PGI WT/ TW Wt.</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="pgiWeight"
                          value={formValue.pgiWeight}
                          onChange={(event) => handleInputChange(index, event)}/>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                            MT
                          </div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                      <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Actual Weight</p>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                        <input 
                          type="text" 
                          placeholder="" 
                          className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                          name="actualWeight"
                          value={formValue.actualWeight}
                          onChange={(event) => handleInputChange(index, event)}/>
                          <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                            MT
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
                    {formValue.images && formValue.images.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <Image src={formValue.images[formValue.images.length - 1] || ''} alt="Captured Image" width={48} height={36} style={{borderRadius: '6px'}} />
                          {formValue.images.length > 1 && (
                            <div style={{
                              color: '#3351FF',
                              padding: '2px 4px',
                              paddingLeft: '8px',
                              fontSize: '12px'
                            }}>
                              +{formValue.images.length - 1}
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
              <h2>Coming Soon...</h2>
            </div>}
          </div>
        </div>
        <div className="wagon-tally-sheet-footer">
          <button className="wagon-tally-sheet-footer-button-clear" onClick={() => {
            handleClear();
          }}>CLEAR</button>
          <button className="wagon-tally-sheet-footer-button-save" onClick={() => {
            console.log(formValues);
            showMessage("Wagon Details Saved & Submitted Successfully", "success")
          }}>SAVE & SUBMIT</button>
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
                Wagon Photos
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
                Materials Photos
              </div>
              <div className="photos-album-dialog-albums">
                {selectedFormIndex !== null && formValues[selectedFormIndex].images.map((image, idx) => (
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
      </div>
      <SideDrawer />
    </div>
  )
}

export default WagonTallySheet;