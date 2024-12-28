"use client";
import React from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

function BPCNotify() {
  const [notifyBefore, setNotifyBefore] = React.useState([
    { value: 0 },
    { value: 1 },
    { value: 2 },
  ]);
  const [emailList, setEmailList] = React.useState([
    { email: "" },
    { email: "" },
  ]);
  const [whatsAppList, setWhatsAppList] = React.useState([
    { number: 0, name: "" },
    { number: 0, name: "" },
  ]);
  const addNotifyBefore = () => {
    const newNotifyBefore = [...notifyBefore];
    newNotifyBefore.push({ value: 0 });
    setNotifyBefore(newNotifyBefore);
  };
  const removeNotifyBefore = (index: number) => {
    const newNotifyBefore = [...notifyBefore];
    newNotifyBefore.splice(index, 1);
    setNotifyBefore(newNotifyBefore);
  };
  const addEmail = () => {
    const newEmailList = [...emailList];
    newEmailList.push({ email: "" });
    setEmailList(newEmailList);
  };
  const removeEmail = (index: number) => {
    const newEmailList = [...emailList];
    newEmailList.splice(index, 1);
    setEmailList(newEmailList);
  };
  const addWhatappNumberName = () => {
    const newWhatsAppList = [...whatsAppList];
    newWhatsAppList.push({ number: 0, name: "" });
    setWhatsAppList(newWhatsAppList);
  };
  const removeWhatappNumberName = (index: number) => {
    const newWhatsAppList = [...whatsAppList];
    newWhatsAppList.splice(index, 1);
    setWhatsAppList(newWhatsAppList);
  };
  console.log(emailList);
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
              <div id="bpc-km-input-container" key={index}>
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
                    value={item.value || ""}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? "" : +e.target.value;
                      const newNotifyBefore = [...notifyBefore];
                      newNotifyBefore[index].value = +value;
                      setNotifyBefore(newNotifyBefore);
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
                        right: notifyBefore.length === 1 ? -25 : -50,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        addNotifyBefore();
                      }}
                    >
                      <AddIcon style={{ height: 16, width: 16 }} />
                    </div>
                  )}
                  {notifyBefore.length !== 1 && (
                    <div
                      id="addButton"
                      style={{
                        position: "absolute",
                        color: "#E6667B",
                        width: 16,
                        height: 16,
                        border: "1px solid #E6667B",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        right: -25,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        removeNotifyBefore(index);
                      }}
                    >
                      <CloseIcon style={{ height: 16, width: 16 }} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div id="right-section-bpc" style={{ paddingInline: 24 }}>
        <h3 className="bpc-header-notify">
          Notification Through WhatsApp / Email
        </h3>
        <div
          id="bpc-notify-container-email-list"
          style={{
            paddingTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {emailList.map((item, index) => {
            return (
              <div
                key={index}
                style={{
                  // backgroundColor: "red",
                  position: "relative",
                  width: 250,
                }}
              >
                <label>Email Address</label>
                <input
                  type="text"
                  placeholder="Enter Email Address"
                  style={{
                    width: 250,
                    border: "1px solid #E5E5E5",
                    borderRadius: 4,
                    height: 40,
                    marginTop: 8,
                    display: "block",
                    outline: "none",
                    paddingInline: 12,
                  }}
                  value={item.email || ""}
                  onChange={(e) => {
                    const newEmailList = [...emailList];
                    newEmailList[index].email = e.target.value;
                    setEmailList(newEmailList);
                  }}
                />
                {index === emailList.length - 1 && (
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
                      right: emailList.length === 1 ? -25 : -50,
                      top: 34,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      addEmail();
                    }}
                  >
                    <AddIcon style={{ height: 16, width: 16 }} />
                  </div>
                )}
                {emailList.length !== 1 && (
                  <div
                    id="addButton"
                    style={{
                      position: "absolute",
                      color: "#E6667B",
                      width: 16,
                      height: 16,
                      border: "1px solid #E6667B",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      right: -25,
                      cursor: "pointer",
                      top: 34,
                    }}
                    onClick={() => {
                      removeEmail(index);
                    }}
                  >
                    <CloseIcon style={{ height: 16, width: 16 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div
          id="bpc-notify-container-whatsapp-list"
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {whatsAppList.map((item, index) => {
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 20,
                  position: "relative",
                  width: "fit-content",
                  //   backgroundColor:'red'
                }}
              >
                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    style={{
                      width: 250,
                      border: "1px solid #E5E5E5",
                      borderRadius: 4,
                      height: 40,
                      marginTop: 8,
                      display: "block",
                      outline: "none",
                      paddingInline: 12,
                    }}
                  />
                </div>
                <div>
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter Phone Number"
                    style={{
                      width: 250,
                      border: "1px solid #E5E5E5",
                      borderRadius: 4,
                      height: 40,
                      marginTop: 8,
                      display: "block",
                      outline: "none",
                      paddingInline: 12,
                    }}
                  />
                </div>
                {index === whatsAppList.length - 1 && (
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
                      right: whatsAppList.length === 1 ? -25 : -50,
                      cursor: "pointer",
                      top: 35,
                    }}
                    onClick={() => {
                      addWhatappNumberName();
                    }}
                  >
                    <AddIcon style={{ height: 16, width: 16 }} />
                  </div>
                )}
                {whatsAppList.length !== 1 && (
                  <div
                    id="addButton"
                    style={{
                      position: "absolute",
                      color: "#E6667B",
                      width: 16,
                      height: 16,
                      border: "1px solid #E6667B",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      right: -25,
                      cursor: "pointer",
                      top: 35,
                    }}
                    onClick={() => {
                      removeWhatappNumberName(index);
                    }}
                  >
                    <CloseIcon style={{ height: 16, width: 16 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div id="bpc-notify-container-button-submit"
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginTop: 40,
            gap: 20,
          }}
        >
          <button
            id="bpc-notify-container-button-submit"
            style={{
              width: 200,
              height: 40,
              backgroundColor: "#334FFC",
              borderRadius: 4,
              color: "white",
              border: "none",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            submit
          </button>
          <button
            id="bpc-notify-container-button-clear"
            style={{
              width: 200,
              height: 40,
              backgroundColor: "white",
              borderRadius: 4,
              color: "#334FFC",
              border: "1px solid #334FFC",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            clear
          </button>
        </div>
      </div>
    </div>
  );
}

export default BPCNotify;
