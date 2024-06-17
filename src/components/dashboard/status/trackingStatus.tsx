import React, { useEffect, useState } from "react";
import ProgressBar from "../progressBars/progressBar";
import totalRakesIcon from "../../../assets/total_rakes.svg";
import trackingWithGPS from "../../../assets/tracking_icon.svg";
import nonTracking from "../../../assets/non_tracking_icon.svg";
import "./css/trackingStatus.css";
import forwardArrow from "../../../assets/forward_arrow_icon.svg";
import { httpsGet } from "@/utils/Communication";
import { useRouter } from "next/navigation";

const TrackingStatus = () => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [nonTrackingEmptyHovered, setNonTrackingEmptyHovered] = useState(false);
  const [nonTrackingWithLoadHovered, setNonTrackingWithLoadHovered] =
    useState(false);
  const [totalRakes, setTotalRakes] = useState(0);
  const [trackingPercent, setTrackingPercent] = useState(0);
  const [nonTrackingPercent, setNonTrackingPercent] = useState(0);
  const [schemeData, setSchemeData] = useState([
    {
      scheme: "",
      count: "",
      wagons: "",
    },
  ]);

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
    console.log(val, total);
    return (val / total) * 100;
  }

  useEffect(() => {
    httpsGet("all_tracking_rakes").then((response: any) => {
      if (response) {
        if (response.totalRakeCount) setTotalRakes(response.totalRakeCount);
        if (response.scheme) {
          setSchemeData(response.scheme);
        }
        if (response.trackingDetails) {
          if (response.trackingDetails.tracking) {
            const data = response.trackingDetails.tracking;
            setTrackingPercent(
              percentage(data.totalTracking, response.totalRakeCount)
            );
            console.log(trackingPercent);
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
            console.log(nonTrackingPercent);
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

  return (
    <div style={{ paddingLeft: "48px" }}>
      <div style={{ fontSize: "16px", fontWeight: "bold" }}>
        TRACKING STATUS
      </div>
      <div style={{ marginTop: "20px" }}>
        <div
          className="status-wrapper"
          onMouseOver={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            router.push('/MapsHelper');
          }}
        >
          <ProgressBar
            color={"#334FFC"}
            percent={100}
            count={totalRakes}
            name="Total Rakes"
            icon={totalRakesIcon}
            hoverIcon={forwardArrow}
            isHovered={isHovered}
          />
          <div style={{ display: "flex" }}>
            {schemeData.map((scheme) => (
              <div className="scheme-container" key={scheme.scheme}>
                <span className="total-rakes-split-count">
                  {scheme.count || 0}
                </span>
                <span style={{ color: "#71747A", fontSize: "10px" }}>
                  {scheme.scheme}
                </span>
                <div className="hover-infobox">
                  <span className="no-of-wagons">{scheme.wagons || 0}</span>
                  <span className="wagons-text">Wagons</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="status-wrapper">
          <ProgressBar
            color={"#18BE8A"}
            percent={trackingPercent}
            count={trackingData.totalTracking}
            name="Tracking with GPS"
            icon={trackingWithGPS}
          />
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginRight: "40px",
                marginLeft: "20px",
                paddingRight: "40px",
                borderRight: "1px solid #DFE3EB",
              }}
            >
              <span style={{ color: "#42454E" }}>
                {trackingData.withLoad || 0}
              </span>
              <span style={{ color: "#71747A", fontSize: "10px" }}>
                With Load
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <span style={{ color: "#42454E" }}>
                {trackingData.withoutLoad || 0}
              </span>
              <span style={{ color: "#71747A", fontSize: "10px" }}>Empty</span>
            </div>
          </div>
        </div>
        <div className="status-wrapper">
          <ProgressBar
            color={"#EA5950"}
            percent={nonTrackingPercent}
            count={nonTrackingData.totalTracking}
            name="Non Tracking"
            icon={nonTracking}
          />
          <div style={{ display: "flex" }}>
            <div
              className="non-tracking-data-with-load"
              onMouseOver={() => setNonTrackingWithLoadHovered(true)}
              onMouseLeave={() => setNonTrackingWithLoadHovered(false)}
            >
              <span style={{ color: "#42454E" }}>
                {nonTrackingData.totalWithLoad || 0}
              </span>
              <span style={{ color: "#71747A", fontSize: "10px" }}>
                With Load
              </span>
              {nonTrackingWithLoadHovered ? (
                <div className="hover-infobox breakdown">
                  {Object.entries(nonTrackingData.withLoad).map(
                    ([key, value]) => (
                      <div className="non-tracking-breakdown-wrapper" key={key}>
                        <span className="non-tracking-breakdown-val">
                          {Number(value)}
                        </span>
                        <span className="non-tracking-breakdown-hours">
                          {key}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <></>
              )}
            </div>
            <div
              className="non-tracking-data-without-load"
              onMouseOver={() => setNonTrackingEmptyHovered(true)}
              onMouseLeave={() => setNonTrackingEmptyHovered(false)}
            >
              <span style={{ color: "#42454E" }}>
                {nonTrackingData.totalWithoutLoad}
              </span>
              <span style={{ color: "#71747A", fontSize: "10px" }}>Empty</span>
              {nonTrackingEmptyHovered ? (
                <div
                  className="hover-infobox breakdown"
                  style={{ display: "flex" }}
                >
                  {Object.entries(nonTrackingData.withoutLoad).map(
                    ([key, value]) => (
                      <div className="non-tracking-breakdown-wrapper" key={key}>
                        <span className="non-tracking-breakdown-val">
                          {Number(value)}
                        </span>
                        <span className="non-tracking-breakdown-hours">
                          {key}
                        </span>
                      </div>
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
