"use client";
import React from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

function BPCNotify() {
  const [notifyBefore, setNotifyBefore] = React.useState([
    { value: 0 },
    { value: 1 },
  ]);
  return (
    <div
      style={{
        height: "100%",
        marginTop: 24,
        fontSize: 12,
        display: "flex",
      }}
    >
      <div
        id="left-section-bpc"
        style={{
          width: "20%",
          height: "100%",
          borderRight: "1px solid #E5E5E5",
          overflowY: "scroll",
          minWidth: "280px",
        }}
      >
        <div id="bpc-km-input-container">
          <label>BPC km</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #E5E5E5",
              borderRadius: 4,
              height: 40,
              width: 200,
              justifyContent: "space-between",
              paddingInline: 4,
              marginTop: 8,
            }}
          >
            <header
              style={{
                height: 24,
                width: 36,
                textAlign: "center",
                alignContent: "center",
                borderRight: "1px solid #E5E5E5",
                marginBottom: 4,
              }}
            >
              &gt;
            </header>
            <input
              type="number"
              placeholder="Enter BPC KM"
              style={{
                width: 120,
                fontSize: 12,
                paddingInline: 4,
                border: "none",
                outline: "none",
              }}
            />
            <div
              style={{
                height: 32,
                width: 50,
                textAlign: "center",
                backgroundColor: "#F0F3F9",
                alignContent: "center",
                borderRadius: 6,
              }}
            >
              km
            </div>
          </div>
        </div>
        <h3 className="whatsApp-notify-title">BPC Due Date 30 Days</h3>
        <div
          id="bpc-notify-container"
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {notifyBefore.map((item, index) => {
            return (
              <div id="bpc-km-input-container">
                <label>Notify Before</label>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #E5E5E5",
                    borderRadius: 4,
                    height: 40,
                    width: 200,
                    justifyContent: "space-between",
                    paddingInline: 4,
                    marginTop: 8,
                    position: "relative",
                  }}
                >
                  <header
                    style={{
                      height: 24,
                      width: 36,
                      textAlign: "center",
                      alignContent: "center",
                      borderRight: "1px solid #E5E5E5",
                      marginTop: 4,
                    }}
                  >
                    <RemoveIcon style={{ height: 16, width: 16 }} />
                  </header>
                  <input
                    type="number"
                    placeholder="Enter Days"
                    style={{
                      width: 120,
                      fontSize: 12,
                      paddingInline: 4,
                      border: "none",
                      outline: "none",
                    }}
                  />
                  <div
                    style={{
                      height: 32,
                      width: 50,
                      textAlign: "center",
                      backgroundColor: "#F0F3F9",
                      alignContent: "center",
                      borderRadius: 6,
                    }}
                  >
                    days
                  </div>
                  {index === notifyBefore.length - 1 && (
                    <div
                      id="addButton"
                      style={{
                        position: "absolute",
                        color: "#334FFC",
                        width: 16,
                        height: 16,
                        border: "1px solid #334FFC",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        right: -25,
                      }}
                    >
                      <AddIcon style={{ height: 16, width: 16 }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div id="right-section-bpc">submit area</div>
    </div>
  );
}

export default BPCNotify;
