import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "./DeleteContacts.css";
import { useTranslations } from "next-intl";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useSnackbar } from "@/hooks/snackBar";
import trash from "@/assets/trash_icon.png";
import Image from "next/image";

function EditContact({ contact, isClose, getContactDetails }: any) {
  const text = useTranslations("CONTACT");
  const [openReasonDropDown, setOpenReasonDropDown] = useState(false);
  const [comment, setComment] = useState<null | string>(null);
  const [reason, setReason] = useState<null | string>("Select Reason");
  const [rating, setRating] = useState<null | number>(0);
  const { showMessage } = useSnackbar();

  const deleteContact = async () => {
    try {
      const response = await httpsGet(
        `contact_details/deleteContactDetail?id=${contact.id}`
      );
      if (response.statusCode === 200) {
        showMessage("Contact Delete", "success");
        isClose(false);
        getContactDetails();
      }
    } catch (error) {
      console.log(error);
    }
  };

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
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={(e) => {
        e.stopPropagation();
        isClose(false);
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          width: 750,
          height: 550,
          borderRadius: 12,
          position: "relative",
          padding: 24,
        }}
        onClick={(e) => {
          e.stopPropagation();
          setOpenReasonDropDown(false);
        }}
      >
        <div
          id="close-btn-container"
          onClick={(e) => {
            e.stopPropagation();
            isClose(false);
          }}
        >
          <div>
            <CloseIcon style={{ height: 24, width: 24 }} />
          </div>
        </div>

        <header id="contactModalHeader">
          {text("deleteContactHeader")} - #{contact?.fnr}
        </header>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <Image
            src={trash.src}
            alt="recycle"
            width={72}
            height={72}
            style={{
              marginBottom: "16px",
              padding: 10,
            }}
          />
        </div>

        <div id='deleteStatus'>
          <div>
            <ul style={{listStyleType: 'none',display:'flex', flexDirection:'column',gap:12}}>
              <li>Station Name</li>
              <li>Contact Name</li>
              <li>Phone Number</li>
              <li>Contact Person Role</li>
            </ul>
          </div>
          <div style={{position:'absolute', left:'50%',}}>
            <ul style={{listStyleType: 'none',display:'flex', flexDirection:'column',gap:12}}>
              <li>:</li>
              <li>:</li>
              <li>:</li>
              <li>:</li>
            </ul>
          </div>
          <div>
            <ul style={{listStyleType: 'none',display:'flex', flexDirection:'column',gap:12, fontWeight:'bold'}}>
              <li>{contact?.stationName}</li>
              <li>{contact?.contactPersonName?.contactPersonName}</li>
              <li>{contact?.contact}</li>
              <li>{contact?.contactPersonRole}</li>
            </ul>
          </div>
        </div>

        <div style={{ textAlign:'center', fontSize:14, marginTop:70, fontWeight:'500'}}>Are you sure you want to Delete the Contact ?</div>

        <div id='delete-btn' onClick={()=>{deleteContact()}}>Delete</div>
      </div>
    </div>
  );
}

export default EditContact;
