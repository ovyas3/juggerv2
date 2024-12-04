'use client'

import Header from "@/components/Header/header";
import StationHeader from "@/components/Station/StationHeader";
import SideDrawer from "@/components/Drawer/Drawer"
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useWindowSize } from "@/utils/hooks";
import MobileHeader from "@/components/Header/mobileHeader";
import { useEffect, useState } from "react";
import searchIcon from '@/assets/search_icon.svg'
import './stationManagement.css'
import StationAdd from "./stationModal";
import { httpsGet } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useMediaQuery, useTheme } from '@mui/material';

const StationManagement = () => {
  const router = useRouter();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openAddStationModal, setOpenAddStationModal] = useState(false)

  const [countStation, setCountStation] = useState(0);
  const [allStations, setAllStations] = useState([]);
  const [ogStations, setOgStations] = useState([]);
  const [stationPayload, setStationPayload] = useState({
    limit:0,
    skip:0,
    zone:'',
    code:'',
    state:''
  })
  const [editStationPayload, setEditStationPayload] = useState<any>({});
  const [editFlag, setEditFlag] = useState(false);

  async function getStations({stationPayload}:any) {
    try {
      await httpsGet(`get/stations?limit=${stationPayload.limit}&skip=${stationPayload.skip}&state=${stationPayload.state}&zone=${stationPayload.zone}&code=${stationPayload.code}`, 0, router).then((res) => {
        setAllStations(res?.data?.stations);
        setCountStation(res?.data?.count);
        setOgStations(res?.data?.stations);
      }).catch((err) => {
        console.log(err)
      })
    } catch (error) {
      console.log(error);
    } 
  }

  function handleSearchStationCode(target: any) {
    if(target.length > 0){
      setAllStations(ogStations.filter((station: any) => station.code.toLowerCase().includes(target.toLowerCase())))
    }else{
      setAllStations(ogStations)
    }
  }

  function stationForEdit(stationDetails: any) {
    setEditFlag(true);
    setEditStationPayload(stationDetails)
    setOpenAddStationModal(true)
  }

  useEffect(()=>{
    if(stationPayload.limit > 0)
    getStations({stationPayload});
  },[stationPayload])


  return (
    <div 
      className="station-container"
    >
      {/* ------------header ----------- */}
      {/* {!mobile ? <Header title={'Station Management'} isMapHelper={false} /> : <MobileHeader />} */}

      {/* ----------Page Content------------ */}
      <div className="station-content">
        {/* --------------content other than table ------------------ */}
        <div className="filters_stations">
          <div></div>
          <div>
            <div>Station Code</div>
            <div>
              <input placeholder="Search for station code" type="text" onChange={(e) => { handleSearchStationCode(e.target.value) }} />
              <div style={{ cursor: 'pointer', height: 24, width: 24, position: 'absolute', right: -40, top: 5 }}><img src={searchIcon.src} alt='searchIcon' style={{ width: '100%', height: '100%' }} /></div>
            </div>
          </div>
          <div onClick={()=>{setOpenAddStationModal(true); setEditFlag(false); setEditStationPayload({})}} >Add Station</div>
        </div>

        {/* --------------table content----------- */}
        <StationHeader  countStation={countStation} allStations={allStations} setStationPayload={setStationPayload} stationPayload={stationPayload} stationForEdit={stationForEdit}/>
      </div>

      {/* -------------modals ------------ */}
      <div className="modalStationModal" style={{ display: openAddStationModal ? 'flex' : 'none' }}
         onClick={(e) => { e.stopPropagation(); setOpenAddStationModal(false) }}>
          <StationAdd setOpenAddStationModal={setOpenAddStationModal} getStations={getStations} stationPayload={stationPayload} editStationPayload={editStationPayload} editFlag={editFlag} />
      </div>

      {/* ----------sildeDrawer ------------- */}
      {/* {!mobile ? <SideDrawer /> : <div ><MobileDrawer /></div>} */}
    </div>
  )
}

export default StationManagement;