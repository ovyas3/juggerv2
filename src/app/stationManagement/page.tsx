'use client'

import Header from "@/components/Header/header";
import StationHeader from "@/components/Station/StationHeader";
import SideDrawer from "@/components/Drawer/Drawer"
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useWindowSize } from "@/utils/hooks";
import MobileHeader from "@/components/Header/mobileHeader";
import { useEffect, useState } from "react";
import searchIcon from '@/assets/search_icon.svg'
import './page.css'
import StationAdd from "./stationModal";
import { httpsGet } from "@/utils/Communication";

const Page = () => {
  const mobile = useWindowSize(600);
  const [openAddStationModal, setOpenAddStationModal] = useState(false)

  const [countStation, setCountStation] = useState(0)
  const [allStations, setAllStations] = useState([])
  const [stationPayload, setStationPayload] = useState({
    limit:10,
    skip:0,
    zone:'',
    code:'',
    state:''
  })

  async function getStations({stationPayload}:any) {
    try {
      await httpsGet(`get/stations?limit=${stationPayload.limit}&skip=${stationPayload.skip}&state=${stationPayload.state}&zone=${stationPayload.zone}&code=${stationPayload.code}`).then((res) => {
        setAllStations(res?.data?.stations);
        setCountStation(res?.data?.count);
      }).catch((err) => {
        console.log(err)
      })
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    getStations({stationPayload});
  },[stationPayload])

  return (
    <div className="station-container">
      {/* ------------header ----------- */}
      {mobile ? <Header title={'Station Management'} isMapHelper={false} /> : <MobileHeader />}

      {/* ----------Page Content------------ */}
      <div className={`pageContainer ${mobile ? '' : 'marginAtMobile'}`}>
        {/* --------------content other than table ------------------ */}
        <div className="filters_stations">
          <div></div>
          <div>
            <div>Station Code</div>
            <div>
              <input placeholder="Search for station code" type="text" />
              <div style={{ cursor: 'pointer', height: 24, width: 24, position: 'absolute', right: -40, top: 5 }}><img src={searchIcon.src} alt='searchIcon' style={{ width: '100%', height: '100%' }} /></div>
            </div>
          </div>
          <div onClick={()=>{setOpenAddStationModal(true)}} >Add Station</div>
        </div>

        {/* --------------table content----------- */}
        <StationHeader  countStation={countStation} allStations={allStations} setStationPayload={setStationPayload} />
      </div>

      {/* -------------modals ------------ */}
      <div className="modalStationModal" style={{ display: openAddStationModal ? 'flex' : 'none' }}
         onClick={(e) => { e.stopPropagation(); setOpenAddStationModal(false) }}>
          <StationAdd setOpenAddStationModal={setOpenAddStationModal} getStations={getStations} stationPayload={stationPayload} />
      </div>

      {/* ----------sildeDrawer ------------- */}
      {mobile ? <SideDrawer /> : <div className="bottom_bar"><MobileDrawer /></div>}
    </div>
  )
}

export default Page;