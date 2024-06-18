import * as React from "react";
import Image from "next/image";
import "./css/progressBar.css"

export default function ProgressBar(props: any) {
  return (
    <div
      style={{ minWidth: "200px", marginLeft: "20px", marginBottom: "36px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{position:"relative",height:"42px"}}>
          <span style={{ fontSize: "24px", fontWeight: "bold" }}>
            {props.count}
          </span>
          <span
            style={{ fontSize: "12px", color: "#71747A", marginLeft: "8px" }}
          >
            {props.name}
          </span>
        </div>
        <div
          style={{ marginRight: "24px", display: "flex", alignItems: "center" }}
          className={props.isHovered ? "icon-container icon-container-hovered":"icon-container"}
        >
          <Image src={props.icon} alt="" className={props.isHovered ? "icon-before icon-before-hovered":"icon-before"} />
          {props.isHovered ? (
            <Image src={props.hoverIcon} alt="" style={{ marginLeft: "4px" }} className={props.isHovered ? "icon-after icon-after-hovered":"icon-after"}/>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div
        style={{
          height: "4px",
          marginRight: "24px",
          backgroundColor: props.color,
          opacity: 0.2,
          borderRadius: "12px",
          marginTop: "8px",
        }}
      />
      <div
        style={{
          height: "4px",
          width: `calc(${props.percent}% - 24px)`,
          marginRight: "24px",
          backgroundColor: props.color,
          borderRadius: "12px",
          marginTop: "-4px",
        }}
      />
    </div>
  );
}
