'use client'
import React, { useEffect, useState } from "react";
import ProgressBar from "../progressBars/progressBar";
import totalRakesIcon from "../../../assets/total_rakes.svg";
import trackingWithGPS from "../../../assets/tracking_icon.svg";
import nonTracking from "../../../assets/non_tracking_icon.svg";
import MapViewIcon from "@/assets/map_view.svg";
import MapViewHoverIcon from "@/assets/map_view_onhover_icon.svg";
import "./css/trackingStatus.css";
import Image from "next/image";
import forwardArrow from "../../../assets/forward_arrow_icon.svg";
import { httpsGet } from "@/utils/Communication";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { get } from "http";

interface TrackingStatusProps {
  handleAllRakesAndTable: (props: any) => void;
  handleSchemeTypeAndTable: (props: any) => void;
  handleTrackingAndNonTracking: (props: any) => void;
  statusInfo: string;
  statusNumber: number;
}

const TrackingStatus: React.FC<TrackingStatusProps> = ({ handleAllRakesAndTable, handleSchemeTypeAndTable, handleTrackingAndNonTracking, statusInfo, statusNumber }) => {
  const router = useRouter();
  const t = useTranslations("DASHBOARD");
  const [isHovered, setIsHovered] = useState(false);
  const [isMapHover, setIsMapHover] = useState(false);
  const [nonTrackingEmptyHovered, setNonTrackingEmptyHovered] = useState(false);
  const [nonTrackingWithLoadHovered, setNonTrackingWithLoadHovered] = useState(false);
  const [totalRakes, setTotalRakes] = useState(0);
  const [totalWagons, setTotalWagons] = useState(0);
  const [trackingPercent, setTrackingPercent] = useState(0);
  const [nonTrackingPercent, setNonTrackingPercent] = useState(0);
  const [schemeData, setSchemeData] = useState([
    {
      scheme: "",
      count: "",
      wagons: "",
    },
  ]);

  
  useEffect(() => {
    console.log("statusInfo", statusInfo);
  console.log("statusNumber", statusNumber);
  }, [statusInfo, statusNumber]);

  let trackingStructure = {
    totalTracking: 0,
    withLoad: 0,
    withoutLoad: 0,
  };

  let nonTrackingStructure = {
    totalTracking: 0,
    withLoad: {},
    withoutLoad: {},
    totalWithLoad: 0,
    totalWithoutLoad: 0,
  };

  const [trackingData, setTrackingData] = useState(trackingStructure);
  const [nonTrackingData, setNonTrackingData] = useState(nonTrackingStructure);

  function percentage(val: any, total: any) {
    return (val / total) * 100;
  }

  function breakdownLabelFormatter(val: any) {
    let formattedLabel = "";
    switch (val) {
      case "1-2 hours": {
        formattedLabel = "2hrs";
        break;
      }
      case "2-4 hours": {
        formattedLabel = "4hrs";
        break;
      }
      case "8+ hours": {
        formattedLabel = "8hrs";
        break;
      }
    }
    return formattedLabel;
  }

  useEffect(() => {
    httpsGet("all_tracking_rakes").then((response: any) => {
      if (response) {
        if (response.totalRakeCount) setTotalRakes(response.totalRakeCount);
        if (response.scheme) {
          setSchemeData(response.scheme);
          let totalWagons = 0;
          response.scheme.map((scheme: any) => {
            totalWagons += scheme.wagons;
          });
          setTotalWagons(totalWagons);
        }
        if (response.trackingDetails) {
          if (response.trackingDetails.tracking) {
            const data = response.trackingDetails.tracking;
            setTrackingPercent(
              percentage(data.totalTracking, response.totalRakeCount)
            );
            setTrackingData({
              totalTracking: data.totalTracking,
              withLoad: data.withLoad,
              withoutLoad: data.withoutLoad,
            });
          }
          if (response.trackingDetails.nontracking) {
            const data = response.trackingDetails.nontracking;
            setNonTrackingPercent(
              percentage(data.totalTracking, response.totalRakeCount)
            );
            const withLoadTotal = Object.values(data.withLoad).reduce(
              (accumulator: any, currentValue: any) => {
                return accumulator + currentValue;
              }
            );
            const withoutLoadTotal = Object.values(data.withoutLoad).reduce(
              (accumulator: any, currentValue: any) => {
                return accumulator + currentValue;
              }
            );
            setNonTrackingData({
              totalTracking: data.totalTracking,
              withLoad: data.withLoad,
              withoutLoad: data.withoutLoad,
              totalWithLoad: Number(withLoadTotal),
              totalWithoutLoad: Number(withoutLoadTotal),
            });
          }
        }
      }
    });
  }, []);

  const getClassName = (baseName: string, statusInfo: string) => {
    switch(statusInfo) {
      case 'all':
        return baseName;
      case 'sfto':
        return `${baseName}-sfto`;
      case 'gpwis':
        return `${baseName}-gpwis`;
      case 'bfnv':
        return `${baseName}-bfnv`;
      default:
        return baseName;
    };
  };

  const getClassNameTracking = (baseName: string, statusInfo: string) => {
    switch(statusInfo) {
      case 'all':
        return baseName;
      case 'trackingWithLoad':
        return `${baseName}-trackingWithLoad`;
      case 'trackingWithoutLoad':
        return `${baseName}-trackingWithoutLoad`;
      default:
        return baseName;
    };
  };

  const getClassNameNonTracking = (baseName: string, statusInfo: string) => {
    switch(statusInfo) {
      case 'all':
        return baseName;
      case 'nonTrackingWithLoad':
        return `${baseName}-nonTrackingWithLoad`;
      case 'nonTrackingWithoutLoad':
        return `${baseName}-nonTrackingWithoutLoad`;
      default:
        return baseName;
    };
  };

  function getStyle(statusInfo: string, index: number) {

    if (statusInfo === 'sfto') {
      if (index === 0) {
        return { backgroundColor: '#18be8a1a', borderRadius: '8px', borderRight: '3px solid #334ffc0d'};
      }
    } else if (statusInfo === 'gpwis') {
      if (index === 1) {
        return { backgroundColor: '#334ffc1a', borderRadius: '8px', borderRight: '3px solid #334ffc0d'};
      } 
    } else if (statusInfo === 'bfnv') {
      if (index === 2) {
        return { backgroundColor: '#bc4a281a', borderRadius: '8px', borderRight: '3px solid #334ffc0d'};
      }
    } else if (statusInfo === 'trackingWithLoad') {
      if (index === 3) {
        return { backgroundColor: '#334ffc1a', borderRadius: '8px', borderRight: '3px solid #18be8a0d'};
      }
    } else if (statusInfo === 'trackingWithoutLoad') {
      if (index === 4) {
        return { backgroundColor: '#bc4a281a', borderRadius: '8px', borderRight: '3px solid #18be8a0d' };
      }
    } else if (statusInfo === 'nonTrackingWithLoad') {
      if (index === 5) {
        return { backgroundColor: '#18be8a1a', borderRadius: '8px', borderRight: '3px solid #ea59500d' };
      }
    } else if (statusInfo === 'nonTrackingWithoutLoad') {
      if (index === 6) {
        return { backgroundColor: '#334ffc1a', borderRadius: '8px', borderRight: '3px solid #ea59500d' };
      }
    }
  }


  return (
    <div className="tracking-status-container">
      <div className="tracking-status-head">
        <div className="tracking-status-header">
          TRACKING STATUS
        </div>
        <div className="map-view-btn" 
             onMouseEnter={() => setIsMapHover(true)} 
             onMouseLeave={() => setIsMapHover(false)}
             onClick={() => router.push('/MapsHelper')}>
          <Image src={isMapHover ? MapViewHoverIcon : MapViewIcon} alt="map view" width={16} height={16}/>
          <span className="map-view-btn-header">Map View</span>
        </div>
      </div>
      <div className="status-container">
        <div
          className="status-wrapper"
          onMouseOver={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <ProgressBar
            color={"#334FFC"}
            percent={100}
            count={totalRakes}
            name={t("totalRakes")}
            icon={totalRakesIcon}
            hoverIcon={forwardArrow}
            isHovered={isHovered}
            handleAllRakesAndTable={handleAllRakesAndTable}
            onClick={() => getClassName('total-rakes-split-count', statusInfo)}
          />
          <div className="scheme">
            {schemeData
              .sort((a, b) => {
                const order = ['SFTO', 'GPWIS', 'BFNV'];
                return order.indexOf(a.scheme) - order.indexOf(b.scheme);
              }).map((scheme, index) => (
              <div className="scheme-container"  key={scheme.scheme} onClick={() => handleSchemeTypeAndTable(scheme.scheme)}
              style={getStyle(statusInfo, index)}>
                <span className={getClassName('total-rakes-split-count', statusInfo)}>
                  {scheme.count || 0}
                </span>
                <span className={getClassName('scheme-name', statusInfo)}>
                  {scheme.scheme || ""}
                </span>
                <div className="hover-infobox">
                  <span className="no-of-wagons">{scheme.wagons || 0}</span>
                  <span className="wagons-text">{t("wagons")}</span>
                </div>
              </div>
            ))}
              <div className="scheme-container" >
                <span className="total-rakes-split-count">
                  {totalWagons || 0}
                </span>
                <span style={{ color: "#71747A", fontSize: "10px" }}>
                  Total Wagons
                </span>
                
              </div>
          </div>
        </div>
        <div className="status-wrapper">
          <ProgressBar
            color={"#18BE8A"}
            percent={trackingPercent}
            count={trackingData.totalTracking}
            name={t("trackingWithGPS")}
            icon={trackingWithGPS}
            handleAllRakesAndTable={handleAllRakesAndTable}
            onClick={() => getClassNameTracking('all', statusInfo)}
          />
          <div className="load-analysis-wrapper">
            <div
              className="load-analysis-with-load-tracking"
              onClick={() => handleTrackingAndNonTracking("trackingWithLoad")}
              style={getStyle(statusInfo, 3)}
            >
              <span className={getClassNameTracking('load-count', statusInfo)}>
                {trackingData.withLoad || 0}
              </span>
              <span className={getClassNameTracking("load-label", statusInfo)}>
                {t("withLoad")}
              </span>
            </div>
            <div
             className="load-analysis-without-load-tracking"
              onClick={() => handleTrackingAndNonTracking("trackingWithoutLoad")}
              style={getStyle(statusInfo, 4)}
            >
              <span className={getClassNameTracking('load-count', statusInfo)}>
                {trackingData.withoutLoad || 0}
              </span>
              <span className={getClassNameTracking("load-label", statusInfo)}>
                {t("withoutLoad")}
              </span>
            </div>
          </div>
        </div>
        <div className="status-wrapper">
          <ProgressBar
            color={"#EA5950"}
            percent={nonTrackingPercent}
            count={nonTrackingData.totalTracking}
            name={t("nonTracking")}
            icon={nonTracking}
            handleAllRakesAndTable={handleAllRakesAndTable}
            onClick={() => getClassNameNonTracking('all', statusInfo)}  
          />
          <div className="load-analysis-wrapper">
            <div
              className="non-tracking-data-with-load"
              onClick={() => handleTrackingAndNonTracking("nonTrackingWithLoad")}
              onMouseOver={() => setNonTrackingWithLoadHovered(true)}
              onMouseLeave={() => setNonTrackingWithLoadHovered(false)}
              style={getStyle(statusInfo, 5)}
            >
              <span className={getClassNameNonTracking('load-count', statusInfo)}>
                {nonTrackingData.totalWithLoad || 0}
              </span>
              <span className={getClassNameNonTracking('load-label', statusInfo)}>
                {t("withLoad")}
              </span>
              {nonTrackingWithLoadHovered ? (
                <div className="hover-infobox breakdown">
                  {Object.entries(nonTrackingData.withLoad).map(
                    ([key, value], index) =>
                      index > 0 ? (
                        <div
                          className="non-tracking-breakdown-wrapper"
                          key={key}
                        >
                          <span className="non-tracking-breakdown-val">
                            {Number(value)}
                          </span>
                          <span className="non-tracking-breakdown-hours">
                            {breakdownLabelFormatter(key)}
                          </span>
                        </div>
                      ) : (
                        <></>
                      )
                  )}
                </div>
              ) : (
                <></>
              )}
            </div>
            <div
              className="non-tracking-data-without-load"
              onClick={() => handleTrackingAndNonTracking("nonTrackingWithoutLoad")}
              onMouseOver={() => setNonTrackingEmptyHovered(true)}
              onMouseLeave={() => setNonTrackingEmptyHovered(false)}
              style={getStyle(statusInfo, 6)}
            >
              <span className={getClassNameNonTracking('load-count', statusInfo)}>
                {nonTrackingData.totalWithoutLoad}
              </span>
              <span className={getClassNameNonTracking('load-label', statusInfo)}>
                {t("withoutLoad")}
              </span>
              {nonTrackingEmptyHovered ? (
                <div
                  className="hover-infobox breakdown"
                  style={{ display: "flex" }}
                >
                  {Object.entries(nonTrackingData.withoutLoad).map(
                    ([key, value], index) =>
                      index > 0 ? (
                        <div
                          className="non-tracking-breakdown-wrapper"
                          key={key}
                        >
                          <span className="non-tracking-breakdown-val">
                            {Number(value)}
                          </span>
                          <span className="non-tracking-breakdown-hours">
                            {breakdownLabelFormatter(key)}
                          </span>
                        </div>
                      ) : (
                        <></>
                      )
                  )}
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingStatus;
