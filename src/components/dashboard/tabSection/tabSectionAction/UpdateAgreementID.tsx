"use client";
import React, { useEffect, useState } from "react";
import "./UpdateAgreementID.css";
import CloseIcon from "@mui/icons-material/Close";
import CustomSearchSelect from "@/components/UI/CustomSearchSelect/CustomSearchSelect";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";
import { useWindowSize } from "@/utils/hooks";

function UpdateAgreementID({
  setUpdateAgreementModel,
}: {
  setUpdateAgreementModel: any;
}) {
  interface Rake {
    _id: string | number;
    value: string;
    rake_id: string;
    agreement_id: string;
  }
  const [selectedRake, setSelectedRake] = useState<Rake | null>(null);
  const [allCaptiveList, setAllCaptiveList] = useState<Rake[]>([]);
  const { showMessage } = useSnackbar();
  const isMobile = useWindowSize(420);

  console.log("sdvjbjfvks", isMobile);

  const getCaptiveRakeDetails = async () => {
    try {
      const response = await httpsGet("get/captive/rakes_ids");
      if (response && Array.isArray(response)) {
          setAllCaptiveList(response);
      }
    } catch (error) {
        console.error("Error fetching rake details:", error);
        showMessage("Failed to fetch rake details", "error");
    }
  };

  const handleUpdate = async () => {
    if (selectedRake === null) {
      showMessage("Please Select Rake", "warning");
      return;
    }
    if(selectedRake?.agreement_id === ''){
        showMessage('Please Enter The Agreement ID', 'error')
        return;
    }
    // if (!selectedRake?.rake_service_id) {
    //   showMessage("Rake Service Not Updated", "warning");
    //   return;
    // }
    let payload = {
      rake: selectedRake?._id,
      // rake: selectedRake.rake_id,
      agreement_id: selectedRake?.agreement_id,
    };
    try {
      const response = await httpsPost(
        "update/captive/agreement_id",
        payload
      );
      if (response.statusCode === 200) {
        showMessage("Agreement ID Updated", "success");
        setSelectedRake(null);
        setUpdateAgreementModel(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCaptiveRakeDetails();
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 300,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        e.stopPropagation();
        setUpdateAgreementModel(false);
      }}
    >
      <div
        style={{
          width: 450,
          height: 380,
          borderRadius: 10,
          backgroundColor: "white",
          position: "relative",
          padding: 20,
          marginInline: 20,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div id="closeContaionerUpdateAgreementID">
        <CloseIcon
            onClick={(e) => {
              e.stopPropagation();
              setUpdateAgreementModel(false);
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <header style={{ fontSize: 20, color: "#131722", fontWeight: 600 }}>
            Update Agreement ID
          </header>
        </div>

        <div style={{ marginTop: "20px" }}>
          <CustomSearchSelect
            label="Rake ID"
            options={allCaptiveList.map((item: any) => ({
              _id: item._id,
              value: item.rake_id,
              rake_id: item.rake_id,
              agreement_id: item.agreement_id
          }))}
            onChange={setSelectedRake}
          />
        </div>

          {selectedRake && (
          <div
            style={{ display: "flex", flexDirection: "column", marginTop: 24 }}
          >
            <label style={{ fontSize: 12 }}>Agreement ID</label>
            <input
              placeholder="Enter The Agreement ID"
              type="text"
              style={{
                width: "100%",
                padding: 8,
                border: "1px solid #DFE3EB",
                outline: "none",
                color: "black",
                borderRadius: 4,
                paddingBlock: 12,
                paddingInline: 12,
              }}
              value={selectedRake?.agreement_id || ""}
              onChange={(e) => {
                setSelectedRake({
                  ...selectedRake,
                  agreement_id: e.target.value,
                });
              }}
            />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom:24,
            minWidth: 'calc(100% - 45px)',
          }}
        >
          <div style={{
            display:'flex',
            flexDirection:isMobile ? 'row' : 'column',
            gap:isMobile? 24: 12,
          }}>
            <button
              style={{
                flex: 1,
                textTransform: "uppercase",
                backgroundColor: "white",
                border: "1px solid #3351FF",
                borderRadius: 8,
                paddingBlock: 10,
                color: "#3351FF",
                fontWeight: 600,
                cursor:'pointer'
              }}
              onClick={()=>{ setUpdateAgreementModel(false)}}
            >
              Clear
            </button>
            <button
              style={{
                flex: 1,
                textTransform: "uppercase",
                backgroundColor: "#3351FF",
                border: "none",
                borderRadius: 8,
                paddingBlock: 10,
                color: "white",
                fontWeight: 600,
                cursor:'pointer'
              }}
              onClick={(e) => {
                handleUpdate();
              }}
            >
             Update
           </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateAgreementID;
