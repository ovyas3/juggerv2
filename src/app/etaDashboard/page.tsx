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
import { useRouter } from "next/navigation";
import { ThreeCircles } from "react-loader-spinner";


function EtaDashboard() {
  const router = useRouter();
  const { showMessage } = useSnackbar();
  const mobile = useWindowSize(500);
  const t = useTranslations("ETADASHBOARD");
  const [openModalDelay, setOpenModalDelay] = useState(false);
  const [providedShipments, setProvidedShipments] = useState([]);
  const [headingForModel, setHeadingForModel] = useState("");
  const [loading, setLoading] = useState(false);

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
  const [stabled_shipments, setStabled_shipments] = useState([]);
 
  async function getStableShipments(){
    try{
      setLoading(true);
      const response = await httpsGet('get/stable_shipments', 0, router);
      if(response.statusCode === 200) {
        setLoading(false);
        setStabled_shipments(response?.data?.stabled_shipments);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function getDelayShipments(){
    try{
      setLoading(true);
      const response = await httpsGet('rake_shipment/en_route_eta_dashboard', 0, router);
      if(response.statusCode === 200) {
        setLoading(false);
        setEarly(response.data.early);
        setLate(response.data.late);
        setOntime(response.data.on_time);
        setZeroToEight(response.data['0_8']);
        setEightToSixteen(response.data['8_16']);
        setSixteenToTwentyFour(response.data['16_24']);
        setTwentyfourTofourtyeight(response.data['24_48']);
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{
    getDelayShipments();
    getStableShipments();
  },[])

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
            <div id="reload" style={{cursor:'pointer'}} onClick={() => {getDelayShipments(); showMessage("Refreshed", "success")}}>
              <RefreshIcon />
            </div>
          </section>
          <section id="etaDisplayContainer">
            <div className="delayedBox">
              <header className="delayedheader" style={{ color: "#E76E81" }}>
                {t("delayedBy48hrs")}
              </header>
              <div className="delayInfo redBackground" onClick={() => {setOpenModalDelay(true); setProvidedShipments(late.shipments); setHeadingForModel('Delayed by >48 Hrs')}}>
                <div className="delayInfoDigit" style={{ color: "#E76E81" }}><CountUp end={late.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader">
                {t("delayedby24-28hrs")}
              </header>
              <div className="delayInfo" onClick={() => {setOpenModalDelay(true); setProvidedShipments(twentyfourTofourtyeight.shipments); setHeadingForModel('Delayed by 24-28 Hrs')}}>
                <div className="delayInfoDigit"><CountUp end={twentyfourTofourtyeight.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader">
                {t("delayedby16-24hrs")}
              </header>
              <div className="delayInfo" onClick={() => {setOpenModalDelay(true); setProvidedShipments(sixteenToTwentyFour.shipments); setHeadingForModel('Delayed by 16-24 Hrs')}}>
                <div className="delayInfoDigit"><CountUp end={sixteenToTwentyFour.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader">{t("delayedby8-16hrs")}</header>
              <div className="delayInfo" onClick={() => {setOpenModalDelay(true); setProvidedShipments(eightToSixteen.shipments); setHeadingForModel('Delayed by 8-16 Hrs')}}>
                <div className="delayInfoDigit"><CountUp end={eightToSixteen.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader">{t("delayedby0-8hrs")}</header>
              <div className="delayInfo" onClick={() => {setOpenModalDelay(true); setProvidedShipments(zeroToEight.shipments); setHeadingForModel('Delayed by 0-8 Hrs')}}>
                <div className="delayInfoDigit"><CountUp end={zeroToEight.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader" style={{color:'#40BE8A'}}>{t("ontime")}</header>
              <div className="delayInfo greenBackground" onClick={() => {setOpenModalDelay(true); setProvidedShipments(ontime.shipments); setHeadingForModel('On Time') }}>
                <div className="delayInfoDigit" style={{color:'#40BE8A'}}><CountUp end={ontime.count} duration={1.5} /></div>
              </div>
            </div>
            <div>
              <header className="delayedheader" style={{color:'#40BE8A'}}>{t("early")}</header>
              <div className="delayInfo greenBackground" onClick={() => {setOpenModalDelay(true); setProvidedShipments(early.shipments) ; setHeadingForModel('Early')}}>
                <div className="delayInfoDigit" style={{color:'#40BE8A'}}><CountUp end={early.count} duration={1.5}/></div>
              </div>
            </div>
          </section>
        </div>

        <div id="enRoutesEtaDelay" style={{marginTop:'20px'}}>
          <section id="heading_reload">
            <div id="heading">
              {/* <div id="logoContainer"></div> */}
              <header>
                {t("stableShipments")}
                <span style={{fontWeight:'600'}}><CountUp duration={1.5} end={stabled_shipments.length}/></span>
              </header>
            </div>
            <div id="reload" style={{cursor:'pointer'}} onClick={() => {
              getStableShipments();
              showMessage("Refreshed", "success")
              }}>
              <RefreshIcon />
            </div>
          </section>
          <section id="etaDisplayContainer">
            <div className="delayedBox">
              <header className="delayedheader" style={{ color: "#E76E81" }}>
                {t("stableFor48hrs")}
              </header>
              <div className="delayInfo redBackground" onClick={() => {setOpenModalDelay(true); setProvidedShipments(stabled_shipments); setHeadingForModel(t('stableFor48hrs'))}}>
                <div className="delayInfoDigit" style={{ color: "#E76E81" }}><CountUp end={stabled_shipments.length} duration={1.5} /></div>
              </div>
            </div>
           
          </section>
        </div>
        
      </div>

      {openModalDelay && (<EtaDashboardModal providedShipments={providedShipments} setOpenModalDelay={setOpenModalDelay} headingForModel={headingForModel}/>)}

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