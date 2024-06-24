import * as React from "react";
import Image from "next/image";
import "./css/progressBar.css";

const ProgressBar = (props: any) => {
  return (
    <div
      className="progress-bar-wrapper"
    >
      <div
        className="progress-bar-container"
        onClick={() => {
            props.handleAllRakesAndTable(props.name);
        }}
        style={{ cursor: "pointer" }}
      >
        <div className="progress-info-container">
          <span
            className="progress-info-count"
          >
            {props.count}
          </span>
          <span
            className="progress-info-name"
          >
            {props.name}
          </span>
        </div>
        <div
          className={
            props.isHovered
              ? "icon-container icon-container-hovered"
              : "icon-container"
          }
        >
          <Image
            src={props.icon}
            alt=""
            className={
              props.isHovered
                ? "icon-before icon-before-hovered"
                : "icon-before"
            }
          />
          {props.isHovered ? (
            <Image
              src={props.hoverIcon}
              alt=""
              className={
                props.isHovered ? "icon-after icon-after-hovered" : "icon-after"
              }
            />
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

export default ProgressBar;