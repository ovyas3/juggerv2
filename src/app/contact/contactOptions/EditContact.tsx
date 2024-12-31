import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "./EditContact.css";
import { useTranslations } from "next-intl";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import { httpsPost } from "@/utils/Communication";
import { useSnackbar } from '@/hooks/snackBar';


const reasons = [
  { value: "missing-wagons", label: "Missing Wagons" },
  { value: "delay", label: "Delay" },
  { value: "status-update", label: "Status update" },
  { value: "recovery", label: "Recovery of missing wagon" },
  { value: "others", label: "Others" },
];

function EditContact({ contact, isClose,getContactDetails }: any) {

  const text = useTranslations("CONTACT");
  const [openReasonDropDown, setOpenReasonDropDown] = useState(false);
  const [comment, setComment] = useState<null | string>(null);
  const [reason, setReason] = useState<null | string>('Select Reason');
  const [rating, setRating] = useState<null | number>(0);
  const { showMessage } = useSnackbar();
  const [customReason, setCustomReason] = useState<null | string>(null);

  const submitContact = async () => {
    if(reason === 'Others' && !customReason){
      showMessage('Please Enter Other Reason', 'error');
      return;
    }
    let payload = {
        id: contact.id, 
        comment,
        reason: reason === 'Others' ? customReason : reason,
        rating,
        phone_no: contact?.contact,
    }
    try {
        const response = await httpsPost('contact_details/editContactDetail', payload);
        if(response.statusCode === 200){
            showMessage('Contact Updated', 'success');
            isClose(false);
            getContactDetails();
        }
    } catch (error) {
        console.log(error);
    }
  }

  useEffect(()=>{
    setReason(contact?.reason);
    setComment(contact?.comment);
    setRating(contact?.rating);
  },[])

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
          width: 1000,
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
        <div id="close-btn-container" onClick={(e)=>{e.stopPropagation(); isClose(false)}}>
          <div>
            <CloseIcon style={{ height: 24, width: 24 }} />
          </div>
        </div>

        <header id="contactModalHeader">
          {text("contactModalHeaderEdit")} - #{contact?.fnr}
        </header>

        <div id="statusBar">
          <div>
            <label>{text("stationName")}</label>
            <header id="headerStatus">{contact?.stationName || "XXXXXXXXXX"}</header>
          </div>

          <div>
            <label>{text("name")}</label>
            <header id="headerStatus">{contact?.contactPersonName.contactPersonName || "XXXXXXXXXX"}</header>
          </div>

          <div>
            <label>{text("phoneNo")}</label>
            <header id="headerStatus">{contact?.contact || "XXXXXXXXXX"}</header>
          </div>

          <div>
            <label>{text("role")}</label>
            <header id="headerStatus">{contact?.contactPersonRole || "XXXXXXXXXX"}</header>
          </div>
        </div>

        <div id="editFiledContainer">
          <label id="editHeader">{text("reasons")}</label>
          <div
            id="stationNameInput"
            style={{ color: "black", fontSize: "13px" }}
            onClick={(e) => {
              e.stopPropagation();
              setOpenReasonDropDown(!openReasonDropDown);
            }}
          >
            {reason}
          </div>
          {openReasonDropDown && (
            <div id="stationDropDown">
              {reasons?.map((item: any, index: number) => (
                <div id="stationNameItem" style={{overflow:'hidden'}} key={index} onClick={() => {setReason(item.label)}}>
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {reason === "Others" && (
          <div id='editFiledContainer'>
            <label id="editHeader">{text("otherReasons")}</label>
            <div id="stationNameInput">
              <input onChange={(e)=>{setCustomReason(e.target.value)}} type="text" placeholder="Enter Your Reasons" style={{ width: "100%", border: "none", outline: "none", color: "black", fontSize: "12px", paddingBottom:'4px'}} />
            </div>
          </div>
        )}

        <div id="editFiledContainer">
          <label id="editHeader">{text("editComment")}</label>
          <div id="textAreaContainer">
            <textarea placeholder="Enter Your Edit Text" value={comment ?? ""} onChange={(e)=>{setComment(e.target.value)}} id="textArea" />
          </div>
        </div>

        <div id="editFiledContainer">
          <div>
            <label id="editHeader">{text("rate")}</label>
          </div>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <StarRateRoundedIcon
                key={value}
                onClick={() => setRating(value)}
                className={`star ${value <= (rating ?? 0) ? "selected" : ""}`}
                fontSize="medium"
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
        </div>


        <div id='btnContainerEdit' onClick={()=>{submitContact()}} >
            <div >{text('submit')}</div>
        </div>


      </div>
    </div>
  );
}

export default EditContact;
