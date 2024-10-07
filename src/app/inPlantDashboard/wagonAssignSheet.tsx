import React, { useEffect, useState } from "react";
import searchIcon from "@/assets/search_wagon.svg";
import Image from "next/image";
import { useTranslations } from "next-intl";
import locomotiveEngine from "@/assets/Train_engine-locomotive.png";
import blueWagon from "@/assets/BOXN 1.png";
import BRN_wagon from "@/assets/BRNwagon.png";
import BFNS_wagon from "@/assets/BFNS-wagon.png";
import BFNV_wagon from "@/assets/BFNVwagon.png";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { httpsGet } from "@/utils/Communication";
import { AssignToMill } from "./actionComponents";

 // const rail = [
  //   { wagon_no: 21160760078, millType: "Rail", track: "Track 1" },
  //   { wagon_no: 21160760078, millType: "Rail", track: "Track 2" },
  //   { wagon_no: 21160760078, millType: "Rail", track: "Track 3" },
  //   { wagon_no: 19140451439, millType: "Rail", track: "Track 4" },
  //   { wagon_no: 19140451439, millType: "Rail", track: "Track 5" },
  //   { wagon_no: 19140451439, millType: "Rail", track: "Track 6" },
  //   { wagon_no: 24140451490, millType: "Rail", track: "Track 7" },
  //   { wagon_no: 24140451490, millType: "Rail", track: "Track 8" },
  //   { wagon_no: 24140451490, millType: "Rail", track: "Track 9" },
  //   { wagon_no: 24140451490, millType: "Rail", track: "Track 10" },
  //   { wagon_no: 24140451490, millType: "Rail", track: "Track 11" },
  //   { wagon_no: 67123948512, millType: "Rail", track: "Track 12" },
  //   { wagon_no: 83940271645, millType: "Rail", track: "Track 13" },
  //   { wagon_no: 19283746520, millType: "Rail", track: "Track 14" },
  //   { wagon_no: 60593827451, millType: "Rail", track: "Track 15" },
  //   { wagon_no: 38472016539, millType: "Rail", track: "Track 16" },
  //   { wagon_no: 75120483962, millType: "Rail", track: "Track 17" },
  //   { wagon_no: 29834710562, millType: "Rail", track: "Track 18" },
  //   { wagon_no: 47261830957, millType: "Rail", track: "Track 19" },
  //   { wagon_no: 93048561728, millType: "Rail", track: "Track 20" },
  // ];

function WagonAssignSheet({shipmentForWagonSheet, setShowWagonSheet,setShowAssignWagon,setShipmentForWagonSheet}:any) {
  const text = useTranslations("WAGONTALLYSHEET");
  const [openAssignToPlantModal, setOpenAssignToPlantModal] = useState(false);
 
  // api calling 
  const wagonDetails = async() =>{
    try {
      const response = await httpsGet(`get_wagon_details_by_shipment?id=${shipmentForWagonSheet.id}`)
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    wagonDetails(); 
  }, [])
  
  return (
    <div className="wagon-wrapper">

      <div id="search-container-assign">
        <div style={{cursor:'pointer'}} onClick={() => {setShowWagonSheet(true); setShowAssignWagon(false); setShipmentForWagonSheet({}) }} ><ArrowBackIcon/></div>
        <div className="input-wrapper">
          <Image src={searchIcon} alt="" className="icon"></Image>
          <input className="input" placeholder="Search by Wagon No." />
        </div>
        <div></div>
      </div>

      <div id="assign-wagon-details">
        <div className="subtile-assign-wagon-details">
          {text("edemand")}
          <span style={{ fontWeight: "600", fontSize: 13 }}>{shipmentForWagonSheet?.edemand?.edemand_no || 'XXXXXXXXXXXX'}</span>
        </div>
        <div className="subtile-assign-wagon-details">
          {text("rakeNo")}
          <span style={{ fontWeight: "600", fontSize: 13 }}>{shipmentForWagonSheet.rake?.rake_no || 'XXXXXXXX'}</span>
        </div>
        <div className="subtile-assign-wagon-details">
          {text("tottalWagons")}
          <span style={{ fontWeight: "600", fontSize: 13 }}>{shipmentForWagonSheet?.total_wagons?.numberTotal || 'XX'}</span>
        </div>
      </div>

      {/* <div style={{ paddingInline: 24 }}>
        <div id="rail">
          <div id="railEngine">
            <Image
              src={locomotiveEngine.src}
              height={550}
              width={550}
              style={{ width: "100%", height: "100%" }}
              alt="locomotive"
            />
          </div>
          {rail.map((wagon, index) => {
            return (
              <div key={index} className="eachWagonOfAssignWagon">
                <div style={{ width: 179,height:40, backgroundColor:'red'}}>
                  <Image
                    src={wagonPic(wagon.wagon_no)}
                    height={550}
                    width={550}
                    alt="wagon"
                    style={{ width: "100%", height: "100%" , display:bloc}}
                  />
                </div>
                <div style={{ width: 10,}}></div>
                <div id='wagon-number-rail'>{wagon.wagon_no}</div>
              </div>
            );
          })}
        </div>
      </div> */}

      <div id='assign-button-container'>
        <div id='assign-button' onClick={(e)=>{e.stopPropagation(); setOpenAssignToPlantModal(true)}} >{text("assignButton")}</div>
      </div>

      {openAssignToPlantModal && <AssignToMill isClose={setOpenAssignToPlantModal}/>}

    </div>
  );
}
export default WagonAssignSheet;

function wagonPic(wagon_no: number) {
  if (wagon_no.toString().substring(0, 3) === "211") {
    return blueWagon;
  }
  else if (wagon_no.toString().substring(0, 3) === "191") {
    return BRN_wagon;
  }
  else if (wagon_no.toString().substring(0, 3) === "241") {
    return BFNV_wagon;
  }
  return BFNS_wagon;
}
