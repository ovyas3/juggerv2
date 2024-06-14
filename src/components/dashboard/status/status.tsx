import React from "react";
import rakesLoaded from "../../../assets/rakes_loaded_icon.svg";
import wagonsLoaded from "../../../assets/wagons_loaded_icon.svg"
import totalLoad from "../../../assets/total_load_icon.svg"
import freight from "../../../assets/freight_icon.svg"
import wagonsUnloaded from "../../../assets/wagons_unloaded_icon.svg"
import Image from "next/image";

const Status = () => {
  return (
    <div style={{ width: "55vw" }}>
      <div style={{fontSize:"16px",fontWeight:"bold"}}>STATUS</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              display: "flex",
              height: "120px",
              minWidth: "200px",
              alignItems: "center",
            }}
          >
            <Image src={rakesLoaded} height={48} width={48} alt="rake_icon" />
            <div style={{ marginLeft: "12px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: "20px",fontWeight:"bold", color: "#131722" }}>09/</div>
                <div style={{ fontSize: "12px", color: "#71747A" }}>10</div>
              </div>
              <span style={{ color: "#71747A", fontSize: "12px" }}>
                Rakes loaded
              </span>
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              height: "120px",
              minWidth: "200px",
              alignItems: "center",
            }}
          >
            <Image src={wagonsLoaded} height={48} width={48} alt="rake_icon" />
            <div style={{ marginLeft: "12px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: "20px",fontWeight:"bold", color: "#131722" }}>09/</div>
                <div style={{ fontSize: "12px", color: "#71747A" }}>10</div>
              </div>
              <span style={{ color: "#71747A", fontSize: "12px" }}>
                Wagons loaded
              </span>
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              height: "120px",
              minWidth: "200px",
              alignItems: "center",
            }}
          >
            <Image src={totalLoad} height={48} width={48} alt="rake_icon" />
            <div style={{ marginLeft: "12px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: "20px",fontWeight:"bold", color: "#131722" }}>09/</div>
                <div style={{ fontSize: "12px", color: "#71747A" }}>10</div>
              </div>
              <span style={{ color: "#71747A", fontSize: "12px" }}>
                Total load (MT)
              </span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              display: "flex",
              height: "120px",
              minWidth: "200px",
              alignItems: "center",
            }}
          >
            <Image src={freight} height={48} width={48} alt="rake_icon" />
            <div style={{ marginLeft: "12px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: "20px",fontWeight:"bold", color: "#131722" }}>09/</div>
                <div style={{ fontSize: "12px", color: "#71747A" }}>10</div>
              </div>
              <span style={{ color: "#71747A", fontSize: "12px" }}>
              Freight (Cr)
              </span>
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              height: "120px",
              minWidth: "200px",
              alignItems: "center",
            }}
          >
            <Image src={rakesLoaded} height={48} width={48} alt="rake_icon" />
            <div style={{ marginLeft: "12px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: "20px",fontWeight:"bold", color: "#131722" }}>09/</div>
                <div style={{ fontSize: "12px", color: "#71747A" }}>10</div>
              </div>
              <span style={{ color: "#71747A", fontSize: "12px" }}>
                Rakes unloaded
              </span>
            </div>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              height: "120px",
              minWidth: "200px",
              alignItems: "center",
            }}
          >
            <Image src={wagonsUnloaded} height={48} width={48} alt="rake_icon" />
            <div style={{ marginLeft: "12px" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: "20px",fontWeight:"bold", color: "#131722" }}>09/</div>
                <div style={{ fontSize: "12px", color: "#71747A" }}>10</div>
              </div>
              <span style={{ color: "#71747A", fontSize: "12px" }}>
                Wagons unloaded
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
