
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
import WagonConnector from '@/assets/wagon_connector.png';
import ArrowRight from '@/assets/arrow_right_rounded.svg';
import Image from "next/image";
import Camera from '@/assets/camera.svg';
import { styled } from '@mui/system';
import { useSnackbar } from "@/hooks/snackBar";

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
  padding-top: 24px;
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

const WagonTallySheet: React.FC = () => {
  const { showMessage } = useSnackbar();
  const text = useTranslations("WAGONTALLYSHEET");
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedWagon, setSelectedWagon] = useState<number | null>(null);
  const [train, setTrain] = React.useState(
    [
      {
        "millName": "Plate Mill",
        "millId": "1",
        "wagons": [
          {
            "wagonNumber": "21160760078",
            "wagonType": "BOXN"
          },
          {
            "wagonNumber": "21160760078",
            "wagonType": "BOXN"
          },
          {
            "wagonNumber": "21160760078",
            "wagonType": "BRN_22_9"
          }
        ]
      },
      {
        "millName": "Rail Mill",
        "millId": "2",
        "wagons": [
          {
            "wagonNumber": "21160760078",
            "wagonType": "BFNV"
          },
          {
            "wagonNumber": "21160760078",
            "wagonType": "BFNV"
          },
          {
            "wagonNumber": "21160760078",
            "wagonType": "BOXN"
          }
        ]
      },
      {
        "millName": "Bar Mill",
        "millId": "3",
        "wagons": [
          {
            "wagonNumber": "21160760078",
            "wagonType": "BRN_22_9"
          },
          {
            "wagonNumber": "21160760078",
            "wagonType": "BRN_22_9"
          },
          {
            "wagonNumber": "21160760078",
            "wagonType": "BFNV"
          }
        ]
      },
      {
        "millName": "Plate Mill",
        "millId": "4",
        "wagons": [
          {
            "wagonNumber": "21160760078",
            "wagonType": "BOXN"
          },
          {
            "wagonNumber": "21160760078",
            "wagonType": "BOXN"
          },
          {
            "wagonNumber": "21160760078",
            "wagonType": "BRN_22_9"
          }
        ]
      }
    ]
  );
  const [formValues, setFormValues] = useState({
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
  });

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

  const handleInputChange = (event: any) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value
    });
  };

  const handleDataWithBatchId = () => {
    const formValues = {
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
    }

    setFormValues(formValues);
  }

  const handleClear = () => {
    setFormValues({
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
    });
  }

  useEffect(() => {
    const trainElement = document.getElementById('train');
    const scrollbarElement = document.getElementById('scrollbar') as HTMLInputElement;
  
    if (trainElement && scrollbarElement) {
      const updateScrollbarMax = () => {
        scrollbarElement.max = String(trainElement.scrollWidth - trainElement.clientWidth);
      };
      updateScrollbarMax();
      const observer = new MutationObserver(updateScrollbarMax);
      observer.observe(trainElement, { childList: true });
  
      const handleInput = () => {
        trainElement.scrollLeft = Number(scrollbarElement.value);
      };
      scrollbarElement.addEventListener('input', handleInput);
  
      const handleScroll = () => {
        scrollbarElement.value = String(trainElement.scrollLeft);
      };
      trainElement.addEventListener('scroll', handleScroll);
  
      // Clean up the event listeners and the observer when the component unmounts
      return () => {
        scrollbarElement.removeEventListener('input', handleInput);
        trainElement.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    }
  }, []);
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
              placeholder="Search by wagon number"
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
              <TrainContainer>
  {train.flatMap((mill, millIndex, millArray) => (
    mill.wagons.map((wagon, wagonIndex) => {
      // Calculate the global wagon index
      const globalWagonIndex = millArray.slice(0, millIndex).reduce((sum, currMill) => sum + currMill.wagons.length, 0) + wagonIndex;

      // Calculate the total number of wagons in the train
      const totalWagons = millArray.reduce((sum, currMill) => sum + currMill.wagons.length, 0);

      return (
        <>
          {wagonIndex === 0 && <Track><Mill>{mill.millName}</Mill></Track>}
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
        </>
      )
    })
  ))}
  <Image src={TrainImage} alt="Train engine" style={{borderBottom: '1px solid #D0D1D3', marginLeft: '-1px'}} />
</TrainContainer>
              </div>
              <input type="range" id="scrollbar" min="0" max="100" value="0" />
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
                          <input type="radio" id="yes" name="isSick" value="yes" style={{cursor: 'pointer'}} />
                          <label htmlFor="yes" className="wagon-tally-sheet-body-content-wagon-details-content-radio-label">Yes</label>
                        </div>
                        <div className="wagon-tally-sheet-body-content-wagon-details-header-content-radio-content">
                          <input type="radio" id="no" name="isSick" value="no" style={{cursor: 'pointer'}}/>
                          <label htmlFor="no" className="wagon-tally-sheet-body-content-wagon-details-content-radio-label">No</label>
                        </div>
                      </div>
                    </div>
                  </div>           
                  <div className="wagon-tally-sheet-body-content-wagon-details-photo">
                      <Image src={Camera} alt="Camera" />
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Take Photo</p>
                  </div>
                </div>
                <div className="wagon-tally-sheet-body-content-wagon-details-container">
                  <div className="wagon-tally-sheet-body-content-wagon-details-contents">
                    <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Loading Readiness Time</p>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-date">24-08-2024</div>
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-time">01:00 PM</div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Material Loading Start Time</p>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-date">24-08-2024</div>
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-time">01:00 PM</div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Material Loading End Time</p>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-date">24-08-2024</div>
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-time">01:00 PM</div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Packing Start Time</p>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-date">24-08-2024</div>
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-time">01:00 PM</div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Welding & Stepping Start Time</p>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-date">24-08-2024</div>
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-time">01:00 PM</div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Welding & Stepping End Time</p>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-date">24-08-2024</div>
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-time">01:00 PM</div>
                      </div>
                    </div>
                    <div className="wagon-tally-sheet-body-content-wagon-details-content-down">
                      <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Packing End Time</p>
                      <div className="wagon-tally-sheet-body-content-wagon-details-content-date-time">
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-date">24-08-2024</div>
                        <div className="wagon-tally-sheet-body-content-wagon-details-content-time">01:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="wagon-tally-sheet-body-content-materials-details">
                <div className="wagon-tally-sheet-body-content-materials-details-header">
                  <h3 className="wagon-tally-sheet-body-content-materials-details-header-title">Add Material Details</h3>
                  <div className="wagon-tally-sheet-body-content-wagon-details-photo">
                    <Image src={Camera} alt="Camera" />
                    <p className="wagon-tally-sheet-body-content-wagon-details-content-label">Take Photo</p>
                  </div>
                </div>
                <div className="wagon-tally-sheet-body-content-materials-details-body">
                  <div className="wagon-tally-sheet-body-content-materials-details-body-content">
                    <p className="wagon-tally-sheet-body-content-materials-details-body-content-label">Batch ID/Heat No.</p>
                    <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-container">
                      <input 
                        type="text" 
                        placeholder="" 
                        className="wagon-tally-sheet-body-content-materials-details-body-content-input"
                        name="batchId"
                        value={formValues.batchId}
                        onChange={handleInputChange}/>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-icon" onClick={() => {
                        handleDataWithBatchId();
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
                        value={formValues.material}
                        onChange={handleInputChange}/>
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
                        value={formValues.materialCode}
                        onChange={handleInputChange}/>
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
                        value={formValues.grade}
                        onChange={handleInputChange}/>
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
                        value={formValues.width}
                        onChange={handleInputChange}/>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                        m
                      </div>
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
                        value={formValues.thick}
                        onChange={handleInputChange}/>
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
                        value={formValues.length}
                        onChange={handleInputChange}/>
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
                        value={formValues.pieces}
                        onChange={handleInputChange}/>
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
                        value={formValues.lineItem}
                        onChange={handleInputChange}/>
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
                        value={formValues.pgiWeight}
                        onChange={handleInputChange}/>
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
                        value={formValues.actualWeight}
                        onChange={handleInputChange}/>
                      <div className="wagon-tally-sheet-body-content-materials-details-body-content-input-unit">
                        MT
                      </div>
                    </div>
                  </div>
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
      </div>
      <SideDrawer />
    </div>
  )
}

export default WagonTallySheet;