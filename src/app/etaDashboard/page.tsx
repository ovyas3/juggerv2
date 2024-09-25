"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useTranslations } from "next-intl";
import RefreshIcon from "@mui/icons-material/Refresh";
import "./style.css";
import CountUp from 'react-countup';
import { delay } from "framer-motion";
import EtaDashboardModal from "./etaDashboradModal";


function EtaDashboard() {

  const { showMessage } = useSnackbar();
  const mobile = useWindowSize(500);
  const t = useTranslations("ETADASHBOARD");
  const [openModalDelay, setOpenModalDelay] = useState(false);
  const [providedShipments, setProvidedShipments] = useState([]);

  const [early, setEarly] = useState({
    count: 0,
    shipments:[]
  });
  const [late, setLate] = useState({
    count: 0,
    shipments:[]
  })
  const [ontime, setOntime] = useState({
    count: 0,
    shipments:[]
  })
  const [zeroToEight, setZeroToEight] = useState({
    count: 0,
    shipments:[]
  })
  const [eightToSixteen, setEightToSixteen] = useState({
    count: 0,
    shipments:[]
  })
  const [sixteenToTwentyFour, setSixteenToTwentyFour] = useState({
    count: 0,
    shipments:[]
  })
  const [twentyfourTofourtyeight, setTwentyfourTofourtyeight] = useState({
    count: 0,
    shipments:[]
  })



  async function getDelayShipments(){
    const response = await httpsGet('rake_shipment/en_route_eta_dashboard');
    if(response.statusCode === 200) {
      console.log(response.data)
      setEarly(response.data.early);
      setLate(response.data.late);
      setOntime(response.data.on_time);
      setZeroToEight(response.data['0_8']);
      setEightToSixteen(response.data['8_16']);
      setSixteenToTwentyFour(response.data['16_24']);
      setTwentyfourTofourtyeight(response.data['24_48']);
    }
  }
  useEffect(()=>{
    getDelayShipments();
  },[])

  return (
    <div>
      {mobile ? (
        <Header title={"Dashboard"} isMapHelper={false} />
      ) : (
        <MobileHeader />
      )}

      <div
        className={`content_container ${
          mobile ? "adjustMargin" : "adjustMarginMobile"
        }`}
      >
        <div id="enRoutesEtaDelay">
          <section id="heading_reload">
            <div id="heading">
              {/* <div id="logoContainer"></div> */}
              <header>
                {t("enheading")}
                <span style={{fontWeight:'600'}}><CountUp duration={1.5} end={early.count+late.count+ontime.count+zeroToEight.count+eightToSixteen.count+sixteenToTwentyFour.count+twentyfourTofourtyeight.count}/></span>
              </header>
            </div>
            <div id="reload">
              {/* <RefreshIcon /> */}
            </div>
          </section>
          <section id="etaDisplayContainer">
            <div className="delayedBox">
              <header className="delayedheader" style={{ color: "#E76E81" }}>
                {t("delayedBy48hrs")}
              </header>
              <div className="delayInfo redBackground" onClick={() => {setOpenModalDelay(true); setProvidedShipments(early.shipments)}}>
                <div className="delayInfoDigit" style={{ color: "#E76E81" }}><CountUp end={late.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader">
                {t("delayedby24-28hrs")}
              </header>
              <div className="delayInfo" onClick={() => {setOpenModalDelay(true); setProvidedShipments(ontime.shipments)}}>
                <div className="delayInfoDigit"><CountUp end={twentyfourTofourtyeight.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader">
                {t("delayedby16-24hrs")}
              </header>
              <div className="delayInfo" onClick={() => {setOpenModalDelay(true); setProvidedShipments(sixteenToTwentyFour.shipments)}}>
                <div className="delayInfoDigit"><CountUp end={sixteenToTwentyFour.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader">{t("delayedby8-16hrs")}</header>
              <div className="delayInfo" onClick={() => {setOpenModalDelay(true); setProvidedShipments(eightToSixteen.shipments)}}>
                <div className="delayInfoDigit"><CountUp end={eightToSixteen.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader">{t("delayedby0-8hrs")}</header>
              <div className="delayInfo" onClick={() => {setOpenModalDelay(true); setProvidedShipments(zeroToEight.shipments)}}>
                <div className="delayInfoDigit"><CountUp end={zeroToEight.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader" style={{color:'#40BE8A'}}>{t("ontime")}</header>
              <div className="delayInfo greenBackground" onClick={() => {setOpenModalDelay(true); setProvidedShipments(ontime.shipments)}}>
                <div className="delayInfoDigit" style={{color:'#40BE8A'}}><CountUp end={ontime.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader" style={{color:'#40BE8A'}}>{t("early")}</header>
              <div className="delayInfo greenBackground" onClick={() => {setOpenModalDelay(true); setProvidedShipments(early.shipments)}}>
                <div className="delayInfoDigit" style={{color:'#40BE8A'}}><CountUp end={early.count} duration={1.5}/></div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {openModalDelay && (<EtaDashboardModal providedShipments={providedShipments} setOpenModalDelay={setOpenModalDelay} />)}

      {mobile ? (
        <SideDrawer />
      ) : (
        <div className="bottom_bar">
          <MobileDrawer />
        </div>
      )}
    </div>
  );
}

export default EtaDashboard;