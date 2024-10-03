import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Popover from "@mui/material/Popover";
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';


function RakeHandlingSheet({ isClose, shipment }: any) {
    const text = useTranslations("WAGONTALLYSHEET");
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const openAction = Boolean(anchorEl);
    const [showActionBox, setShowActionBox] = React.useState(-1);
    const [openUploadWagonSheetmodal, setOpenUploadWagonSheetModal] = useState(false);
    const [openRakeHandlingSheet, setOpenRakeHandlingSheet] = useState(false);
    const [uploadShipmentwagon, setuploadShipmentwagon] = useState({});
    const [rakeHandlingSheetData, setRakeHandlingSheetData] = useState({});
    const [millDetails, setMillDetails] = useState([
        {
            major_id:1,
            mill: text('railmill'),
            hooks: [
                {
                    id: 1,
                    wagonType: "",
                },
            ],
        },
    ]);

    function addMillDetails() {
        const newMill = {
            major_id:millDetails.length+1,
            mill: text('railmill'),
            hooks: [
                {
                    id:1,
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
    
    function addMillInMillDetails (event : any, index : number, millNameAdded : string) {
        setMillDetails((prevMillDetails) => {
            const updatedMillDetails = [...prevMillDetails];
            updatedMillDetails[index] = {
                ...updatedMillDetails[index],
                mill: millNameAdded
            };
            return updatedMillDetails;
        });
    }
    function removeHookFromMillDetails (event :any, index : number, hookIndex : number) {
        setMillDetails((prevMillDetails) => {
            const updatedMillDetails = [...prevMillDetails];
            updatedMillDetails[index].hooks.splice(hookIndex, 1);
            return updatedMillDetails;
        });
    }
    function addHookInMillDetails (event: any, index : number) {
        setMillDetails((prevMillDetails) => {
            const updatedMillDetails = [...prevMillDetails];
            updatedMillDetails[index].hooks.push({
                id: updatedMillDetails[index].hooks.length + 1,
                wagonType: "",
            });
            return updatedMillDetails;
        });
    }

    console.log(millDetails);
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
                            <input className="inputForRakeSection" type="text" />
                        </div>
                        <div>
                            <header className="headerForRakeSection">
                                {text("rakeArrivalAtPlant")}
                            </header>
                            <input className="inputForRakeSection" type="text" />
                        </div>
                        <div>
                            <header className="headerForRakeSection">
                                {text("bpRelease")}
                            </header>
                            <input className="inputForRakeSection" type="text" />
                        </div>
                        <div>
                            <header className="headerForRakeSection">
                                {text("wagonPlacedAtLoadingPoint")}
                            </header>
                            <input className="inputForRakeSection" type="text" />
                        </div>
                    </div>

                    {millDetails.map((item, index): any => {
                        return (
                            <div key={index}>
                                <div style={{ marginBottom: "26px" }}>
                                    <header className="headerForRakeSection_millDetails">
                                        {text("mill")} {item.major_id}
                                    </header>
                                    <div className="millDetails_dropDown"  onClick={(e: any) => {
                                      clickActionBox(e, index, "", "");
                                      setAnchorEl(
                                        e.currentTarget as unknown as HTMLButtonElement
                                      );
                                    }} >
                                        <div>{item.mill}</div>
                                        {/* <div className="expandMoreIcon_millDetails">
                                            <ExpandMoreIcon />
                                        </div> */}
                                        <Popover
                                            open={
                                                showActionBox === index ? true : false
                                            }
                                            anchorEl={anchorEl}
                                            onClose={handleCloseAction}
                                            anchorOrigin={{
                                                vertical: 40,
                                                horizontal: 0,
                                            }}
                                        >
                                            <div className="action-popover-wagon" onClick={(e) =>{addMillInMillDetails(e, index, text('railmill'))}} >
                                                {text('railmill')}
                                            </div>
                                            <div className="action-popover-wagon" onClick={(e) =>{addMillInMillDetails(e, index, text('plateMill'))}} >
                                                {text('plateMill')}
                                            </div>
                                            <div className="action-popover-wagon"  onClick={(e) =>{addMillInMillDetails(e, index, text('semis'))}}>
                                                {text('semis')}
                                            </div>
                                            <div className="action-popover-wagon" onClick={(e) =>{addMillInMillDetails(e, index, text('barMill'))}}>
                                                {text('barMill')}
                                            </div>
                                            <div className="action-popover-wagon" onClick={(e) =>{addMillInMillDetails(e, index, text('cementPlant'))}}>
                                                {text('cementPlant')}
                                            </div>
                                            <div className="action-popover-wagon"  onClick={(e) =>{addMillInMillDetails(e, index, text('steel'))}}>
                                                {text('steel')}
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
                                                        <header>{hookIndex+1} Hook</header>
                                                        <div style={{ display: "flex",  gap:8 }}>
                                                            {hookIndex !== 0 ? <div onClick={(e)=>{removeHookFromMillDetails(e, index, hookIndex)}} className="removeAddicons" style={{ backgroundColor:'#E24D65'}}><RemoveIcon style={{height:20, width:20}}/></div> : <div style={{height:20, width:20}}></div>}
                                                            {item.hooks.length - 1 === hookIndex && <div onClick={(e)=>{addHookInMillDetails(e, index)}} className="removeAddicons" style={{backgroundColor:'#596FFF'}}><AddIcon style={{height:20, width:20}}/></div>
                                                        }
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
                            <input className="inputForRakeSection" type="text" />
                        </div>
                        <div>
                            <header className="headerForRakeSection">
                                {text("rakeRelease")}
                            </header>
                            <input className="inputForRakeSection" type="text" />
                        </div>
                        <div>
                            <header className="headerForRakeSection">
                                {text("rlylocoReporting")}
                            </header>
                            <input className="inputForRakeSection" type="text" />
                        </div>
                        <div>
                            <header className="headerForRakeSection">{text("eot")}</header>
                            <input className="inputForRakeSection" type="text" />
                        </div>
                        <div>
                            <header className="headerForRakeSection">
                                {text("apReady")}
                            </header>
                            <input className="inputForRakeSection" type="text" />
                        </div>
                        <div>
                            <header className="headerForRakeSection">
                                {text("drawnOut")}
                            </header>
                            <input className="inputForRakeSection" type="text" />
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
